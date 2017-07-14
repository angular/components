/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ContentChild, TemplateRef, ViewChild} from '@angular/core';
import {CdkStep} from '@angular/cdk';
import {MdStepLabel} from './step-label';

@Component({
  moduleId: module.id,
  selector: 'md-step, mat-step',
  templateUrl: 'step.html',
  inputs: ['label'],
})
export class MdStep extends CdkStep {
  /** Content for the step label given by <ng-template mat-step-label>. */
  @ContentChild(MdStepLabel) stepLabel: MdStepLabel;

  /** Template inside the MdStep view that contains an <ng-content>. */
  @ViewChild(TemplateRef) content: TemplateRef<any>;
}
