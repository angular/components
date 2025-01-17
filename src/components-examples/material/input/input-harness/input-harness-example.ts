import {Component, signal} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

/**
 * @title Testing with MatInputHarness
 */
@Component({
  selector: 'input-harness-example',
  templateUrl: 'input-harness-example.html',
  imports: [MatFormFieldModule, MatInputModule],
})
export class InputHarnessExample {
  inputType = signal('number');
  disabled = signal(false);
}
