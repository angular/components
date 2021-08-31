/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkMenuModule} from '@angular/cdk-experimental/menu';
import {NgModule} from '@angular/core';
import {MatMenuBarModule} from '@angular/material-experimental/menubar';
import {RouterModule} from '@angular/router';

import {DemoMenu, DemoMenuItem, MatMenuBarDemo} from './mat-menubar-demo';

@NgModule({
  imports: [
    CdkMenuModule,
    MatMenuBarModule,
    RouterModule.forChild([{path: '', component: MatMenuBarDemo}]),
  ],
  declarations: [MatMenuBarDemo, DemoMenu, DemoMenuItem],
})
export class MatMenuBarDemoModule {
}
