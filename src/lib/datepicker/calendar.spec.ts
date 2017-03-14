import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {SimpleDate} from '../core/datetime/simple-date';
import {MdCalendar} from './calendar';
import {By} from '@angular/platform-browser';
import {MdMonthView} from './month-view';
import {MdYearView} from './year-view';
import {MdCalendarTable} from './calendar-table';
import {DatetimeModule} from '../core/datetime/index';


describe('MdCalendar', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DatetimeModule,
      ],
      declarations: [
        MdCalendar,
        MdCalendarTable,
        MdMonthView,
        MdYearView,

        // Test components.
        StandardCalendar,
        CalendarWithMinMax,
        CalendarWithDateFilter,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard calendar', () => {
    let fixture: ComponentFixture<StandardCalendar>;
    let testComponent: StandardCalendar;
    let calendarElement: HTMLElement;
    let periodButton: HTMLElement;
    let prevButton: HTMLElement;
    let nextButton: HTMLElement;
    let calendarInstance: MdCalendar;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardCalendar);
      fixture.detectChanges();

      let calendarDebugElement = fixture.debugElement.query(By.directive(MdCalendar));
      calendarElement = calendarDebugElement.nativeElement;
      periodButton = calendarElement.querySelector('.mat-calendar-period-button') as HTMLElement;
      prevButton = calendarElement.querySelector('.mat-calendar-previous-button') as HTMLElement;
      nextButton = calendarElement.querySelector('.mat-calendar-next-button') as HTMLElement;

      calendarInstance = calendarDebugElement.componentInstance;
      testComponent = fixture.componentInstance;
    });

    it('should be in month view with specified month visible', () => {
      expect(calendarInstance._monthView).toBe(true, 'should be in month view');
      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2017, 0, 1));
    });

    it('should toggle view when period clicked', () => {
      expect(calendarInstance._monthView).toBe(true, 'should be in month view');

      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._monthView).toBe(false, 'should be in year view');

      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._monthView).toBe(true, 'should be in month view');
    });

    it('should go to next and previous month', () => {
      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2017, 0, 1));

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2017, 1, 1));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2017, 0, 1));
    });

    it('should go to previous and next year', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._monthView).toBe(false, 'should be in year view');
      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2017, 0, 1));

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2018, 0, 1));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2017, 0, 1));
    });

    it('should go back to month view after selecting month in year view', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._monthView).toBe(false, 'should be in year view');
      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2017, 0, 1));

      let monthCells = calendarElement.querySelectorAll('.mat-calendar-table-cell');
      (monthCells[monthCells.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance._monthView).toBe(true, 'should be in month view');
      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2017, 11, 1));
      expect(testComponent.selected).toBeFalsy('no date should be selected yet');
    });

    it('should select date in month view', () => {
      let monthCells = calendarElement.querySelectorAll('.mat-calendar-table-cell');
      (monthCells[monthCells.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance._monthView).toBe(true, 'should be in month view');
      expect(testComponent.selected).toEqual(new SimpleDate(2017, 0, 31));
    });
  });

  describe('calendar with min and max date', () => {
    let fixture: ComponentFixture<CalendarWithMinMax>;
    let testComponent: CalendarWithMinMax;
    let calendarElement: HTMLElement;
    let prevButton: HTMLElement;
    let nextButton: HTMLElement;
    let calendarInstance: MdCalendar;

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarWithMinMax);

      let calendarDebugElement = fixture.debugElement.query(By.directive(MdCalendar));
      calendarElement = calendarDebugElement.nativeElement;
      prevButton = calendarElement.querySelector('.mat-calendar-previous-button') as HTMLElement;
      nextButton = calendarElement.querySelector('.mat-calendar-next-button') as HTMLElement;
      calendarInstance = calendarDebugElement.componentInstance;
      testComponent = fixture.componentInstance;
    });

    it('should clamp startAt value below min date', () => {
      testComponent.startAt = new SimpleDate(2000, 0, 1);
      fixture.detectChanges();

      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2016, 0, 1));
    });

    it('should clamp startAt value above max date', () => {
      testComponent.startAt = new SimpleDate(2020, 0, 1);
      fixture.detectChanges();

      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2018, 0, 1));
    });

    it('should not go back past min date', () => {
      testComponent.startAt = new SimpleDate(2016, 1, 1);
      fixture.detectChanges();

      expect(prevButton.classList).not.toContain('mat-calendar-disabled');
      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2016, 1, 1));

      prevButton.click();
      fixture.detectChanges();

      expect(prevButton.classList).toContain('mat-calendar-disabled');
      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2016, 0, 1));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2016, 0, 1));
    });

    it('should not go forward past max date', () => {
      testComponent.startAt = new SimpleDate(2017, 11, 1);
      fixture.detectChanges();

      expect(nextButton.classList).not.toContain('mat-calendar-disabled');
      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2017, 11, 1));

      nextButton.click();
      fixture.detectChanges();

      expect(nextButton.classList).toContain('mat-calendar-disabled');
      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2018, 0, 1));

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance._currentPeriod).toEqual(new SimpleDate(2018, 0, 1));
    });
  });

  describe('calendar with date filter', () => {
    let fixture: ComponentFixture<CalendarWithDateFilter>;
    let testComponent: CalendarWithDateFilter;
    let calendarElement: HTMLElement;
    let calendarInstance: MdCalendar;

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarWithDateFilter);
      fixture.detectChanges();

      let calendarDebugElement = fixture.debugElement.query(By.directive(MdCalendar));
      calendarElement = calendarDebugElement.nativeElement;
      calendarInstance = calendarDebugElement.componentInstance;
      testComponent = fixture.componentInstance;
    });

    it('should disable and prevent selection of filtered dates', () => {
      let cells = calendarElement.querySelectorAll('.mat-calendar-table-cell');
      (cells[0] as HTMLElement).click();
      fixture.detectChanges();

      expect(testComponent.selected).toBeFalsy();

      (cells[1] as HTMLElement).click();
      fixture.detectChanges();

      expect(testComponent.selected).toEqual(new SimpleDate(2017, 0, 2));
    });
  });
});


@Component({
  template: `<md-calendar startAt="1/31/2017" [(selected)]="selected"></md-calendar>`
})
class StandardCalendar {
  selected: SimpleDate;
}


@Component({
  template: `<md-calendar [startAt]="startAt" minDate="1/1/2016" maxDate="1/1/2018"></md-calendar>`
})
class CalendarWithMinMax {
  startAt: SimpleDate;
}


@Component({
  template: `
    <md-calendar startAt="1/1/2017" [(selected)]="selected" [dateFilter]="dateFilter"></md-calendar>
  `
})
class CalendarWithDateFilter {
  selected: SimpleDate;

  dateFilter (date: SimpleDate) {
    return date.date % 2 == 0;
  }
}
