/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Output, Input, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {CdkMenuPanel} from './menu-panel';

/**
 * Directive which provides behavior for an element which when clicked:
 *  If located in a CdkMenuBar:
 *    - opens up an attached submenu
 *
 *  If located in a CdkMenu, one of:
 *    - executes the user defined click handler
 *    - toggles its checkbox state
 *    - toggles its radio button state (in relation to siblings)
 *
 * If it's in a CdkMenu and it triggers a sub-menu, hovering over the
 * CdkMenuItem will open the submenu.
 *
 */
@Directive({
  selector: '[cdkMenuItem], [cdkMenuTriggerFor]',
  exportAs: 'cdkMenuItem',
  host: {
    'type': 'button',
    '[attr.role]': 'role',
    '[attr.aria-checked]': '_ariaChecked',
  },
})
export class CdkMenuItem implements OnDestroy {
  /** Template reference variable to the menu this trigger opens */
  @Input('cdkMenuTriggerFor') _menuPanel: CdkMenuPanel;

  /** ARIA role for the menu item. */
  @Input() role: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox' = 'menuitem';

  /** Whether the checkbox or radiobutton is checked */
  @Input() checked: boolean;

  /** Emits when the attached submenu is opened */
  @Output() opened: Subject<void> = new Subject();

  /** get the aria-checked value only if element is `menuitemradio` or `menuitemcheckbox` */
  get _ariaChecked(): boolean | null {
    if (this.role === 'menuitem') {
      return null;
    }
    return this.checked;
  }

  /** Whether the menu item opens a menu */
  opensMenu() {
    return !!this._menuPanel;
  }

  /** Cleanup event emitters */
  ngOnDestroy() {
    this.opened.complete();
  }
}
