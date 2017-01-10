import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {MdDatePickerModule} from './index';
import {Component, DebugElement} from '@angular/core';
import {MdCalendarTable, MdCalendarCell} from './calendar-table';
import {By} from '@angular/platform-browser';


describe('MdCalendarTable', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdDatePickerModule],
      declarations: [
        StandardCalendarTable,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard calendar table', () => {
    let fixture: ComponentFixture<StandardCalendarTable>;
    let calendarTableInstance: StandardCalendarTable;
    let calendarTableNativeElement: Element;
    let rowEls: NodeListOf<Element>;
    let labelEls: NodeListOf<Element>;
    let cellEls: NodeListOf<Element>;

    let refreshElementLists = () => {
      rowEls = calendarTableNativeElement.querySelectorAll('tr');
      labelEls = calendarTableNativeElement.querySelectorAll('.md-calendar-table-label');
      cellEls = calendarTableNativeElement.querySelectorAll('.md-calendar-table-cell');
    };

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardCalendarTable);
      fixture.detectChanges();

      let calendarTableDebugElement = fixture.debugElement.query(By.directive(MdCalendarTable));
      calendarTableNativeElement = calendarTableDebugElement.nativeElement;
      calendarTableInstance = calendarTableDebugElement.componentInstance;

      refreshElementLists();
    });

    it('creates table', () => {
      expect(rowEls.length).toBe(3);
      expect(labelEls.length).toBe(1);
      expect(cellEls.length).toBe(14);
    });

    it('highlights today', () => {
      let todayCell = calendarTableNativeElement.querySelector('.md-calendar-table-today');
      expect(todayCell).not.toBeNull();
      expect(todayCell.innerHTML).toBe('3');
    })
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
  rows = [[1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14]].map(r => r.map(c => createCell));
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
