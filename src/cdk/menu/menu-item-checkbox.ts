/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive} from '@angular/core';
import {CdkMenuItemSelectable} from './menu-item-selectable';
import {CdkMenuItem} from './menu-item';

/**
 * A directive providing behavior for the "menuitemcheckbox" ARIA role, which behaves similarly to a
 * conventional checkbox.
 */
@Directive({
  selector: '[cdkMenuItemCheckbox]',
  exportAs: 'cdkMenuItemCheckbox',
  host: {
    'role': 'menuitemcheckbox',
    '[class.cdk-menu-item-checkbox]': 'true',
  },
  providers: [
    {provide: CdkMenuItemSelectable, useExisting: CdkMenuItemCheckbox},
    {provide: CdkMenuItem, useExisting: CdkMenuItemSelectable},
  ],
})
export class CdkMenuItemCheckbox extends CdkMenuItemSelectable {
  /**
   * Toggle the checked state of the checkbox.
   * @param options Options the configure how the item is triggered
   *   - keepOpen: specifies that the menu should be kept open after triggering the item.
   */
  override trigger(options?: {keepOpen: boolean}) {
    super.trigger(options);

    if (!this.disabled) {
      this.checked = !this.checked;
    }
  }
}
