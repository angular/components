/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {CdkMenuModule} from '@angular/cdk/menu';
import {MatMenuBar} from './menubar';
import {MatMenuBarItem} from './menubar-item';

@NgModule({
  imports: [CdkMenuModule, MatMenuBar, MatMenuBarItem],
  exports: [MatMenuBar, MatMenuBarItem],
})
export class MatMenuBarModule {}
