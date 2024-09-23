/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, Input, TemplateRef, inject} from '@angular/core';
import {StepState} from '@angular/cdk/stepper';

/** Template context available to an attached `matStepperIcon`. */
export interface MatStepperIconContext {
  /** Index of the step. */
  index: number;
  /** Whether the step is currently active. */
  active: boolean;
  /** Whether the step is optional. */
  optional: boolean;
}

/**
 * Template to be used to override the icons inside the step header.
 */
@Directive({
  selector: 'ng-template[matStepperIcon]',
  standalone: true,
})
export class MatStepperIcon {
  templateRef = inject<TemplateRef<MatStepperIconContext>>(TemplateRef);

  /** Name of the icon to be overridden. */
  @Input('matStepperIcon') name: StepState;

  constructor(...args: unknown[]);
  constructor() {}
}
