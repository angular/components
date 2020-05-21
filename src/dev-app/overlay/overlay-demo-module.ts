/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {OverlayModule} from '@angular/cdk/overlay';
import {CdkOverlayExamplesModule} from '@angular/components-examples/cdk/overlay';

import {OverlayDemo} from './overlay-demo';

@NgModule({
  imports: [
    OverlayModule,
    CdkOverlayExamplesModule,
    RouterModule.forChild([{path: '', component: OverlayDemo}]),
  ],
  declarations: [OverlayDemo],
})
export class OverlayDemoModule {}
