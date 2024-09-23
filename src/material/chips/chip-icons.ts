/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ENTER, SPACE} from '@angular/cdk/keycodes';
import {Directive} from '@angular/core';
import {MatChipAction} from './chip-action';
import {MAT_CHIP_AVATAR, MAT_CHIP_REMOVE, MAT_CHIP_TRAILING_ICON} from './tokens';

/** Avatar image within a chip. */
@Directive({
  selector: 'mat-chip-avatar, [matChipAvatar]',
  host: {
    'class': 'mat-mdc-chip-avatar mdc-evolution-chip__icon mdc-evolution-chip__icon--primary',
    'role': 'img',
  },
  providers: [{provide: MAT_CHIP_AVATAR, useExisting: MatChipAvatar}],
  standalone: true,
})
export class MatChipAvatar {}

/** Non-interactive trailing icon in a chip. */
@Directive({
  selector: 'mat-chip-trailing-icon, [matChipTrailingIcon]',
  host: {
    'class':
      'mat-mdc-chip-trailing-icon mdc-evolution-chip__icon mdc-evolution-chip__icon--trailing',
    'aria-hidden': 'true',
  },
  providers: [{provide: MAT_CHIP_TRAILING_ICON, useExisting: MatChipTrailingIcon}],
  standalone: true,
})
export class MatChipTrailingIcon extends MatChipAction {
  /**
   * MDC considers all trailing actions as a remove icon,
   * but we support non-interactive trailing icons.
   */
  override isInteractive = false;

  override _isPrimary = false;
}

/**
 * Directive to remove the parent chip when the trailing icon is clicked or
 * when the ENTER key is pressed on it.
 *
 * Recommended for use with the Material Design "cancel" icon
 * available at https://material.io/icons/#ic_cancel.
 *
 * Example:
 *
 * ```
 * <mat-chip>
 *   <mat-icon matChipRemove>cancel</mat-icon>
 * </mat-chip>
 * ```
 */

@Directive({
  selector: '[matChipRemove]',
  host: {
    'class':
      'mat-mdc-chip-remove mat-mdc-chip-trailing-icon mat-focus-indicator ' +
      'mdc-evolution-chip__icon mdc-evolution-chip__icon--trailing',
    'role': 'button',
    '[attr.aria-hidden]': 'null',
  },
  providers: [{provide: MAT_CHIP_REMOVE, useExisting: MatChipRemove}],
  standalone: true,
})
export class MatChipRemove extends MatChipAction {
  override _isPrimary = false;

  override _handleClick(event: MouseEvent): void {
    if (!this.disabled) {
      event.stopPropagation();
      event.preventDefault();
      this._parentChip.remove();
    }
  }

  override _handleKeydown(event: KeyboardEvent) {
    if ((event.keyCode === ENTER || event.keyCode === SPACE) && !this.disabled) {
      event.stopPropagation();
      event.preventDefault();
      this._parentChip.remove();
    }
  }
}
