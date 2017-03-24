import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdMonthView} from './month-view';
import {SimpleDate} from '../core/datetime/simple-date';
import {MdCalendarTable} from './calendar-table';
import {DatetimeModule} from '../core/datetime/index';


describe('MdMonthView', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DatetimeModule,
      ],
      declarations: [
        MdCalendarTable,
        MdMonthView,

        // Test components.
        StandardMonthView,
        MonthViewWithDateFilter,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard month view', () => {
    let fixture: ComponentFixture<StandardMonthView>;
    let testComponent: StandardMonthView;
    let monthViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardMonthView);
      fixture.detectChanges();

      let monthViewDebugElement = fixture.debugElement.query(By.directive(MdMonthView));
      monthViewNativeElement = monthViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('has correct month label', () => {
      let labelEl = monthViewNativeElement.querySelector('.mat-calendar-table-label');
      expect(labelEl.innerHTML.trim()).toBe('JAN');
    });

    it('has 31 days', () => {
      let cellEls = monthViewNativeElement.querySelectorAll('.mat-calendar-table-cell');
      expect(cellEls.length).toBe(31);
    });

    it('shows selected date if in same month', () => {
      let selectedEl = monthViewNativeElement.querySelector('.mat-calendar-table-selected');
      expect(selectedEl.innerHTML.trim()).toBe('10');
    });

    it('does not show selected date if in different month', () => {
      testComponent.selected = new SimpleDate(2017, 2, 10);
      fixture.detectChanges();

      let selectedEl = monthViewNativeElement.querySelector('.mat-calendar-table-selected');
      expect(selectedEl).toBeNull();
    });

    it('fires selected change event on cell clicked', () => {
      let cellEls = monthViewNativeElement.querySelectorAll('.mat-calendar-table-cell');
      (cellEls[cellEls.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      let selectedEl = monthViewNativeElement.querySelector('.mat-calendar-table-selected');
      expect(selectedEl.innerHTML.trim()).toBe('31');
    });

    it('should mark active date', () => {
      let cellEls = monthViewNativeElement.querySelectorAll('.mat-calendar-table-cell');
      expect((cellEls[4] as HTMLElement).innerText.trim()).toBe('5');
      expect(cellEls[4].classList).toContain('mat-calendar-table-active');
    });
  });

  describe('month view with date filter', () => {
    let fixture: ComponentFixture<MonthViewWithDateFilter>;
    let testComponent: MonthViewWithDateFilter;
    let monthViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(MonthViewWithDateFilter);
      fixture.detectChanges();

      let monthViewDebugElement = fixture.debugElement.query(By.directive(MdMonthView));
      monthViewNativeElement = monthViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('should disable filtered dates', () => {
      let cells = monthViewNativeElement.querySelectorAll('.mat-calendar-table-cell');
      expect(cells[0].classList).toContain('mat-calendar-table-disabled');
      expect(cells[1].classList).not.toContain('mat-calendar-table-disabled');
    });
  });
});


@Component({
  template: `<md-month-view [activeDate]="date" [(selected)]="selected"></md-month-view>`,
})
class StandardMonthView {
  date = new SimpleDate(2017, 0, 5);
  selected = new SimpleDate(2017, 0, 10);
}


@Component({
  template: `<md-month-view activeDate="1/1/2017" [dateFilter]="dateFilter"></md-month-view>`
})
class MonthViewWithDateFilter {
  dateFilter(date: SimpleDate) {
    return date.date % 2 == 0;
  }
}
