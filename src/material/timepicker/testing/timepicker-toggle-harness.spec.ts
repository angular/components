import {Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {DateAdapter, provideNativeDateAdapter} from '@angular/material/core';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatTimepicker, MatTimepickerInput, MatTimepickerToggle} from '@angular/material/timepicker';
import {MatTimepickerToggleHarness} from './timepicker-toggle-harness';

describe('MatTimepickerToggleHarness', () => {
  let fixture: ComponentFixture<TimepickerHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideNativeDateAdapter()],
      imports: [NoopAnimationsModule, TimepickerHarnessTest],
    });

    const adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('en-US');
    fixture = TestBed.createComponent(TimepickerHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should be able to load timepicker toggle harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(MatTimepickerToggleHarness);
    expect(harnesses.length).toBe(2);
  });

  it('should get the open state of a timepicker toggle', async () => {
    const toggle = await loader.getHarness(MatTimepickerToggleHarness.with({selector: '#one'}));
    expect(await toggle.isTimepickerOpen()).toBe(false);

    await toggle.openTimepicker();
    expect(await toggle.isTimepickerOpen()).toBe(true);
  });

  it('should get the disabled state of a toggle', async () => {
    const toggle = await loader.getHarness(MatTimepickerToggleHarness.with({selector: '#one'}));
    expect(await toggle.isDisabled()).toBe(false);

    fixture.componentInstance.disabled.set(true);
    expect(await toggle.isDisabled()).toBe(true);
  });
});

@Component({
  template: `
    <input [matTimepicker]="onePicker">
    <mat-timepicker #onePicker/>
    <mat-timepicker-toggle id="one" [for]="onePicker" [disabled]="disabled()"/>

    <input [matTimepicker]="twoPicker">
    <mat-timepicker #twoPicker/>
    <mat-timepicker-toggle id="two" [for]="twoPicker" [disabled]="disabled()"/>
  `,
  standalone: true,
  imports: [MatTimepickerInput, MatTimepicker, MatTimepickerToggle],
})
class TimepickerHarnessTest {
  disabled = signal(false);
}
