/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, booleanAttribute} from '@angular/core';
import {CdkMenuItem} from './menu-item';

/** Base class providing checked state for selectable MenuItems. */
@Directive({
  host: {
    '[attr.aria-checked]': '!!checked',
    '[attr.aria-disabled]': 'disabled || null',
  },
})
export abstract class CdkMenuItemSelectable extends CdkMenuItem {
  /** Whether the element is checked */
  @Input({alias: 'cdkMenuItemChecked', transform: booleanAttribute}) checked: boolean = false;

  /** Whether the item should close the menu if triggered by the spacebar. */
  protected override closeOnSpacebarTrigger = false;
}
