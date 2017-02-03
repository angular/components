import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {MdDatepickerModule} from './index';
import {Component} from '@angular/core';
import {MdCalendarTable, MdCalendarCell} from './calendar-table';
import {By} from '@angular/platform-browser';


describe('MdCalendarTable', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdDatepickerModule],
      declarations: [
        StandardCalendarTable,
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
      labelEls = calendarTableNativeElement.querySelectorAll('.mat-calendar-table-label');
      cellEls = calendarTableNativeElement.querySelectorAll('.mat-calendar-table-cell');
    };

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardCalendarTable);
      fixture.detectChanges();

      let calendarTableDebugElement = fixture.debugElement.query(By.directive(MdCalendarTable));
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
      let todayCell = calendarTableNativeElement.querySelector('.mat-calendar-table-today');
      expect(todayCell).not.toBeNull();
      expect(todayCell.innerHTML.trim()).toBe('3');
    });

    it('highlights selected', () => {
      let selectedCell = calendarTableNativeElement.querySelector('.mat-calendar-table-selected');
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
      expect(rowEls[0].firstElementChild.classList.contains('mat-calendar-table-label')).toBe(
          true, 'first cell should be the label');
      expect(labelEls[0].getAttribute('colspan')).toBe('3');
    });

    it('cell should be selected on click', () => {
      let todayElement =
          calendarTableNativeElement.querySelector('.mat-calendar-table-today') as HTMLElement;
      todayElement.click();
      fixture.detectChanges();

      expect(todayElement.classList.contains('mat-calendar-table-selected')).toBe(
          true, 'today should be selected');
    });
  });
});


@Component({
  template: `<md-calendar-table [label]="label"
                                [rows]="rows"
                                [todayValue]="todayValue"
                                [selectedValue]="selectedValue"
                                [labelMinRequiredCells]="labelMinRequiredCells"
                                [numCols]="numCols"
                                (selectedValueChange)="onSelect($event)">                           
             </md-calendar-table>`,
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


function createCell(value: number) {
  return new MdCalendarCell(value, `${value}`);
}
