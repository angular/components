/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkStep, CdkStepper} from '@angular/cdk/stepper';
import {
  AfterContentInit,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  forwardRef,
  Inject,
  Input,
  QueryList,
  SkipSelf,
  ViewChildren,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import {FormControl, FormGroupDirective, NgForm} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatStepHeader} from './step-header';
import {MatStepLabel} from './step-label';
import {matStepperAnimations} from './stepper-animations';
import {takeUntil} from 'rxjs/operators/takeUntil';

/** Possible orientations for the Material stepper. */
export type MatStepperOrientation = 'horizontal' | 'vertical';

@Component({
  moduleId: module.id,
  selector: 'mat-step',
  templateUrl: 'step.html',
  providers: [{provide: ErrorStateMatcher, useExisting: MatStep}],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matStep',
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatStep extends CdkStep implements ErrorStateMatcher {
  /** Content for step label given by <ng-template matStepLabel>. */
  @ContentChild(MatStepLabel) stepLabel: MatStepLabel;

  constructor(@Inject(forwardRef(() => MatStepper)) stepper: MatStepper,
              @SkipSelf() private _errorStateMatcher: ErrorStateMatcher) {
    super(stepper);
  }

  /** Custom error state matcher that additionally checks for validity of interacted form. */
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const originalErrorState = this._errorStateMatcher.isErrorState(control, form);

    // Custom error state checks for the validity of form that is not submitted or touched
    // since user can trigger a form change by calling for another step without directly
    // interacting with the current form.
    const customErrorState = !!(control && control.invalid && this.interacted);

    return originalErrorState || customErrorState;
  }
}

@Component({
  moduleId: module.id,
  selector: 'mat-stepper, [matStepper]',
  templateUrl: 'stepper.html',
  styleUrls: ['stepper.css'],
  inputs: ['selectedIndex'],
  exportAs: 'matStepper',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: matStepperAnimations,
  host: {
    '[class.mat-stepper-horizontal]': 'orientation === "horizontal"',
    '[class.mat-stepper-vertical]': 'orientation === "vertical"',
    '[attr.aria-orientation]': 'orientation',
    'role': 'tablist',
  },
})
export class MatStepper extends CdkStepper implements AfterContentInit {
  /** The list of step headers of the steps in the stepper. */
  @ViewChildren(MatStepHeader, {read: ElementRef}) _stepHeader: QueryList<ElementRef>;

  /** Steps that the stepper holds. */
  @ContentChildren(MatStep) _steps: QueryList<MatStep>;

  /** Orientation of the stepper. */
  @Input() orientation: MatStepperOrientation = 'vertical';

  ngAfterContentInit() {
    // Mark the component for change detection whenever the content children query changes
    this._steps.changes.pipe(takeUntil(this._destroyed)).subscribe(() => this._stateChanged());
  }
}

@Component({
  moduleId: module.id,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'stepper.html',
  styleUrls: ['stepper.css'],
  selector: 'mat-horizontal-stepper',
  exportAs: 'matHorizontalStepper',
  animations: matStepperAnimations,
  providers: [{provide: MatStepper, useExisting: MatHorizontalStepper}],
  host: {
    'class': 'mat-stepper-horizontal',
    'aria-orientation': 'horizontal',
    'role': 'tablist',
  },
})
export class MatHorizontalStepper extends MatStepper implements OnInit {
  ngOnInit() {
    this.orientation = 'horizontal';
  }
}

@Component({
  moduleId: module.id,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'stepper.html',
  styleUrls: ['stepper.css'],
  selector: 'mat-vertical-stepper',
  exportAs: 'matVerticalStepper',
  providers: [{provide: MatStepper, useExisting: MatVerticalStepper}],
  animations: matStepperAnimations,
  host: {
    'class': 'mat-stepper-vertical',
    'aria-orientation': 'vertical',
    'role': 'tablist',
  },
})
export class MatVerticalStepper extends MatStepper implements OnInit {
  ngOnInit() {
    this.orientation = 'vertical';
  }
}
