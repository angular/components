/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkAccordion} from './accordion';
import {CdkAccordionItem} from './accordion-item';

const ACCORDION_DIRECTIVES = [CdkAccordion, CdkAccordionItem];

@NgModule({
  imports: ACCORDION_DIRECTIVES,
  exports: ACCORDION_DIRECTIVES,
})
export class CdkAccordionModule {}
