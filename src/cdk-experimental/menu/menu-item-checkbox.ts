/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {CdkMenuItemSelectable} from './menu-item-selectable';

/**
 * Directive which provides simple checkbox behavior to an element it is applied to.
 */
@Directive({
  selector: '[cdkMenuItemCheckbox]',
  exportAs: 'cdkMenuItemCheckbox',
  host: {
    '(click)': 'trigger()',
    'type': 'button',
    'role': 'menuitemcheckbox',
    '[attr.aria-checked]': 'checked',
    '[attr.aria-disabled]': 'disabled || null',
  },
  providers: [{provide: CdkMenuItemSelectable, useExisting: CdkMenuItemCheckbox}],
})
export class CdkMenuItemCheckbox extends CdkMenuItemSelectable {
  trigger() {
    super.trigger();

    if (!this.disabled) {
      this.checked = !this.checked;
    }
  }
}
