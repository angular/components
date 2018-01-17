import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatMonthView} from './month-view';
import {MatCalendarBody} from './calendar-body';
import {MatNativeDateModule} from '@angular/material/core';
import {JAN, MAR} from '@angular/material/core';

describe('MatMonthView', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatNativeDateModule,
      ],
      declarations: [
        MatCalendarBody,
        MatMonthView,

        // Test components.
        StandardMonthView,
        MonthViewWithDateFilter,
        RangeMonthView,
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

      let monthViewDebugElement = fixture.debugElement.query(By.directive(MatMonthView));
      monthViewNativeElement = monthViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('has correct month label', () => {
      let labelEl = monthViewNativeElement.querySelector('.mat-calendar-body-label')!;
      expect(labelEl.innerHTML.trim()).toBe('JAN');
    });

    it('has 31 days', () => {
      let cellEls = monthViewNativeElement.querySelectorAll('.mat-calendar-body-cell')!;
      expect(cellEls.length).toBe(31);
    });

    it('shows selected date if in same month', () => {
      let selectedEl = monthViewNativeElement.querySelector('.mat-calendar-body-selected')!;
      expect(selectedEl.innerHTML.trim()).toBe('10');
    });

    it('does not show selected date if in different month', () => {
      testComponent.selected = new Date(2017, MAR, 10);
      fixture.detectChanges();

      let selectedEl = monthViewNativeElement.querySelector('.mat-calendar-body-selected');
      expect(selectedEl).toBeNull();
    });

    it('fires selected change event on cell clicked', () => {
      let cellEls = monthViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      (cellEls[cellEls.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      let selectedEl = monthViewNativeElement.querySelector('.mat-calendar-body-selected')!;
      expect(selectedEl.innerHTML.trim()).toBe('31');
    });

    it('should mark active date', () => {
      let cellEls = monthViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect((cellEls[4] as HTMLElement).innerText.trim()).toBe('5');
      expect(cellEls[4].classList).toContain('mat-calendar-body-active');
    });
  });

  describe('month view with date filter', () => {
    let fixture: ComponentFixture<MonthViewWithDateFilter>;
    let testComponent: MonthViewWithDateFilter;
    let monthViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(MonthViewWithDateFilter);
      fixture.detectChanges();

      let monthViewDebugElement = fixture.debugElement.query(By.directive(MatMonthView));
      monthViewNativeElement = monthViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('should disable filtered dates', () => {
      let cells = monthViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      expect(cells[0].classList).toContain('mat-calendar-body-disabled');
      expect(cells[1].classList).not.toContain('mat-calendar-body-disabled');
    });
  });

  describe('range month view', () => {
    let fixture: ComponentFixture<RangeMonthView>;
    let testComponent: RangeMonthView;
    let monthViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(RangeMonthView);
      fixture.detectChanges();

      let monthViewDebugElement = fixture.debugElement.query(By.directive(MatMonthView));
      monthViewNativeElement = monthViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('shows start and end dates in same month', () => {
      let selectedCells = monthViewNativeElement.querySelectorAll('.mat-calendar-body-selected')!;
      expect(selectedCells.length).toBe(2);
      expect(selectedCells[0].innerHTML.trim()).toBe('5');
      expect(selectedCells[1].innerHTML.trim()).toBe('15');
      let beginCell = monthViewNativeElement.querySelector('.mat-calendar-body-begin-range')!;
      expect(beginCell).not.toBeNull();
      let endCell = monthViewNativeElement.querySelector('.mat-calendar-body-end-range')!;
      expect(endCell).not.toBeNull();
    });

    it('shows semi-selected dates in the same month', () => {
      let semiSelectedCells = monthViewNativeElement
          .querySelectorAll('.mat-calendar-body-semi-selected')!;
      expect(semiSelectedCells.length).toBe(9);
      expect(semiSelectedCells[1].innerHTML.trim()).toBe('7');

    });

    it('does not show start date if in different month', () => {
      testComponent.activeDate = testComponent.endDate;
      testComponent.beginDate = new Date(2017, MAR, 10);
      fixture.detectChanges();
      let beginCell = monthViewNativeElement.querySelector('.mat-calendar-body-begin-range')!;
      expect(beginCell).toBeNull();
      let endCell = monthViewNativeElement.querySelector('.mat-calendar-body-end-range')!;
      expect(endCell).not.toBeNull();
    });

    it('shows semi-selected dates if end date in different month', () => {
      testComponent.activeDate = new Date(2016, MAR, 10);
      testComponent.beginDate = new Date(2016, MAR, 10);
      testComponent.endDate = new Date(2016, JAN, 10);
      fixture.detectChanges();

      let semiSelectedCells = monthViewNativeElement
          .querySelectorAll('.mat-calendar-body-semi-selected')!;
      expect(semiSelectedCells).not.toBeNull();
      expect(semiSelectedCells.length).toBe(21);
    });

    it('does not show end date if in different month', () => {
      testComponent.activeDate = testComponent.beginDate;
      testComponent.endDate = new Date(2018, MAR, 10);
      fixture.detectChanges();

      let beginCell = monthViewNativeElement.querySelector('.mat-calendar-body-begin-range')!;
      expect(beginCell).not.toBeNull();
      let endCell = monthViewNativeElement.querySelector('.mat-calendar-body-end-range')!;
      expect(endCell).toBeNull();
    });

    it('shows semi-selected dates if end date in different month', () => {
      testComponent.activeDate = testComponent.beginDate;
      testComponent.endDate = new Date(2018, MAR, 10);
      fixture.detectChanges();

      let semiSelectedCells = monthViewNativeElement
          .querySelectorAll('.mat-calendar-body-semi-selected')!;
      expect(semiSelectedCells).not.toBeNull();
      expect(semiSelectedCells.length).toBe(26);
    });

    it('does not show start and end date if in different month', () => {
      testComponent.beginDate = new Date(2017, MAR, 10);
      testComponent.activeDate = new Date(2018, JAN, 10);
      testComponent.endDate = new Date(2018, MAR, 10);
      fixture.detectChanges();

      let selectedCells = monthViewNativeElement.querySelectorAll('.mat-calendar-body-selected')!;
      expect(selectedCells.length).toBe(0);
    });

    it('shows semi-selected dates in the same month ' +
        'if start and end date in different month', () => {
      testComponent.beginDate = new Date(2016, MAR, 10);
      fixture.detectChanges();
      testComponent.activeDate = new Date(2017, MAR, 10);
      fixture.detectChanges();
      testComponent.endDate = new Date(2018, MAR, 10);
      fixture.detectChanges();
      let semiSelectedCells = monthViewNativeElement
          .querySelectorAll('.mat-calendar-body-semi-selected')!;
      expect(semiSelectedCells.length).toBe(31);
    });

    it('fires selected change event on cell clicked', () => {
      let cellEls = monthViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      (cellEls[cellEls.length - 1] as HTMLElement).click();
      fixture.detectChanges();
      expect(testComponent.selected).not.toBeNull();
    });

    it('fires user selected change only after second click on cell', () => {
      let cellEls = monthViewNativeElement.querySelectorAll('.mat-calendar-body-cell');
      (cellEls[cellEls.length - 1] as HTMLElement).click();
      fixture.detectChanges();
      expect(testComponent.userSelectedEventReceived).toBeFalsy();
      (cellEls[cellEls.length - 1] as HTMLElement).click();
      fixture.detectChanges();
      expect(testComponent.userSelectedEventReceived).toBeTruthy();
    });

  });

});


@Component({
  template: `<mat-month-view [activeDate]="date" [(selected)]="selected"></mat-month-view>`,
})
class StandardMonthView {
  date = new Date(2017, JAN, 5);
  selected = new Date(2017, JAN, 10);
}


@Component({
  template: `<mat-month-view [activeDate]="activeDate" [dateFilter]="dateFilter"></mat-month-view>`
})
class MonthViewWithDateFilter {
  activeDate = new Date(2017, JAN, 1);
  dateFilter(date: Date) {
    return date.getDate() % 2 == 0;
  }
}

@Component({
  template: `
      <mat-month-view
              [activeDate]="activeDate"
              [beginDate]="beginDate"
              [endDate]="endDate"
              [rangeMode]="true"
              (selectedChange)="dateSelected($event)"
              (_userSelection)="userSelected()">
      </mat-month-view>`,
})
class RangeMonthView {
  activeDate = new Date(2017, JAN, 5);
  beginDate = new Date(2017, JAN, 5);
  endDate = new Date(2017, JAN, 15);
  selected: Date;
  userSelectedEventReceived = false;

  dateSelected(date: Date) {
    this.selected = date;
  }

  userSelected() {
    this.userSelectedEventReceived = true;
  }
}

