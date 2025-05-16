/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CdkAccordionExample} from '@angular/components-examples/cdk-experimental/accordion';

@Component({
  templateUrl: 'cdk-accordion-demo.html',
  imports: [CdkAccordionExample],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkExperimentalAccordionDemo {}
