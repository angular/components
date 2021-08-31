/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayModule} from '@angular/cdk/overlay';
import {NgModule} from '@angular/core';

import {CdkContextMenuTrigger} from './context-menu';
import {CdkMenu} from './menu';
import {CdkTargetMenuAim} from './menu-aim';
import {CdkMenuBar} from './menu-bar';
import {CdkMenuGroup} from './menu-group';
import {CdkMenuItem} from './menu-item';
import {CdkMenuItemCheckbox} from './menu-item-checkbox';
import {CdkMenuItemRadio} from './menu-item-radio';
import {CdkMenuItemTrigger} from './menu-item-trigger';
import {CdkMenuPanel} from './menu-panel';

const EXPORTED_DECLARATIONS = [
  CdkMenuBar,
  CdkMenu,
  CdkMenuPanel,
  CdkMenuItem,
  CdkMenuItemRadio,
  CdkMenuItemCheckbox,
  CdkMenuItemTrigger,
  CdkMenuGroup,
  CdkContextMenuTrigger,
  CdkTargetMenuAim,
];
@NgModule({
  imports: [OverlayModule],
  exports: EXPORTED_DECLARATIONS,
  declarations: EXPORTED_DECLARATIONS,
})
export class CdkMenuModule {
}
