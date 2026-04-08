/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  ElementRef,
  Input,
  booleanAttribute,
  numberAttribute,
  inject,
} from '@angular/core';
import {ENTER, SPACE} from '@angular/cdk/keycodes';
import {MAT_CHIP} from './tokens';
import {_CdkPrivateStyleLoader} from '@angular/cdk/private';
import {_StructuralStylesLoader} from '../core';

/**
 * A non-interactive section of a chip.
 * @docs-private
 */
@Directive({
  selector: '[matChipContent]',
  host: {
    'class':
      'mat-mdc-chip-action mdc-evolution-chip__action mdc-evolution-chip__action--presentational',
    '[class.mdc-evolution-chip__action--primary]': '_isPrimary',
    '[class.mdc-evolution-chip__action--secondary]': '!_isPrimary',
    '[class.mdc-evolution-chip__action--trailing]': '!_isPrimary && !_isLeading',
    '[attr.disabled]': '_getDisabledAttribute()',
    '[attr.aria-disabled]': 'disabled',
  },
})
export class MatChipContent {
  _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected _parentChip = inject<{
    _handlePrimaryActionInteraction(): void;
    remove(): void;
    disabled: boolean;
    _edit(event: Event): void;
    _isEditing?: boolean;
  }>(MAT_CHIP);

  /** Whether this is the primary action in the chip. */
  _isPrimary = true;

  /** Whether this is the leading action in the chip. */
  _isLeading = false; // TODO(adolgachev): consolidate usage to secondary css class

  /** Whether the action is disabled. */
  @Input({transform: booleanAttribute})
  get disabled(): boolean {
    return this._disabled || this._parentChip?.disabled || false;
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }
  private _disabled = false;

  /** Tab index of the action. */
  @Input({
    transform: (value: unknown) => (value == null ? -1 : numberAttribute(value)),
  })
  tabIndex: number = -1;

  /**
   * Private API to allow focusing this chip when it is disabled.
   */
  @Input()
  _allowFocusWhenDisabled = false;

  /**
   * Determine the value of the disabled attribute for this chip action.
   */
  protected _getDisabledAttribute(): string | null {
    // When this chip action is disabled and focusing disabled chips is not permitted, return empty
    // string to indicate that disabled attribute should be included.
    return this.disabled && !this._allowFocusWhenDisabled ? '' : null;
  }

  constructor(...args: unknown[]);

  constructor() {
    inject(_CdkPrivateStyleLoader).load(_StructuralStylesLoader);
    if (this._elementRef.nativeElement.nodeName === 'BUTTON') {
      this._elementRef.nativeElement.setAttribute('type', 'button');
    }
  }

  focus() {
    this._elementRef.nativeElement.focus();
  }
}

/**
 * Interactive section of a chip.
 * @docs-private
 */
@Directive({
  selector: '[matChipAction]',
  host: {
    '[attr.tabindex]': '_getTabindex()',
    '[class.mdc-evolution-chip__action--presentational]': 'false',
    '(click)': '_handleClick($event)',
    '(keydown)': '_handleKeydown($event)',
  },
})
export class MatChipAction extends MatChipContent {
  /**
   * Determine the value of the tabindex attribute for this chip action.
   */
  protected _getTabindex(): string | null {
    return this.disabled && !this._allowFocusWhenDisabled ? null : this.tabIndex.toString();
  }

  _handleClick(event: MouseEvent) {
    if (!this.disabled && this._isPrimary) {
      event.preventDefault();
      this._parentChip._handlePrimaryActionInteraction();
    }
  }

  _handleKeydown(event: KeyboardEvent) {
    if (
      (event.keyCode === ENTER || event.keyCode === SPACE) &&
      !this.disabled &&
      this._isPrimary &&
      !this._parentChip._isEditing
    ) {
      event.preventDefault();
      this._parentChip._handlePrimaryActionInteraction();
    }
  }
}
