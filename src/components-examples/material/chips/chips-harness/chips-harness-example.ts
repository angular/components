/// <reference types="jasmine" />

import {Component, signal} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';

/**
 * @title Testing with MatChipsHarness
 */
@Component({
  selector: 'chips-harness-example',
  templateUrl: 'chips-harness-example.html',
  imports: [MatChipsModule, MatIconModule],
})
export class ChipsHarnessExample {
  isDisabled = signal(false);
  remove: () => void = jasmine.createSpy('remove spy');
  add: () => void = jasmine.createSpy('add spy');
}
