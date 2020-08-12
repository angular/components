/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
import {
  AfterContentInit,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  NgZone,
  OnDestroy,
  QueryList
} from '@angular/core';
import {RippleConfig, RippleRenderer, RippleTarget, setLines} from '@angular/material/core';
import {Subscription} from 'rxjs';
import {startWith} from 'rxjs/operators';

function toggleClass(el: Element, className: string, on: boolean) {
  if (on) {
    el.classList.add(className);
  } else {
    el.classList.remove(className);
  }
}

@Directive()
/** @docs-private */
export abstract class MatListItemBase implements AfterContentInit, OnDestroy, RippleTarget {
  /** Query list matching list-item line elements. */
  abstract lines: QueryList<ElementRef<Element>>;

  /** Element reference referring to the primary list item text. */
  abstract _itemText: ElementRef<HTMLElement>;

  @Input()
  get disableRipple(): boolean {
    return this.disabled || this._disableRipple || this._listBase.disableRipple;
  }
  set disableRipple(value: boolean) { this._disableRipple = coerceBooleanProperty(value); }
  private _disableRipple: boolean = false;

  /** Whether the list-item is disabled. */
  @HostBinding('class.mdc-list-item--disabled')
  @HostBinding('attr.aria-disabled')
  @Input()
  get disabled(): boolean { return this._disabled || (this._listBase && this._listBase.disabled); }
  set disabled(value: boolean) { this._disabled = coerceBooleanProperty(value); }
  private _disabled = false;

  private _subscriptions = new Subscription();
  private _rippleRenderer: RippleRenderer|null = null;

  /**
   * Implemented as part of `RippleTarget`.
   * @docs-private
   */
  rippleConfig: RippleConfig = {};

  /**
   * Implemented as part of `RippleTarget`.
   * @docs-private
   */
  get rippleDisabled(): boolean { return this.disableRipple; }

  constructor(public _elementRef: ElementRef<HTMLElement>, protected _ngZone: NgZone,
              private _listBase: MatListBase, private _platform: Platform) {
    if (!this._listBase._isNonInteractive) {
      this._initInteractiveListItem();
    }

    // Only interactive list items are commonly focusable, but in some situations,
    // consumers provide a custom tabindex. We still would want to have strong focus
    // indicator support in such scenarios.
    this._elementRef.nativeElement.classList.add('mat-mdc-focus-indicator');

    // If no type attributed is specified for a host `<button>` element, set it to
    // "button". If a type attribute is already specified, do nothing. We do this
    // for backwards compatibility with the old list.
    // TODO: Determine if we intend to continue doing this for the MDC-based list.
    const element = _elementRef.nativeElement;
    if (element.nodeName.toLowerCase() === 'button' && !element.hasAttribute('type')) {
      element.setAttribute('type', 'button');
    }
  }

  ngAfterContentInit() {
    this._monitorLines();
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    if (this._rippleRenderer !== null) {
      this._rippleRenderer._removeTriggerEvents();
    }
  }

  /** Gets the label for the list item. This is used for the typeahead. */
  _getItemLabel(): string {
    return this._itemText ? (this._itemText.nativeElement.textContent || '') : '';
  }

  /** Gets the host element of the list item. */
  _getHostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  private _initInteractiveListItem() {
    this._elementRef.nativeElement.classList.add('mat-mdc-list-item-interactive');
    this._rippleRenderer =
        new RippleRenderer(this, this._ngZone, this._elementRef.nativeElement, this._platform);
    this._rippleRenderer.setupTriggerEvents(this._elementRef.nativeElement);
  }

  /**
   * Subscribes to changes in `MatLine` content children and annotates them
   * appropriately when they change.
   */
  private _monitorLines() {
    this._ngZone.runOutsideAngular(() => {
      this._subscriptions.add(this.lines.changes.pipe(startWith(this.lines))
          .subscribe((lines: QueryList<ElementRef<Element>>) => {
            this._elementRef.nativeElement.classList
                .toggle('mat-mdc-list-item-single-line', lines.length <= 1);
            lines.forEach((line: ElementRef<Element>, index: number) => {
              toggleClass(line.nativeElement,
                  'mdc-list-item__primary-text', index === 0 && lines.length > 1);
              toggleClass(line.nativeElement, 'mdc-list-item__secondary-text', index !== 0);
            });
            setLines(lines, this._elementRef, 'mat-mdc');
          }));
    });
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_disableRipple: BooleanInput;
}

@Directive()
/** @docs-private */
export abstract class MatListBase {
  @HostBinding('class.mdc-list--non-interactive')
  _isNonInteractive: boolean = true;

  /** Whether ripples for all list items is disabled. */
  @Input()
  get disableRipple(): boolean { return this._disableRipple; }
  set disableRipple(value: boolean) { this._disableRipple = coerceBooleanProperty(value); }
  private _disableRipple: boolean = false;

  /** Whether all list items are disabled. */
  @HostBinding('attr.aria-disabled')
  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) { this._disabled = coerceBooleanProperty(value); }
  private _disabled = false;

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_disableRipple: BooleanInput;
}
