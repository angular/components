import {Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

/**
 * @title Testing with MatSlideToggleHarness
 */
@Component({
  selector: 'slide-toggle-harness-example',
  templateUrl: 'slide-toggle-harness-example.html',
  standalone: true,
  imports: [MatSlideToggleModule, FormsModule, ReactiveFormsModule],
})
export class SlideToggleHarnessExample {
  disabled = true;
  ctrl = new FormControl(true);
}
