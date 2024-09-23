/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {CDK_MENU, CdkMenuBar, CdkMenuGroup, MENU_STACK, MenuStack} from '@angular/cdk/menu';

/**
 * A material design Menubar adhering to the functionality of CdkMenuBar. MatMenubar
 * should contain MatMenubarItems which trigger their own sub-menus.
 */
@Component({
  selector: 'mat-menubar',
  exportAs: 'matMenubar',
  templateUrl: 'menubar.html',
  styleUrl: 'menubar.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.mat-menubar]': 'true',
  },
  providers: [
    {provide: CdkMenuGroup, useExisting: MatMenuBar},
    {provide: CdkMenuBar, useExisting: MatMenuBar},
    {provide: CDK_MENU, useExisting: MatMenuBar},
    {provide: MENU_STACK, useClass: MenuStack},
  ],
  standalone: true,
})
export class MatMenuBar extends CdkMenuBar {}
