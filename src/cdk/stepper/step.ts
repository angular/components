/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component, ContentChild, Input, TemplateRef, ViewChild
} from '@angular/core';
import {CdkStepLabel} from './step-label';

@Component({
  selector: 'cdk-step',
  templateUrl: 'step.html',
})
export class CdkStep {
  /** Template for step label if it exists. */
  @ContentChild(CdkStepLabel) stepLabel: CdkStepLabel;

  /** Template for step content. */
  @ViewChild(TemplateRef) content: TemplateRef<any>;

  /** Label of the step. */
  @Input()
  label: string;

  /** Whether the step is the last one in the list. */
  _isLast: boolean = false;
}
