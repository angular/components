import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';

/**
 * @title Testing with MatChipsHarness
 */
@Component({
  selector: 'chips-harness-example',
  templateUrl: 'chips-harness-example.html',
  standalone: true,
  imports: [MatChipsModule, MatIconModule],
})
export class ChipsHarnessExample {
  isDisabled = false;
  remove: () => void = jasmine.createSpy('remove spy');
  add: () => void = jasmine.createSpy('add spy');
}
