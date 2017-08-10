/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import {coerceBooleanProperty, SelectionModel} from '../core';
import {FocusKeyManager} from '../core/a11y/focus-key-manager';
import {Subscription} from 'rxjs/Subscription';
import {SPACE} from '../core/keyboard/keycodes';
import {FocusableOption} from '../core/a11y/focus-key-manager';
import {MdListOption, MdSelectionListOptionEvent} from './list-option';
import {CanDisable, mixinDisabled} from '../core/common-behaviors/disabled';
import {RxChain, switchMap, startWith} from '../core/rxjs/index';
import {merge} from 'rxjs/observable/merge';

export class MdSelectionListBase {}
export const _MdSelectionListMixinBase = mixinDisabled(MdSelectionListBase);

@Component({
  moduleId: module.id,
  selector: 'md-selection-list, mat-selection-list',
  inputs: ['disabled'],
  host: {
    'role': 'listbox',
    '[attr.tabindex]': '_tabIndex',
    'class': 'mat-selection-list',
    '(focus)': 'focus()',
    '(keydown)': '_keydown($event)',
    '[attr.aria-disabled]': 'disabled.toString()'},
  template: '<ng-content></ng-content>',
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdSelectionList extends _MdSelectionListMixinBase
  implements FocusableOption, CanDisable, AfterContentInit, OnDestroy {
  private _disableRipple: boolean = false;

  /** Tab index for the selection-list. */
  _tabIndex = 0;

  /** Subscription to all list options' onFocus events */
  private _optionFocusSubscription: Subscription;

  /** Subscription to all list options' destroy events  */
  private _optionDestroyStream: Subscription;

  /** The FocusKeyManager which handles focus. */
  _keyManager: FocusKeyManager;

  /** The option components contained within this selection-list. */
  @ContentChildren(MdListOption) options;

  /** options which are selected. */
  selectedOptions: SelectionModel<MdListOption> = new SelectionModel<MdListOption>(true);

  /**
   * Whether the ripple effect should be disabled on the list-items or not.
   * This flag only has an effect for `mat-selection-list` components.
   */
  @Input()
  get disableRipple() { return this._disableRipple; }
  set disableRipple(value: boolean) { this._disableRipple = coerceBooleanProperty(value); }

  constructor(private _element: ElementRef) {
    super();
  }

  ngAfterContentInit(): void {
    this._keyManager = new FocusKeyManager(this.options).withWrap();

    if (this.disabled) {
      this._tabIndex = -1;
    }

    this._optionFocusSubscription = this._onFocusSubscription();
    this._optionDestroyStream = this._onDestroySubscription();
  }

  ngOnDestroy(): void {
    if (this._optionDestroyStream) {
      this._optionDestroyStream.unsubscribe();
    }

    if (this._optionFocusSubscription) {
      this._optionFocusSubscription.unsubscribe();
    }
  }

  focus() {
    this._element.nativeElement.focus();
  }

  /**
   * Map all the options' destroy event subscriptions and merge them into one stream.
   */
  private _onDestroySubscription(): Subscription {
    return RxChain.from(this.options.changes)
      .call(startWith, this.options)
      .call(switchMap, (options: MdListOption[]) => {
        return merge(...options.map(option => option.destroyed));
      }).subscribe((e: MdSelectionListOptionEvent) => {
        let optionIndex: number = this.options.toArray().indexOf(e.option);
        if (e.option._hasFocus) {
          // Check whether the option is the last item
          if (optionIndex < this.options.length - 1) {
            this._keyManager.setActiveItem(optionIndex);
          } else if (optionIndex - 1 >= 0) {
            this._keyManager.setActiveItem(optionIndex - 1);
          }
        }
        e.option.destroyed.unsubscribe();
      });
  }

  /**
   * Map all the options' onFocus event subscriptions and merge them into one stream.
   */
  private _onFocusSubscription(): Subscription {
    return RxChain.from(this.options.changes)
      .call(startWith, this.options)
      .call(switchMap, (options: MdListOption[]) => {
        return merge(...options.map(option => option.onFocus));
      }).subscribe((e: MdSelectionListOptionEvent) => {
      let optionIndex: number = this.options.toArray().indexOf(e.option);
      this._keyManager.updateActiveItemIndex(optionIndex);
    });
  }

  /** Passes relevant key presses to our key manager. */
  _keydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case SPACE:
        this._toggleSelectOnFocusedOption();
        // Always prevent space from scrolling the page since the list has focus
        event.preventDefault();
        break;
      default:
        this._keyManager.onKeydown(event);
    }
  }

  /** Toggles the selected state of the currently focused option. */
  private _toggleSelectOnFocusedOption(): void {
    let focusedIndex = this._keyManager.activeItemIndex;

    if (focusedIndex != null && this._isValidIndex(focusedIndex)) {
      let focusedOption: MdListOption = this.options.toArray()[focusedIndex];

      if (focusedOption) {
        focusedOption.toggle();
      }
    }
  }

  /**
   * Utility to ensure all indexes are valid.
   *
   * @param index The index to be checked.
   * @returns True if the index is valid for our list of options.
   */
  private _isValidIndex(index: number): boolean {
    return index >= 0 && index < this.options.length;
  }
}
