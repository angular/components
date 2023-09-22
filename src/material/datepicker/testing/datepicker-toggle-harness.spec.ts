import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatDatepickerToggleHarness} from './datepicker-toggle-harness';
import {MatCalendarHarness} from './calendar-harness';

describe('MatDatepickerToggleHarness', () => {
  let fixture: ComponentFixture<DatepickerToggleHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MatNativeDateModule, MatDatepickerModule],
      declarations: [DatepickerToggleHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(DatepickerToggleHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all toggle harnesses', async () => {
    const toggles = await loader.getAllHarnesses(MatDatepickerToggleHarness);
    expect(toggles.length).toBe(2);
  });

  it('should get whether the toggle is disabled', async () => {
    const toggle = await loader.getHarness(MatDatepickerToggleHarness.with({selector: '#basic'}));
    expect(await toggle.isDisabled()).toBe(false);

    fixture.componentInstance.disabled = true;
    expect(await toggle.isDisabled()).toBe(true);
  });

  it('should get whether the toggle has a calendar associated with it', async () => {
    const toggles = await loader.getAllHarnesses(MatDatepickerToggleHarness);
    expect(
      await parallel(() => {
        return toggles.map(toggle => toggle.hasCalendar());
      }),
    ).toEqual([true, false]);
  });

  it('should be able to open and close a calendar in popup mode', async () => {
    const toggle = await loader.getHarness(MatDatepickerToggleHarness.with({selector: '#basic'}));
    expect(await toggle.isCalendarOpen()).toBe(false);

    await toggle.openCalendar();
    expect(await toggle.isCalendarOpen()).toBe(true);

    await toggle.closeCalendar();
    expect(await toggle.isCalendarOpen()).toBe(false);
  });

  it('should be able to open and close a calendar in touch mode', async () => {
    fixture.componentInstance.touchUi = true;
    const toggle = await loader.getHarness(MatDatepickerToggleHarness.with({selector: '#basic'}));
    expect(await toggle.isCalendarOpen()).toBe(false);

    await toggle.openCalendar();
    expect(await toggle.isCalendarOpen()).toBe(true);

    await toggle.closeCalendar();
    expect(await toggle.isCalendarOpen()).toBe(false);
  });

  it('should be able to get the harness for the associated calendar', async () => {
    const toggle = await loader.getHarness(MatDatepickerToggleHarness.with({selector: '#basic'}));
    await toggle.openCalendar();
    expect(await toggle.getCalendar()).toBeInstanceOf(MatCalendarHarness);
  });
});

@Component({
  template: `
    <input [matDatepicker]="picker">
    <mat-datepicker-toggle id="basic" [for]="picker" [disabled]="disabled"></mat-datepicker-toggle>
    <mat-datepicker #picker [touchUi]="touchUi"></mat-datepicker>

    <mat-datepicker-toggle id="no-calendar"></mat-datepicker-toggle>
  `,
})
class DatepickerToggleHarnessTest {
  touchUi = false;
  disabled = false;
}
