/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {ENTER, SPACE} from '@angular/cdk/keycodes';
import {Directive, ElementRef, Inject, Input} from '@angular/core';
import {HasTabIndex, mixinTabIndex} from '@angular/material/core';
import {MAT_CHIP} from './tokens';

abstract class _MatChipActionBase {
  abstract disabled: boolean;
}

const _MatChipActionMixinBase = mixinTabIndex(_MatChipActionBase, -1);

/**
 * Section within a chip.
 * @docs-private
 */
@Directive({
  selector: '[matChipAction]',
  inputs: ['disabled', 'tabIndex'],
  host: {
    'class': 'mdc-evolution-chip__action mat-mdc-chip-action',
    '[class.mdc-evolution-chip__action--primary]': '_isPrimary',
    '[class.mdc-evolution-chip__action--presentational]': '!isInteractive',
    '[class.mdc-evolution-chip__action--trailing]': '!_isPrimary',
    '[attr.tabindex]': '_getTabindex()',
    '[attr.disabled]': '_getDisabledAttribute()',
    '[attr.aria-disabled]': 'disabled',
    '(click)': '_handleClick($event)',
    '(keydown)': '_handleKeydown($event)',
  },
})
export class MatChipAction extends _MatChipActionMixinBase implements HasTabIndex {
  /** Whether the action is interactive. */
  @Input() isInteractive = true;

  /** Whether this is the primary action in the chip. */
  _isPrimary = true;

  /** Whether the action is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled || this._parentChip.disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  /**
   * Private API to allow focusing this chip when it is disabled.
   */
  @Input()
  private _allowFocusWhenDisabled = false;

  /**
   * Determine the value of the disabled attribute for this chip action.
   */
  protected _getDisabledAttribute(): string | null {
    // When this chip action is disabled and focusing disabled chips is not permitted, return empty
    // string to indicate that disabled attribute should be included.
    return this.disabled && !this._allowFocusWhenDisabled ? '' : null;
  }

  /**
   * Determine the value of the tabindex attribute for this chip action.
   */
  protected _getTabindex(): string | null {
    return (this.disabled && !this._allowFocusWhenDisabled) || !this.isInteractive
      ? null
      : this.tabIndex.toString();
  }

  constructor(
    public _elementRef: ElementRef<HTMLElement>,
    @Inject(MAT_CHIP)
    protected _parentChip: {
      _handlePrimaryActionInteraction(): void;
      remove(): void;
      disabled: boolean;
    },
  ) {
    super();

    if (_elementRef.nativeElement.nodeName === 'BUTTON') {
      _elementRef.nativeElement.setAttribute('type', 'button');
    }
  }

  focus() {
    this._elementRef.nativeElement.focus();
  }

  _handleClick(event: MouseEvent) {
    if (!this.disabled && this.isInteractive && this._isPrimary) {
      event.preventDefault();
      this._parentChip._handlePrimaryActionInteraction();
    }
  }

  _handleKeydown(event: KeyboardEvent) {
    if (
      (event.keyCode === ENTER || event.keyCode === SPACE) &&
      !this.disabled &&
      this.isInteractive &&
      this._isPrimary
    ) {
      event.preventDefault();
      this._parentChip._handlePrimaryActionInteraction();
    }
  }
}
