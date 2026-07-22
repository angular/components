import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

/**
 * @title Testing with MatFormFieldHarness
 */
@Component({
  selector: 'form-field-harness-example',
  templateUrl: 'form-field-harness-example.html',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldHarnessExample {
  readonly requiredControl = new FormControl('Initial value', [Validators.required]);
}
