import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {DateAdapter, MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatCalendarHarness} from './calendar-harness';
import {MatDatepickerInputHarness} from './datepicker-input-harness';

describe('MatDatepickerInputHarness', () => {
  let fixture: ComponentFixture<DatepickerInputHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatNativeDateModule,
        MatDatepickerModule,
        FormsModule,
        DatepickerInputHarnessTest,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DatepickerInputHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all datepicker input harnesses', async () => {
    const inputs = await loader.getAllHarnesses(MatDatepickerInputHarness);
    expect(inputs.length).toBe(2);
  });

  it('should filter inputs based on their value', async () => {
    fixture.componentInstance.date = new Date(2020, 0, 1, 12, 0, 0);
    fixture.changeDetectorRef.markForCheck();
    const inputs = await loader.getAllHarnesses(MatDatepickerInputHarness.with({value: /2020/}));
    expect(inputs.length).toBe(1);
  });

  it('should filter inputs based on their placeholder', async () => {
    const inputs = await loader.getAllHarnesses(
      MatDatepickerInputHarness.with({
        placeholder: /^Type/,
      }),
    );

    expect(inputs.length).toBe(1);
  });

  it('should get whether the input has an associated calendar', async () => {
    const inputs = await loader.getAllHarnesses(MatDatepickerInputHarness);
    expect(await parallel(() => inputs.map(input => input.hasCalendar()))).toEqual([true, false]);
  });

  it('should get whether the input is disabled', async () => {
    const input = await loader.getHarness(MatDatepickerInputHarness.with({selector: '#basic'}));
    expect(await input.isDisabled()).toBe(false);

    fixture.componentInstance.disabled = true;
    fixture.changeDetectorRef.markForCheck();
    expect(await input.isDisabled()).toBe(true);
  });

  it('should get whether the input is required', async () => {
    const input = await loader.getHarness(MatDatepickerInputHarness.with({selector: '#basic'}));
    expect(await input.isRequired()).toBe(false);

    fixture.componentInstance.required = true;
    fixture.changeDetectorRef.markForCheck();
    expect(await input.isRequired()).toBe(true);
  });

  it('should get the input value', async () => {
    const input = await loader.getHarness(MatDatepickerInputHarness.with({selector: '#basic'}));
    fixture.componentInstance.date = new Date(2020, 0, 1, 12, 0, 0);
    fixture.changeDetectorRef.markForCheck();

    expect(await input.getValue()).toBe('1/1/2020');
  });

  it('should set the input value', async () => {
    const input = await loader.getHarness(MatDatepickerInputHarness.with({selector: '#basic'}));
    expect(await input.getValue()).toBeFalsy();

    await input.setValue('1/1/2020');
    expect(await input.getValue()).toBe('1/1/2020');
  });

  it('should set the input value based on date adapter validation and formatting', async () => {
    const adapter = fixture.debugElement.injector.get(DateAdapter);
    const input = await loader.getHarness(MatDatepickerInputHarness.with({selector: '#basic'}));
    const validValues: any[] = [new Date(0), '', 0, false];
    const invalidValues: any[] = [null, undefined];
    spyOn(adapter, 'format').and.returnValue('FORMATTED_VALUE');
    spyOn(adapter, 'isValid').and.callFake(value => validValues.includes(value));
    spyOn(adapter, 'deserialize').and.callFake(value =>
      validValues.includes(value) ? value : null,
    );
    spyOn(adapter, 'getValidDateOrNull').and.callFake(value =>
      adapter.isValid(value) ? value : null,
    );

    for (let value of validValues) {
      fixture.componentInstance.date = value;
      fixture.changeDetectorRef.markForCheck();
      expect(await input.getValue()).toBe('FORMATTED_VALUE');
    }

    for (let value of invalidValues) {
      fixture.componentInstance.date = value;
      fixture.changeDetectorRef.markForCheck();
      expect(await input.getValue()).toBe('');
    }
  });

  it('should get the input placeholder', async () => {
    const inputs = await loader.getAllHarnesses(MatDatepickerInputHarness);
    expect(
      await parallel(() =>
        inputs.map(input => {
          return input.getPlaceholder();
        }),
      ),
    ).toEqual(['Type a date', '']);
  });

  it('should be able to change the input focused state', async () => {
    const input = await loader.getHarness(MatDatepickerInputHarness.with({selector: '#basic'}));
    expect(await input.isFocused()).toBe(false);

    await input.focus();
    expect(await input.isFocused()).toBe(true);

    await input.blur();
    expect(await input.isFocused()).toBe(false);
  });

  it('should get the minimum date of the input', async () => {
    const inputs = await loader.getAllHarnesses(MatDatepickerInputHarness);
    fixture.componentInstance.minDate = new Date(2020, 0, 1, 12, 0, 0);
    fixture.changeDetectorRef.markForCheck();
    expect(await parallel(() => inputs.map(input => input.getMin()))).toEqual(['2020-01-01', null]);
  });

  it('should get the maximum date of the input', async () => {
    const inputs = await loader.getAllHarnesses(MatDatepickerInputHarness);
    fixture.componentInstance.maxDate = new Date(2020, 0, 1, 12, 0, 0);
    fixture.changeDetectorRef.markForCheck();
    expect(await parallel(() => inputs.map(input => input.getMax()))).toEqual(['2020-01-01', null]);
  });

  it('should be able to open and close a calendar in popup mode', async () => {
    const input = await loader.getHarness(MatDatepickerInputHarness.with({selector: '#basic'}));
    expect(await input.isCalendarOpen()).toBe(false);

    await input.openCalendar();
    expect(await input.isCalendarOpen()).toBe(true);

    await input.closeCalendar();
    expect(await input.isCalendarOpen()).toBe(false);
  });

  it('should be able to open and close a calendar in touch mode', async () => {
    fixture.componentInstance.touchUi = true;
    fixture.changeDetectorRef.markForCheck();
    const input = await loader.getHarness(MatDatepickerInputHarness.with({selector: '#basic'}));
    expect(await input.isCalendarOpen()).toBe(false);

    await input.openCalendar();
    expect(await input.isCalendarOpen()).toBe(true);

    await input.closeCalendar();
    expect(await input.isCalendarOpen()).toBe(false);
  });

  it('should be able to get the harness for the associated calendar', async () => {
    const input = await loader.getHarness(MatDatepickerInputHarness.with({selector: '#basic'}));
    await input.openCalendar();
    expect(await input.getCalendar()).toBeInstanceOf(MatCalendarHarness);
  });

  it('should emit the `dateChange` event when the value is changed', async () => {
    const input = await loader.getHarness(MatDatepickerInputHarness.with({selector: '#basic'}));
    expect(fixture.componentInstance.dateChangeCount).toBe(0);

    await input.setValue('1/1/2020');
    expect(fixture.componentInstance.dateChangeCount).toBe(1);
  });
});

@Component({
  template: `
    <input
      id="basic"
      matInput
      [matDatepicker]="picker"
      (dateChange)="dateChangeCount = dateChangeCount + 1"
      [(ngModel)]="date"
      [min]="minDate"
      [max]="maxDate"
      [disabled]="disabled"
      [required]="required"
      placeholder="Type a date">
    <mat-datepicker #picker [touchUi]="touchUi"></mat-datepicker>
    <input id="no-datepicker" matDatepicker>
  `,
  standalone: true,
  imports: [MatNativeDateModule, MatDatepickerModule, FormsModule],
})
class DatepickerInputHarnessTest {
  date: Date | null = null;
  minDate: Date | null = null;
  maxDate: Date | null = null;
  touchUi = false;
  disabled = false;
  required = false;
  dateChangeCount = 0;
}
