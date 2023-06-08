import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatStepperModule} from '@angular/material/stepper';

/**
 * @title Stepper lazy content rendering
 */
@Component({
  selector: 'stepper-lazy-content-example',
  templateUrl: 'stepper-lazy-content-example.html',
  standalone: true,
  imports: [MatStepperModule, MatButtonModule],
})
export class StepperLazyContentExample {}
