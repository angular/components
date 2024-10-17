/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CDK_MENU, CdkMenu, CdkMenuGroup, CdkMenuItem, CdkMenuModule} from '@angular/cdk/menu';
import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {MatMenuBarModule} from '@angular/material-experimental/menubar';

// TODO: Remove the fake when mat-menu is re-built with CdkMenu directives
@Component({
  selector: 'demo-menu',
  exportAs: 'demoMenu',
  template: '<ng-content></ng-content>',
  host: {
    '[tabindex]': 'isInline ? 0 : null',
    'role': 'menu',
    'class': 'cdk-menu mat-menu mat-menu-panel',
    '[class.cdk-menu-inline]': 'isInline',
    '[attr.aria-orientation]': 'orientation',
  },
  providers: [
    {provide: CdkMenuGroup, useExisting: DemoMenu},
    {provide: CDK_MENU, useExisting: DemoMenu},
  ],
  styleUrl: 'mat-menubar-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoMenu extends CdkMenu {}

// TODO: Remove the fake when mat-menu-item is re-built with CdkMenu directives
@Component({
  selector: 'demo-menu-item',
  exportAs: 'demoMenuItem',
  host: {
    '[tabindex]': '_tabindex',
    'type': 'button',
    'role': 'menuitem',
    'class': 'cdk-menu-item mat-menu-item',
    '[attr.aria-disabled]': 'disabled || null',
  },
  template: '<ng-content></ng-content>',
  styleUrl: 'mat-menubar-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoMenuItem extends CdkMenuItem {}

@Component({
  templateUrl: 'mat-menubar-demo.html',
  imports: [CdkMenuModule, MatMenuBarModule, DemoMenu, DemoMenuItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatMenuBarDemo {}
