import {Component} from '@angular/core';
import {MatButtonToggleAppearance, MatButtonToggleModule} from '@angular/material/button-toggle';

/**
 * @title Testing with MatButtonToggleHarness
 */
@Component({
  selector: 'button-toggle-harness-example',
  templateUrl: 'button-toggle-harness-example.html',
  standalone: true,
  imports: [MatButtonToggleModule],
})
export class ButtonToggleHarnessExample {
  disabled = false;
  appearance: MatButtonToggleAppearance = 'standard';
}
