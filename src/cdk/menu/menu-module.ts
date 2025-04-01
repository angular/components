/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {CdkMenu} from './menu';
import {CdkMenuBar} from './menu-bar';
import {CdkMenuItem} from './menu-item';
import {CdkMenuGroup} from './menu-group';
import {CdkMenuItemRadio} from './menu-item-radio';
import {CdkMenuItemCheckbox} from './menu-item-checkbox';
import {CdkMenuTrigger} from './menu-trigger';
import {CdkContextMenuTrigger} from './context-menu-trigger';
import {CdkTargetMenuAim} from './menu-aim';

const MENU_DIRECTIVES = [
  CdkMenuBar,
  CdkMenu,
  CdkMenuItem,
  CdkMenuItemRadio,
  CdkMenuItemCheckbox,
  CdkMenuTrigger,
  CdkMenuGroup,
  CdkContextMenuTrigger,
  CdkTargetMenuAim,
];

/** Module that declares components and directives for the CDK menu. */
@NgModule({
  imports: [OverlayModule, ...MENU_DIRECTIVES],
  exports: MENU_DIRECTIVES,
})
export class CdkMenuModule {}
