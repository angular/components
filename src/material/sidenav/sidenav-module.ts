/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {BidiModule} from '@angular/cdk/bidi';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {NgModule} from '@angular/core';
import {MatDrawer, MatDrawerContainer, MatDrawerContent} from './drawer';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from './sidenav';

@NgModule({
  imports: [
    CdkScrollableModule,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
  ],
  exports: [
    BidiModule,
    CdkScrollableModule,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
  ],
})
export class MatSidenavModule {}
