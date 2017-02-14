import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {MdDatepickerModule} from './index';
import {Component} from '@angular/core';
import {SimpleDate} from '../core/datetime/simple-date';
import {MdCalendar} from './calendar';
import {By} from '@angular/platform-browser';


describe('MdCalendar', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdDatepickerModule],
      declarations: [
        StandardCalendar,
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
});


@Component({
  template: `<md-calendar startAt="1/31/2017" [(selected)]="selected"></md-calendar>`
})
class StandardCalendar {
  selected: SimpleDate;
}
