import {Component} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatNativeDateModule} from '@angular/material/core';
import {MatCalendarBody, MatCalendarCell} from './calendar-body';


describe('MatCalendarBody', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatNativeDateModule,
      ],
      declarations: [
        MatCalendarBody,

        // Test components.
        StandardCalendarBody,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard calendar body', () => {
    let fixture: ComponentFixture<StandardCalendarBody>;
    let testComponent: StandardCalendarBody;
    let calendarBodyNativeElement: Element;
    let rowEls: Element[];
    let labelEls: Element[];
    let cellEls: Element[];

    function refreshElementLists() {
      rowEls = Array.from(calendarBodyNativeElement.querySelectorAll('tr'));
      labelEls = Array.from(calendarBodyNativeElement.querySelectorAll('.mat-calendar-body-label'));
      cellEls = Array.from(calendarBodyNativeElement.querySelectorAll('.mat-calendar-body-cell'));
    }

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardCalendarBody);
      fixture.detectChanges();

      const calendarBodyDebugElement = fixture.debugElement.query(By.directive(MatCalendarBody));
      calendarBodyNativeElement = calendarBodyDebugElement.nativeElement;
      testComponent = fixture.componentInstance;

      refreshElementLists();
    });

    it('creates body', () => {
      expect(rowEls.length).toBe(6);
      expect(labelEls.length).toBe(1);
      expect(cellEls.length).toBe(daysInCurrentMonth());
    });

    it('highlights today', () => {
      const todayCell = calendarBodyNativeElement.querySelector('.mat-calendar-body-today')!;
      expect(todayCell).not.toBeNull();
      expect(todayCell.innerHTML.trim()).toBe(`${new Date().getDate()}`);
    });

    it('highlights selected', () => {
      const selectedCell = calendarBodyNativeElement.querySelector('.mat-calendar-body-selected')!;
      expect(selectedCell).not.toBeNull();
      expect(selectedCell.innerHTML.trim()).toBe('4');
    });

    it('should set aria-selected correctly', () => {
      const selectedCells = cellEls.filter(c => c.getAttribute('aria-selected') === 'true');
      const deselectedCells = cellEls.filter(c => c.getAttribute('aria-selected') === 'false');

      expect(selectedCells.length).toBe(1, 'Expected one cell to be marked as selected.');
      expect(deselectedCells.length)
          .toBe(cellEls.length - 1, 'Expected remaining cells to be marked as deselected.');
    });

    it('places label in first row if space is available', () => {
      testComponent.rows[0] = testComponent.rows[0].slice(3);
      testComponent.rows = testComponent.rows.slice();
      fixture.detectChanges();
      refreshElementLists();

      expect(rowEls.length).toBe(2);
      expect(labelEls.length).toBe(1);
      expect(cellEls.length).toBe(11);
      expect(rowEls[0].firstElementChild!.classList)
          .toContain('mat-calendar-body-label', 'first cell should be the label');
      expect(labelEls[0].getAttribute('colspan')).toBe('3');
    });

    it('cell should be selected on click', () => {
      const todayElement =
          calendarBodyNativeElement.querySelector('.mat-calendar-body-today') as HTMLElement;
      todayElement.click();
      fixture.detectChanges();

      expect(todayElement.classList)
          .toContain('mat-calendar-body-selected', 'today should be selected');
    });

    it('should mark active date', () => {
      expect((cellEls[10] as HTMLElement).innerText.trim()).toBe('11');
      expect(cellEls[10].classList).toContain('mat-calendar-body-active');
    });
  });

});


@Component({
  template: `<table mat-calendar-body
                    [label]="label"
                    [rows]="rows"
                    [todayValue]="todayValue"
                    [selectedValue]="selectedValue"
                    [labelMinRequiredCells]="labelMinRequiredCells"
                    [numCols]="numCols"
                    [activeCell]="10"
                    (selectedValueChange)="onSelect($event)">
             </table>`,
})
class StandardCalendarBody {
  label = 'Jan 2017';
  rows: MatCalendarCell<Date>[][];
  todayValue = 3;
  selectedValue = 4;
  labelMinRequiredCells = 3;
  numCols = 7;

  constructor() {
    const daysInMonth = daysInCurrentMonth();
    const rows = this.createStackedNumbers(daysInMonth);

    // We create rows based on the current month. This ensures that today is included.
    this.rows = rows.map(r => r.map(this.createCell));
  }

  onSelect(value: number) {
    this.selectedValue = value;
  }

  /**
   * Creates an array of arrays. Each inner array holds up to 7 elements. Enough inner arrays
   * are created until all numbers from 1 to the given number are covered.
   */
  private createStackedNumbers(days: number): number[][] {
    const array: number[][] = [];
    let day = 1;
    let buffer: number[] = [];

    while (day <= days) {
      buffer.push(day);

      if (buffer.length === 7) {
        array.push(buffer);
        buffer = [];
      }

      day++;
    }

    if (buffer.length > 0) {
      array.push(buffer);
    }

    return array;
  }

  private createCell(value: number) {
    const day = new Date();
    day.setDate(value);
    return new MatCalendarCell(
        {start: day, end: new Date(day.getTime())},
        `${value}`,
        `${value}-label`,
        true
    );
  }
}

/**
 * Returns the amount of days in the current month based on Date.
 */
function daysInCurrentMonth() {
  const today = new Date();
  today.setMonth(today.getMonth() + 1);
  today.setDate(0);
  return today.getDate();
}

