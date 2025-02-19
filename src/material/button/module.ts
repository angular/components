/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MatButton} from './button';
import {MatFabButton, MatMiniFabButton} from './fab';
import {MatIconButton} from './icon-button';

@NgModule({
  imports: [
    MatCommonModule,
    MatRippleModule,
    MatButton,
    MatMiniFabButton,
    MatIconButton,
    MatFabButton,
  ],
  exports: [MatCommonModule, MatButton, MatMiniFabButton, MatIconButton, MatFabButton],
})
export class MatButtonModule {}
