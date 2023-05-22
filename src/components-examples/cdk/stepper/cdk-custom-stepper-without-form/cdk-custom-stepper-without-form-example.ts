import {Component, forwardRef} from '@angular/core';
import {CdkStepper, CdkStepperModule} from '@angular/cdk/stepper';
import {NgTemplateOutlet, NgFor} from '@angular/common';

/** @title A custom CDK stepper without a form */
@Component({
  selector: 'cdk-custom-stepper-without-form-example',
  templateUrl: './cdk-custom-stepper-without-form-example.html',
  styleUrls: ['./cdk-custom-stepper-without-form-example.css'],
  standalone: true,
  imports: [forwardRef(() => CustomStepper), CdkStepperModule],
})
export class CdkCustomStepperWithoutFormExample {}

/** Custom CDK stepper component */
@Component({
  selector: 'example-custom-stepper',
  templateUrl: './example-custom-stepper.html',
  styleUrls: ['./example-custom-stepper.css'],
  providers: [{provide: CdkStepper, useExisting: CustomStepper}],
  standalone: true,
  imports: [NgTemplateOutlet, CdkStepperModule, NgFor],
})
export class CustomStepper extends CdkStepper {
  selectStepByIndex(index: number): void {
    this.selectedIndex = index;
  }
}
