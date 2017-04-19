import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {SimpleDate} from '../core/datetime/simple-date';
import {MdCalendar} from './calendar';
import {By} from '@angular/platform-browser';
import {MdMonthView} from './month-view';
import {MdYearView} from './year-view';
import {MdCalendarBody} from './calendar-body';
import {DatetimeModule} from '../core/datetime/index';
import {
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent
} from '../core/testing/dispatch-events';
import {
  DOWN_ARROW,
  END,
  ENTER,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  UP_ARROW
} from '../core/keyboard/keycodes';


describe('MdCalendar', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DatetimeModule,
      ],
      declarations: [
        MdCalendar,
        MdCalendarBody,
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

    it('should be in month view with specified month active', () => {
      expect(calendarInstance._monthView).toBe(true, 'should be in month view');
      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 31));
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
      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 31));

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 1, 28));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 28));
    });

    it('should go to previous and next year', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._monthView).toBe(false, 'should be in year view');
      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 31));

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2018, 0, 31));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 31));
    });

    it('should go back to month view after selecting month in year view', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance._monthView).toBe(false, 'should be in year view');
      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 31));

      let monthCells = calendarElement.querySelectorAll('.mat-calendar-body-cell');
      (monthCells[monthCells.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance._monthView).toBe(true, 'should be in month view');
      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 11, 31));
      expect(testComponent.selected).toBeFalsy('no date should be selected yet');
    });

    it('should select date in month view', () => {
      let monthCells = calendarElement.querySelectorAll('.mat-calendar-body-cell');
      (monthCells[monthCells.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      expect(calendarInstance._monthView).toBe(true, 'should be in month view');
      expect(testComponent.selected).toEqual(new SimpleDate(2017, 0, 31));
    });

    describe('a11y', () => {
      describe('calendar body', () => {
        let calendarBodyEl: HTMLElement;

        beforeEach(() => {
          calendarBodyEl = calendarElement.querySelector('.mat-calendar-content') as HTMLElement;
          expect(calendarBodyEl).not.toBeNull();

          dispatchFakeEvent(calendarBodyEl, 'focus');
          fixture.detectChanges();
        });

        it('should initially set start date active', () => {
          expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 31));
        });

        describe('month view', () => {
          it('should decrement date on left arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 30));

            calendarInstance._activeDate = new SimpleDate(2017, 0, 1);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2016, 11, 31));
          });

          it('should increment date on right arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 1, 1));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 1, 2));
          });

          it('should go up a row on up arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 24));

            calendarInstance._activeDate = new SimpleDate(2017, 0, 7);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2016, 11, 31));
          });

          it('should go down a row on down arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 1, 7));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 1, 14));
          });

          it('should go to beginning of the month on home press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 1));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 1));
          });

          it('should go to end of the month on end press', () => {
            calendarInstance._activeDate = new SimpleDate(2017, 0, 10);

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 31));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 31));
          });

          it('should go back one month on page up press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2016, 11, 31));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2016, 10, 30));
          });

          it('should go forward one month on page down press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 1, 28));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 2, 28));
          });

          it('should select active date on enter', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(testComponent.selected).toBeNull();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
            fixture.detectChanges();

            expect(testComponent.selected).toEqual(new SimpleDate(2017, 0, 30));
          });
        });

        describe('year view', () => {
          beforeEach(() => {
            dispatchMouseEvent(periodButton, 'click');
            fixture.detectChanges();

            expect(calendarInstance._monthView).toBe(false);
          });

          it('should decrement month on left arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2016, 11, 31));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2016, 10, 30));
          });

          it('should increment month on right arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 1, 28));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 2, 28));
          });

          it('should go up a row on up arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2016, 7, 31));

            calendarInstance._activeDate = new SimpleDate(2017, 6, 1);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2016, 6, 1));

            calendarInstance._activeDate = new SimpleDate(2017, 11, 10);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 4, 10));
          });

          it('should go down a row on down arrow press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 7, 31));

            calendarInstance._activeDate = new SimpleDate(2017, 5, 1);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2018, 5, 1));

            calendarInstance._activeDate = new SimpleDate(2017, 8, 30);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2018, 1, 28));
          });

          it('should go to first month of the year on home press', () => {
            calendarInstance._activeDate = new SimpleDate(2017, 8, 30);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 30));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 30));
          });

          it('should go to last month of the year on end press', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 11, 31));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 11, 31));
          });

          it('should go back one year on page up press', () => {
            calendarInstance._activeDate = new SimpleDate(2016, 1, 29);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2015, 1, 28));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2014, 1, 28));
          });

          it('should go forward one year on page down press', () => {
            calendarInstance._activeDate = new SimpleDate(2016, 1, 29);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 1, 28));

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
            fixture.detectChanges();

            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2018, 1, 28));
          });

          it('should return to month view on enter', () => {
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
            fixture.detectChanges();

            expect(calendarInstance._monthView).toBe(true);
            expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 1, 28));
            expect(testComponent.selected).toBeNull();
          });
        });
      });
    });
  });

  describe('calendar with min and max date', () => {
    let fixture: ComponentFixture<CalendarWithMinMax>;
    let testComponent: CalendarWithMinMax;
    let calendarElement: HTMLElement;
    let prevButton: HTMLButtonElement;
    let nextButton: HTMLButtonElement;
    let calendarInstance: MdCalendar;

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarWithMinMax);

      let calendarDebugElement = fixture.debugElement.query(By.directive(MdCalendar));
      calendarElement = calendarDebugElement.nativeElement;
      prevButton =
          calendarElement.querySelector('.mat-calendar-previous-button') as HTMLButtonElement;
      nextButton = calendarElement.querySelector('.mat-calendar-next-button') as HTMLButtonElement;
      calendarInstance = calendarDebugElement.componentInstance;
      testComponent = fixture.componentInstance;
    });

    it('should clamp startAt value below min date', () => {
      testComponent.startAt = new SimpleDate(2000, 0, 1);
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2016, 0, 1));
    });

    it('should clamp startAt value above max date', () => {
      testComponent.startAt = new SimpleDate(2020, 0, 1);
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2018, 0, 1));
    });

    it('should not go back past min date', () => {
      testComponent.startAt = new SimpleDate(2016, 1, 1);
      fixture.detectChanges();

      expect(prevButton.disabled).toBe(false, 'previous button should not be disabled');
      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2016, 1, 1));

      prevButton.click();
      fixture.detectChanges();

      expect(prevButton.disabled).toBe(true, 'previous button should be disabled');
      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2016, 0, 1));

      prevButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2016, 0, 1));
    });

    it('should not go forward past max date', () => {
      testComponent.startAt = new SimpleDate(2017, 11, 1);
      fixture.detectChanges();

      expect(nextButton.disabled).toBe(false, 'next button should not be disabled');
      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 11, 1));

      nextButton.click();
      fixture.detectChanges();

      expect(nextButton.disabled).toBe(true, 'next button should be disabled');
      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2018, 0, 1));

      nextButton.click();
      fixture.detectChanges();

      expect(calendarInstance._activeDate).toEqual(new SimpleDate(2018, 0, 1));
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
      let cells = calendarElement.querySelectorAll('.mat-calendar-body-cell');
      (cells[0] as HTMLElement).click();
      fixture.detectChanges();

      expect(testComponent.selected).toBeFalsy();

      (cells[1] as HTMLElement).click();
      fixture.detectChanges();

      expect(testComponent.selected).toEqual(new SimpleDate(2017, 0, 2));
    });

    describe('a11y', () => {
      let calendarBodyEl: HTMLElement;

      beforeEach(() => {
        calendarBodyEl = calendarElement.querySelector('.mat-calendar-content') as HTMLElement;
        expect(calendarBodyEl).not.toBeNull();

        dispatchFakeEvent(calendarBodyEl, 'focus');
        fixture.detectChanges();
      });

      it('should not allow selection of disabled date in month view', () => {
        expect(calendarInstance._monthView).toBe(true);
        expect(calendarInstance._activeDate).toEqual(new SimpleDate(2017, 0, 1));

        dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
        fixture.detectChanges();

        expect(testComponent.selected).toBeNull();
      });

      it('should allow entering month view at disabled month', () => {
        let periodButton =
            calendarElement.querySelector('.mat-calendar-period-button') as HTMLElement;
        dispatchMouseEvent(periodButton, 'click');
        fixture.detectChanges();

        calendarInstance._activeDate = new SimpleDate(2017, 10, 1);
        fixture.detectChanges();

        expect(calendarInstance._monthView).toBe(false);

        dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
        fixture.detectChanges();

        expect(calendarInstance._monthView).toBe(true);
        expect(testComponent.selected).toBeNull();
      });
    });
  });
});


@Component({
  template: `<md-calendar startAt="1/31/2017" [(selected)]="selected"></md-calendar>`
})
class StandardCalendar {
  selected: SimpleDate = null;
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
  selected: SimpleDate = null;

  dateFilter (date: SimpleDate) {
    return date.date % 2 == 0 && date.month != 10;
  }
}
