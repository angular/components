/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {
  CdkAccordionConfigurableExample,
  CdkAccordionDisabledExample,
  CdkAccordionDisabledFocusableExample,
  CdkAccordionDisabledSkippedExample,
  CdkAccordionMultiExpansionExample,
  CdkAccordionSingleExpansionExample,
} from '@angular/components-examples/cdk-experimental/accordion';

@Component({
  templateUrl: 'cdk-accordion-demo.html',
  styleUrl: 'cdk-accordion-demo.css',
  imports: [
    CdkAccordionConfigurableExample,
    CdkAccordionSingleExpansionExample,
    CdkAccordionMultiExpansionExample,
    CdkAccordionDisabledFocusableExample,
    CdkAccordionDisabledSkippedExample,
    CdkAccordionDisabledExample,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkExperimentalAccordionDemo {}
