import {Component, signal} from '@angular/core';
import {form, required, FormField} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatStepperModule} from '@angular/material/stepper';

/**
 * @title Stepper using signal forms
 */
@Component({
  selector: 'stepper-signal-forms-example',
  templateUrl: 'stepper-signal-forms-example.html',
  styleUrl: 'stepper-signal-forms-example.css',
  imports: [FormField, MatButtonModule, MatFormFieldModule, MatInputModule, MatStepperModule],
})
export class StepperSignalFormsExample {
  readonly nameFormGroup = form(signal({name: ''}), tree => {
    required(tree.name);
  });

  readonly adddressFormGroup = form(signal({address: ''}), tree => {
    required(tree.address);
  });

  readonly isLinear = signal(false);
}
