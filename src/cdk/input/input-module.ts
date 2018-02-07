/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformModule} from '@angular/cdk/platform';
import {NgModule} from '@angular/core';
import {AutofillMonitor, CdkAutofill} from './autofill';


@NgModule({
  declarations: [CdkAutofill],
  imports: [PlatformModule],
  exports: [CdkAutofill],
  providers: [AutofillMonitor],
})
export class InputModule {}
