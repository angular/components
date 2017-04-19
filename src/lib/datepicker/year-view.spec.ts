import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdYearView} from './year-view';
import {SimpleDate} from '../core/datetime/simple-date';
import {MdCalendarBody} from './calendar-body';
import {DatetimeModule} from '../core/datetime/index';


describe('MdYearView', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DatetimeModule,
      ],
      declarations: [
        MdCalendarBody,
        MdYearView,

        // Test components.
        StandardYearView,
        YearViewWithDateFilter,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard year view', () => {
    let fixture: ComponentFixture<StandardYearView>;
    let testComponent: StandardYearView;
    let yearViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardYearView);
      fixture.detectChanges();

      let yearViewDebugElement = fixture.debugElement.query(By.directive(MdYearView));
      yearViewNativeElement = yearViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('has correct year label', () => {
      let labelEl = yearViewNativeElement.querySelector('.mat-calendar-body-label');
      expect(labelEl.innerHTML.trim()).toBe('2017');
    });

    it('has 12 months', () => {
      let cellEls = yearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect(cellEls.length).toBe(12);
    });

    it('shows selected month if in same year', () => {
      let selectedEl = yearViewNativeElement.querySelector('.mat-calendar-body-selected');
      expect(selectedEl.innerHTML.trim()).toBe('MAR');
    });

    it('does not show selected month if in different year', () => {
      testComponent.selected = new SimpleDate(2016, 2, 10);
      fixture.detectChanges();

      let selectedEl = yearViewNativeElement.querySelector('.mat-calendar-body-selected');
      expect(selectedEl).toBeNull();
    });

    it('fires selected change event on cell clicked', () => {
      let cellEls = yearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      (cellEls[cellEls.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      let selectedEl = yearViewNativeElement.querySelector('.mat-calendar-body-selected');
      expect(selectedEl.innerHTML.trim()).toBe('DEC');
    });

    it('should mark active date', () => {
      let cellEls = yearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect((cellEls[0] as HTMLElement).innerText.trim()).toBe('JAN');
      expect(cellEls[0].classList).toContain('mat-calendar-body-active');
    });
  });

  describe('year view with date filter', () => {
    let fixture: ComponentFixture<YearViewWithDateFilter>;
    let testComponent: YearViewWithDateFilter;
    let yearViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(YearViewWithDateFilter);
      fixture.detectChanges();

      let yearViewDebugElement = fixture.debugElement.query(By.directive(MdYearView));
      yearViewNativeElement = yearViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('should disabled months with no enabled days', () => {
      let cells = yearViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect(cells[0].classList).not.toContain('mat-calendar-body-disabled');
      expect(cells[1].classList).toContain('mat-calendar-body-disabled');
    });
  });
});


@Component({
  template: `
    <md-year-view [activeDate]="date" [(selected)]="selected"></md-year-view>`,
})
class StandardYearView {
  date = new SimpleDate(2017, 0, 5);
  selected = new SimpleDate(2017, 2, 10);
}


@Component({
  template: `<md-year-view date="1/1/2017" [dateFilter]="dateFilter"></md-year-view>`
})
class YearViewWithDateFilter {
  dateFilter(date: SimpleDate) {
    if (date.month == 0) {
      return date.date == 10;
    }
    if (date.month == 1) {
      return false;
    }
    return true;
  }
}
