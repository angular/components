import {Component, forwardRef, inject} from '@angular/core';
import {CdkStepper, CdkStepperModule} from '@angular/cdk/stepper';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgTemplateOutlet} from '@angular/common';

/** @title A custom CDK linear stepper with forms */
@Component({
  selector: 'cdk-linear-stepper-with-form-example',
  templateUrl: './cdk-linear-stepper-with-form-example.html',
  styleUrl: './cdk-linear-stepper-with-form-example.css',
  imports: [
    forwardRef(() => CustomLinearStepper),
    CdkStepperModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class CdkLinearStepperWithFormExample {
  private readonly _formBuilder = inject(FormBuilder);

  isLinear = true;
  firstFormGroup = this._formBuilder.group({
    firstControl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondControl: ['', Validators.required],
  });

  toggleLinearity() {
    this.isLinear = !this.isLinear;
  }
}

/** Custom CDK linear stepper component */
@Component({
  selector: 'example-custom-linear-stepper',
  templateUrl: './example-custom-linear-stepper.html',
  styleUrl: './example-custom-linear-stepper.css',
  providers: [{provide: CdkStepper, useExisting: CustomLinearStepper}],
  imports: [NgTemplateOutlet, CdkStepperModule],
})
export class CustomLinearStepper extends CdkStepper {
  selectStepByIndex(index: number): void {
    this.selectedIndex = index;
  }
}
