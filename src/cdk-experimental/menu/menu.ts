/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, Output, OnDestroy} from '@angular/core';
import {CdkMenuItem} from './menu-item';
import {Subject} from 'rxjs';

/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessable keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
@Directive({
  selector: '[cdkMenu]',
  exportAs: 'cdkMenu',
  host: {
    'role': 'menubar',
    '[attr.aria-orientation]': '_orientation',
  },
})
export class CdkMenu implements OnDestroy {
  /**
   * Orientation of the menu - does not affect styling/layout.
   * Sets the aria-orientation attribute and determines where sub-menus will be opened.
   */
  @Input('cdkMenuOrientation') orientation: 'horizontal' | 'vertical' = 'vertical';

  /** Event emitted when the menu is closed. */
  @Output() readonly closed: Subject<void | 'click' | 'tab' | 'escape'> = new Subject();

  /** Emits the activated element when checkbox or radiobutton state changed  */
  @Output() change: Subject<CdkMenuItem>;

  /** Cleanup event emitters */
  ngOnDestroy() {
    this.closed.complete();
    this.change.complete();
  }
}
