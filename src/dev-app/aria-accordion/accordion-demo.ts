/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {
  AccordionConfigurableExample,
  AccordionDisabledExample,
  AccordionDisabledFocusableExample,
  AccordionDisabledSkippedExample,
  AccordionMultiExpansionExample,
  AccordionSingleExpansionExample,
} from '@angular/components-examples/aria/accordion';

@Component({
  templateUrl: 'accordion-demo.html',
  styleUrl: 'accordion-demo.css',
  imports: [
    AccordionConfigurableExample,
    AccordionSingleExpansionExample,
    AccordionMultiExpansionExample,
    AccordionDisabledFocusableExample,
    AccordionDisabledSkippedExample,
    AccordionDisabledExample,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionDemo {}
