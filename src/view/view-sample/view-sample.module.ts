/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { NgModule } from '@angular/core';
import { IXViewSampleComponent } from './view-sample.component';
import { MatCommonModule } from '@angular/material';

@NgModule({
  imports: [
    MatCommonModule
  ],
  exports: [
    IXViewSampleComponent,
    MatCommonModule
  ],
  declarations: [IXViewSampleComponent]
})
export class ViewSampleModule { }
