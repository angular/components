/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { NgModule } from '@angular/core';
import { IXComponentSampleComponent } from './component-sample.component';
import { MatCommonModule } from '@angular/material';

@NgModule({
  imports: [
    MatCommonModule
  ],
  exports: [
    IXComponentSampleComponent,
    MatCommonModule
  ],
  declarations: [IXComponentSampleComponent]
})
export class ComponentSampleModule { }
