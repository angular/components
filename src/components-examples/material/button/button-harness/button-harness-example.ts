import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title Testing with MatButtonHarness
 */
@Component({
  selector: 'button-harness-example',
  templateUrl: 'button-harness-example.html',
  imports: [MatButtonModule],
})
export class ButtonHarnessExample {
  clicked = false;
}
