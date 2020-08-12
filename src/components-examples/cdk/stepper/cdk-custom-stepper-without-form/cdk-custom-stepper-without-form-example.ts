import {CdkStepper} from '@angular/cdk/stepper';
import {Component} from '@angular/core';

/** @title A custom CDK stepper without a form */
@Component({
  selector: 'cdk-custom-stepper-without-form-example',
  templateUrl: 'cdk-custom-stepper-without-form-example.html',
})
export class CdkCustomStepperWithoutFormExample {}

/** Custom CDK stepper component */
@Component({
  selector: 'example-custom-stepper',
  templateUrl: 'example-custom-stepper.html',
  styleUrls: ['example-custom-stepper.css'],
  providers: [{ provide: CdkStepper, useExisting: CustomStepper }]
})
export class CustomStepper extends CdkStepper {
  onClick(index: number): void {
    this.selectedIndex = index;
  }
}
