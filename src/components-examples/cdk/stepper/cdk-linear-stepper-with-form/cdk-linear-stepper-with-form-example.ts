import {Component, forwardRef} from '@angular/core';
import {CdkStepper, CdkStepperModule} from '@angular/cdk/stepper';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgTemplateOutlet, NgFor} from '@angular/common';

/** @title A custom CDK linear stepper with forms */
@Component({
  selector: 'cdk-linear-stepper-with-form-example',
  templateUrl: './cdk-linear-stepper-with-form-example.html',
  styleUrls: ['./cdk-linear-stepper-with-form-example.css'],
  standalone: true,
  imports: [
    forwardRef(() => CustomLinearStepper),
    CdkStepperModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class CdkLinearStepperWithFormExample {
  isLinear = true;
  firstFormGroup = this._formBuilder.group({
    firstControl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondControl: ['', Validators.required],
  });

  constructor(private readonly _formBuilder: FormBuilder) {}

  toggleLinearity() {
    this.isLinear = !this.isLinear;
  }
}

/** Custom CDK linear stepper component */
@Component({
  selector: 'example-custom-linear-stepper',
  templateUrl: './example-custom-linear-stepper.html',
  styleUrls: ['./example-custom-linear-stepper.css'],
  providers: [{provide: CdkStepper, useExisting: CustomLinearStepper}],
  standalone: true,
  imports: [NgTemplateOutlet, CdkStepperModule, NgFor],
})
export class CustomLinearStepper extends CdkStepper {
  selectStepByIndex(index: number): void {
    this.selectedIndex = index;
  }
}
