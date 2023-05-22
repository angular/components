import {Component} from '@angular/core';
import {MatStepperModule} from '@angular/material/stepper';

/**
 * @title Testing with MatStepperHarness
 */
@Component({
  selector: 'stepper-harness-example',
  templateUrl: 'stepper-harness-example.html',
  standalone: true,
  imports: [MatStepperModule],
})
export class StepperHarnessExample {}
