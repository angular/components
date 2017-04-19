import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {MdCalendarCell, MdCalendarBody} from './calendar-body';
import {By} from '@angular/platform-browser';
import {SimpleDate} from '../core/datetime/simple-date';


describe('MdCalendarTable', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MdCalendarBody,

        // Test components.
        StandardCalendarTable,
        CalendarTableWithDisabledCells,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard calendar table', () => {
    let fixture: ComponentFixture<StandardCalendarTable>;
    let testComponent: StandardCalendarTable;
    let calendarTableNativeElement: Element;
    let rowEls: NodeListOf<Element>;
    let labelEls: NodeListOf<Element>;
    let cellEls: NodeListOf<Element>;

    let refreshElementLists = () => {
      rowEls = calendarTableNativeElement.querySelectorAll('tr');
      labelEls = calendarTableNativeElement.querySelectorAll('.mat-calendar-body-label');
      cellEls = calendarTableNativeElement.querySelectorAll('.mat-calendar-body-cell');
    };

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardCalendarTable);
      fixture.detectChanges();

      let calendarTableDebugElement = fixture.debugElement.query(By.directive(MdCalendarBody));
      calendarTableNativeElement = calendarTableDebugElement.nativeElement;
      testComponent = fixture.componentInstance;

      refreshElementLists();
    });

    it('creates table', () => {
      expect(rowEls.length).toBe(3);
      expect(labelEls.length).toBe(1);
      expect(cellEls.length).toBe(14);
    });

    it('highlights today', () => {
      let todayCell = calendarTableNativeElement.querySelector('.mat-calendar-body-today');
      expect(todayCell).not.toBeNull();
      expect(todayCell.innerHTML.trim()).toBe('3');
    });

    it('highlights selected', () => {
      let selectedCell = calendarTableNativeElement.querySelector('.mat-calendar-body-selected');
      expect(selectedCell).not.toBeNull();
      expect(selectedCell.innerHTML.trim()).toBe('4');
    });

    it('places label in first row if space is available', () => {
      testComponent.rows[0] = testComponent.rows[0].slice(3);
      testComponent.rows = testComponent.rows.slice();
      fixture.detectChanges();
      refreshElementLists();

      expect(rowEls.length).toBe(2);
      expect(labelEls.length).toBe(1);
      expect(cellEls.length).toBe(11);
      expect(rowEls[0].firstElementChild.classList)
          .toContain('mat-calendar-body-label', 'first cell should be the label');
      expect(labelEls[0].getAttribute('colspan')).toBe('3');
    });

    it('cell should be selected on click', () => {
      let todayElement =
          calendarTableNativeElement.querySelector('.mat-calendar-body-today') as HTMLElement;
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

  describe('calendar table with disabled cells', () => {
    let fixture: ComponentFixture<CalendarTableWithDisabledCells>;
    let testComponent: CalendarTableWithDisabledCells;
    let calendarTableNativeElement: Element;
    let cellEls: NodeListOf<Element>;

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarTableWithDisabledCells);
      fixture.detectChanges();

      let calendarTableDebugElement = fixture.debugElement.query(By.directive(MdCalendarBody));
      calendarTableNativeElement = calendarTableDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
      cellEls = calendarTableNativeElement.querySelectorAll('.mat-calendar-body-cell');
    });

    it('should only allow selection of disabled cells when allowDisabledSelection is true', () => {
      (cellEls[0] as HTMLElement).click();
      fixture.detectChanges();

      expect(testComponent.selected).toBeFalsy();

      testComponent.allowDisabledSelection = true;
      fixture.detectChanges();

      (cellEls[0] as HTMLElement).click();
      fixture.detectChanges();

      expect(testComponent.selected).toBe(1);
    });
  });
});


@Component({
  template: `<table md-calendar-body
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
class StandardCalendarTable {
  label = 'Jan 2017';
  rows = [[1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14]].map(r => r.map(createCell));
  todayValue = 3;
  selectedValue = 4;
  labelMinRequiredCells = 3;
  numCols = 7;

  onSelect(value: number) {
    this.selectedValue = value;
  }
}


@Component({
  template: `<table md-calendar-body
                    [rows]="rows"
                    [allowDisabledSelection]="allowDisabledSelection"
                    (selectedValueChange)="selected = $event">
             </table>`
})
class CalendarTableWithDisabledCells {
  rows = [[1, 2, 3, 4]].map(r => r.map(d => {
    let cell = createCell(d);
    cell.enabled = d % 2 == 0;
    return cell;
  }));
  allowDisabledSelection = false;
  selected: SimpleDate;
}


function createCell(value: number) {
  return new MdCalendarCell(value, `${value}`, true);
}
