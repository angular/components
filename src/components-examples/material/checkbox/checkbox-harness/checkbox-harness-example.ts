import {Component, input} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';

/**
 * @title Testing with MatCheckboxHarness
 */
@Component({
  selector: 'checkbox-harness-example',
  templateUrl: 'checkbox-harness-example.html',
  imports: [MatCheckboxModule],
})
export class CheckboxHarnessExample {
  readonly disabled = input(true);
}
