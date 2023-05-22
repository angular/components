import {Component} from '@angular/core';
import {MatRadioModule} from '@angular/material/radio';

/**
 * @title Testing with MatRadioHarness
 */
@Component({
  selector: 'radio-harness-example',
  templateUrl: 'radio-harness-example.html',
  standalone: true,
  imports: [MatRadioModule],
})
export class RadioHarnessExample {}
