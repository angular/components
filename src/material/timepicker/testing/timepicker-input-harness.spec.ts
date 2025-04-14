import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DateAdapter, provideNativeDateAdapter} from '../../core';
import {MatTimepicker, MatTimepickerInput} from '../../timepicker';
import {MatTimepickerHarness} from './timepicker-harness';
import {MatTimepickerInputHarness} from './timepicker-input-harness';

describe('MatTimepickerInputHarness', () => {
  let fixture: ComponentFixture<TimepickerInputHarnessTest>;
  let loader: HarnessLoader;
  let adapter: DateAdapter<Date>;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideNativeDateAdapter()]});
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('en-US');
    fixture = TestBed.createComponent(TimepickerInputHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all timepicker input harnesses', async () => {
    const inputs = await loader.getAllHarnesses(MatTimepickerInputHarness);
    expect(inputs.length).toBe(2);
  });

  it('should filter inputs based on their value', async () => {
    fixture.componentInstance.value.set(createTime(15, 10));
    fixture.changeDetectorRef.markForCheck();
    const inputs = await loader.getAllHarnesses(MatTimepickerInputHarness.with({value: /3:10/}));
    expect(inputs.length).toBe(1);
  });

  it('should filter inputs based on their placeholder', async () => {
    const inputs = await loader.getAllHarnesses(
      MatTimepickerInputHarness.with({
        placeholder: /^Pick/,
      }),
    );

    expect(inputs.length).toBe(1);
  });

  it('should get whether the input is disabled', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness.with({selector: '#bound'}));
    expect(await input.isDisabled()).toBe(false);

    fixture.componentInstance.disabled.set(true);
    expect(await input.isDisabled()).toBe(true);
  });

  it('should get whether the input is required', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness.with({selector: '#bound'}));
    expect(await input.isRequired()).toBe(false);

    fixture.componentInstance.required.set(true);
    expect(await input.isRequired()).toBe(true);
  });

  it('should get the input value', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness.with({selector: '#bound'}));
    fixture.componentInstance.value.set(createTime(15, 10));
    fixture.changeDetectorRef.markForCheck();

    expect(await input.getValue()).toBe('3:10 PM');
  });

  it('should set the input value', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness.with({selector: '#bound'}));
    expect(await input.getValue()).toBeFalsy();

    await input.setValue('3:10 PM');
    expect(await input.getValue()).toBe('3:10 PM');
  });

  it('should set the input value based on date adapter validation and formatting', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness.with({selector: '#bound'}));
    const validValues: any[] = [createTime(15, 10), '', 0, false];
    const invalidValues: any[] = [null, undefined];
    spyOn(adapter, 'format').and.returnValue('FORMATTED_VALUE');
    spyOn(adapter, 'isValid').and.callFake(value => validValues.includes(value));
    spyOn(adapter, 'deserialize').and.callFake(value =>
      validValues.includes(value) ? value : null,
    );
    spyOn(adapter, 'getValidDateOrNull').and.callFake((value: Date) =>
      adapter.isValid(value) ? value : null,
    );

    for (let value of validValues) {
      fixture.componentInstance.value.set(value);
      fixture.changeDetectorRef.markForCheck();
      expect(await input.getValue()).toBe('FORMATTED_VALUE');
    }

    for (let value of invalidValues) {
      fixture.componentInstance.value.set(value);
      fixture.changeDetectorRef.markForCheck();
      expect(await input.getValue()).toBe('');
    }
  });

  it('should get the input placeholder', async () => {
    const inputs = await loader.getAllHarnesses(MatTimepickerInputHarness);
    expect(await parallel(() => inputs.map(input => input.getPlaceholder()))).toEqual([
      'Pick a time',
      'Select a time',
    ]);
  });

  it('should be able to change the input focused state', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness.with({selector: '#bound'}));
    expect(await input.isFocused()).toBe(false);

    await input.focus();
    expect(await input.isFocused()).toBe(true);

    await input.blur();
    expect(await input.isFocused()).toBe(false);
  });

  it('should be able to open and close a timepicker', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness.with({selector: '#bound'}));
    expect(await input.isTimepickerOpen()).toBe(false);

    await input.openTimepicker();
    expect(await input.isTimepickerOpen()).toBe(true);

    await input.closeTimepicker();
    expect(await input.isTimepickerOpen()).toBe(false);
  });

  it('should be able to get the harness for the associated timepicker', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness.with({selector: '#bound'}));
    await input.openTimepicker();
    expect(await input.getTimepicker()).toBeInstanceOf(MatTimepickerHarness);
  });

  it('should emit the `valueChange` event when the value is changed', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness.with({selector: '#bound'}));
    expect(fixture.componentInstance.changeCount).toBe(0);

    await input.setValue('3:15 PM');
    expect(fixture.componentInstance.changeCount).toBeGreaterThan(0);
  });

  function createTime(hours: number, minutes: number): Date {
    return adapter.setTime(adapter.today(), hours, minutes, 0);
  }
});

@Component({
  template: `
    <input
      [matTimepicker]="boundPicker"
      [value]="value()"
      [disabled]="disabled()"
      [required]="required()"
      (valueChange)="changeCount = changeCount + 1"
      placeholder="Pick a time"
      id="bound">
    <mat-timepicker #boundPicker/>

    <input [matTimepicker]="basicPicker" id="basic" placeholder="Select a time">
    <mat-timepicker #basicPicker/>
  `,
  imports: [MatTimepickerInput, MatTimepicker],
})
class TimepickerInputHarnessTest {
  readonly value = signal<Date | null>(null);
  readonly disabled = signal(false);
  readonly required = signal(false);
  changeCount = 0;
}
