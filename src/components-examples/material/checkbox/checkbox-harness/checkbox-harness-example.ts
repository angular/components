import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';

/**
 * @title Testing with MatCheckboxHarness
 */
@Component({
  selector: 'checkbox-harness-example',
  templateUrl: 'checkbox-harness-example.html',
  standalone: true,
  imports: [MatCheckboxModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxHarnessExample {
  readonly disabled = input(true);
}
