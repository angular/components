/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BidiModule} from '@angular/cdk/bidi';
import {NgModule} from '@angular/core';
import {MatDivider} from './divider';

@NgModule({
  imports: [MatDivider],
  exports: [MatDivider, BidiModule],
})
export class MatDividerModule {}
