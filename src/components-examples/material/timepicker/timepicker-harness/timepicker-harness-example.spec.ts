import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatTimepickerInputHarness} from '@angular/material/timepicker/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TimepickerHarnessExample} from './timepicker-harness-example';
import {DateAdapter, MATERIAL_ANIMATIONS, MatNativeDateModule} from '@angular/material/core';

describe('TimepickerHarnessExample', () => {
  let fixture: ComponentFixture<TimepickerHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatNativeDateModule],
      providers: [{provide: MATERIAL_ANIMATIONS, useValue: {animationsDisabled: true}}],
    });
    TestBed.inject(DateAdapter).setLocale('en-US'); // Set the locale to en-US to guarantee consistent tests.
    fixture = TestBed.createComponent(TimepickerHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all timepicker input harnesses', async () => {
    const inputs = await loader.getAllHarnesses(MatTimepickerInputHarness);
    expect(inputs.length).toBe(1);
  });

  it('should open and close a timepicker', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness);
    expect(await input.isTimepickerOpen()).toBe(false);

    await input.openTimepicker();
    expect(await input.isTimepickerOpen()).toBe(true);
  });

  it('should set the input value', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness);
    expect(await input.getValue()).toBe('11:45 AM');

    await input.setValue('3:21 PM');
    expect(await input.getValue()).toBe('3:21 PM');
  });

  it('should select an option from the timepicker', async () => {
    const input = await loader.getHarness(MatTimepickerInputHarness);
    const timepicker = await input.openTimepicker();
    expect(await input.getValue()).toBe('11:45 AM');

    await timepicker.selectOption({text: '1:00 PM'});
    expect(await input.getValue()).toBe('1:00 PM');
  });
});
