/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkStep, CdkStepper} from '@angular/cdk/stepper';
import {
  Component,
  ContentChild,
  ContentChildren,
  // This import is only used to define a generic type. The current TypeScript version incorrectly
  // considers such imports as unused (https://github.com/Microsoft/TypeScript/issues/14953)
  // tslint:disable-next-line:no-unused-variable
  ElementRef,
  Inject,
  Optional,
  QueryList,
  SkipSelf,
  ViewChildren
}from '@angular/core';
import {MdStepLabel} from './step-label';
import {
  defaultErrorStateMatcher,
  ErrorOptions,
  MD_ERROR_GLOBAL_OPTIONS,
  ErrorStateMatcher
} from '../core/error/error-options';
import {FormControl, FormGroupDirective, NgForm} from '@angular/forms';

@Component({
  moduleId: module.id,
  selector: 'md-step, mat-step',
  templateUrl: 'step.html',
  providers: [{provide: MD_ERROR_GLOBAL_OPTIONS, useExisting: MdStep}]
})
export class MdStep extends CdkStep implements ErrorOptions {
  /** Content for step label given by <ng-template matStepLabel> or <ng-template mdStepLabel>. */
  @ContentChild(MdStepLabel) stepLabel: MdStepLabel;

  /** Original ErrorStateMatcher that checks the validity of form control. */
  private _originalErrorStateMatcher: ErrorStateMatcher;

  constructor(mdStepper: MdStepper,
              @Optional() @SkipSelf() @Inject(MD_ERROR_GLOBAL_OPTIONS) errorOptions: ErrorOptions) {
    super(mdStepper);
    this._originalErrorStateMatcher =
        errorOptions ? errorOptions.errorStateMatcher || defaultErrorStateMatcher
            : defaultErrorStateMatcher;
  }

  /** Custom error state matcher that additionally checks for validity of interacted form. */
  errorStateMatcher = (control: FormControl, form: FormGroupDirective | NgForm) => {
    let originalErrorState = this._originalErrorStateMatcher(control, form);

    // Custom error state checks for the validity of form that is not submitted or touched
    // since user can trigger a form change by calling for another step without directly
    // interacting with the current form.
    let customErrorState =  control.invalid && this.interacted;

    return originalErrorState || customErrorState;
  }
}

export class MdStepper extends CdkStepper implements ErrorOptions {
  /** The list of step headers of the steps in the stepper. */
  @ViewChildren('stepHeader') _stepHeader: QueryList<ElementRef>;

  /** Steps that the stepper holds. */
  @ContentChildren(MdStep) _steps: QueryList<MdStep>;
}
