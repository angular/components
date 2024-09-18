import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MatTimepicker} from './timepicker';

describe('MatTimepicker', () => {
  it('TODO', () => {
    const fixture = TestBed.createComponent(BasicTimepicker);
    expect(fixture).toBeTruthy();
  });
});

@Component({
  template: '<mat-timepicker/>',
  standalone: true,
  imports: [MatTimepicker],
})
class BasicTimepicker {}
