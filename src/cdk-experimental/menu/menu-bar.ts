/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, ElementRef, OnDestroy} from '@angular/core';
import {CdkMenuGroup} from './menu-group';
import {CDK_MENU, Menu} from './menu-interface';
import {OpenMenuTracker} from './menu-tree-service';

/**
 * Directive applied to an element which configures it as a MenuBar by setting the appropriate
 * role, aria attributes, and accessible keyboard and mouse handling logic. The component that
 * this directive is applied to should contain components marked with CdkMenuItem.
 *
 */
@Directive({
  selector: '[cdkMenuBar]',
  exportAs: 'cdkMenuBar',
  host: {
    'role': 'menubar',
    '[attr.aria-orientation]': 'orientation',
  },
  providers: [
    {provide: CdkMenuGroup, useExisting: CdkMenuBar},
    {provide: CDK_MENU, useExisting: CdkMenuBar},
  ],
})
export class CdkMenuBar extends CdkMenuGroup implements Menu, OnDestroy {
  /**
   * Sets the aria-orientation attribute and determines where menus will be opened.
   * Does not affect styling/layout.
   */
  @Input('cdkMenuBarOrientation') orientation: 'horizontal' | 'vertical' = 'horizontal';

  /** Keep track of the open menus in the menu tree. */
  _openMenuTracker = new OpenMenuTracker();

  constructor(elementRef: ElementRef<HTMLElement>) {
    super();

    this._openMenuTracker.push(elementRef.nativeElement);
  }
}
