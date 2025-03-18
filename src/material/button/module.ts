/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '../core';
import {MatAnchor, MatButton} from './button';
import {MatFabAnchor, MatFabButton, MatMiniFabAnchor, MatMiniFabButton} from './fab';
import {MatIconAnchor, MatIconButton} from './icon-button';

@NgModule({
  imports: [
    MatCommonModule,
    MatRippleModule,
    MatAnchor,
    MatButton,
    MatIconAnchor,
    MatMiniFabAnchor,
    MatMiniFabButton,
    MatIconButton,
    MatFabAnchor,
    MatFabButton,
  ],
  exports: [
    MatAnchor,
    MatButton,
    MatIconAnchor,
    MatIconButton,
    MatMiniFabAnchor,
    MatMiniFabButton,
    MatFabAnchor,
    MatFabButton,
    MatCommonModule,
  ],
})
export class MatButtonModule {}
