/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {BidiModule} from '@angular/cdk/bidi';
import {MatRippleModule} from '../core';
import {MatButton} from './button';
import {MatFabButton, MatMiniFabButton} from './fab';
import {MatIconButton} from './icon-button';

@NgModule({
  imports: [MatRippleModule, MatButton, MatMiniFabButton, MatIconButton, MatFabButton],
  exports: [BidiModule, MatButton, MatMiniFabButton, MatIconButton, MatFabButton],
})
export class MatButtonModule {}
