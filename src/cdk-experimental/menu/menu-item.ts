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
 * Directive which provides behaviour for an element which when clicked either:
 *  - executes the user defined click handler
 *  - toggles it's checkbox state
 *  - toggles it's radio button state (in relation to siblings)
 *  - opens up an attached submenu
 */
@Directive({
  selector: '[cdkMenuItem], [cdkMenuTriggerFor]',
  exportAs: 'cdkMenuItem',
  host: {
    'type': 'button',
    '[attr.role]': 'role',
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

  /** Whether the menu item opens a menu */
  opensMenu() {
    return !!this._menuPanel;
  }

  /** Cleanup event emitters */
  ngOnDestroy() {
    this.opened.complete();
  }
}
