/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {CdkAccordion} from './accordion';
import {CdkAccordionItem} from './accordion-item';

@NgModule({
  imports: [CdkAccordion, CdkAccordionItem],
  exports: [CdkAccordion, CdkAccordionItem],
})
export class CdkAccordionModule {}
