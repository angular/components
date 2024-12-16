import {Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {DateAdapter, provideNativeDateAdapter} from '@angular/material/core';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatTimepicker, MatTimepickerInput} from '@angular/material/timepicker';
import {MatTimepickerHarness} from './timepicker-harness';
import {MatTimepickerInputHarness} from './timepicker-input-harness';

describe('MatTimepickerHarness', () => {
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

  it('should be able to load timepicker harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(MatTimepickerHarness);
    expect(harnesses.length).toBe(2);
  });

  it('should get the open state of a timepicker', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness.with({selector: '#one'}));
    const timepicker = await input.getTimepicker();
    expect(await timepicker.isOpen()).toBe(false);

    await input.openTimepicker();
    expect(await timepicker.isOpen()).toBe(true);
  });

  it('should throw when trying to get the options while closed', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness.with({selector: '#one'}));
    const timepicker = await input.getTimepicker();

    await expectAsync(timepicker.getOptions()).toBeRejectedWithError(
      /Unable to retrieve options for timepicker\. Timepicker panel is closed\./,
    );
  });

  it('should get the options in a timepicker', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness.with({selector: '#one'}));
    const timepicker = await input.openTimepicker();
    const options = await timepicker.getOptions();
    const labels = await parallel(() => options.map(o => o.getText()));
    expect(labels).toEqual(['12:00 AM', '4:00 AM', '8:00 AM', '12:00 PM', '4:00 PM', '8:00 PM']);
  });

  it('should be able to select an option', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness.with({selector: '#one'}));
    const timepicker = await input.openTimepicker();
    expect(await input.getValue()).toBe('');

    await timepicker.selectOption({text: '4:00 PM'});
    expect(await input.getValue()).toBe('4:00 PM');
    expect(await timepicker.isOpen()).toBe(false);
  });
});

@Component({
  template: `
    <input id="one" [matTimepicker]="onePicker">
    <mat-timepicker #onePicker [interval]="interval()"/>
    <input id="two" [matTimepicker]="twoPicker">
    <mat-timepicker #twoPicker [interval]="interval()"/>
  `,
  imports: [MatTimepickerInput, MatTimepicker],
})
class TimepickerHarnessTest {
  interval = signal('4h');
}
