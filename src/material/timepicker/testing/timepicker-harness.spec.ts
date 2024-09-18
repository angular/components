import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatTimepicker} from '@angular/material/timepicker';
import {MatTimepickerHarness} from './timepicker-harness';

describe('MatTimepicker', () => {
  let fixture: ComponentFixture<TimepickerHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TimepickerHarnessTest],
    });

    fixture = TestBed.createComponent(TimepickerHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should be able to load timepicker harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(MatTimepickerHarness);
    expect(harnesses.length).toBe(2);
  });
});

@Component({
  template: `
    <mat-timepicker/>
    <mat-timepicker/>
  `,
  standalone: true,
  imports: [MatTimepicker],
})
class TimepickerHarnessTest {}
