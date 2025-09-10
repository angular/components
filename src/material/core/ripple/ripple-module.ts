/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BidiModule} from '@angular/cdk/bidi';
import {NgModule} from '@angular/core';
import {MatRipple} from './ripple';

@NgModule({
  imports: [MatRipple],
  exports: [MatRipple, BidiModule],
})
export class MatRippleModule {}
