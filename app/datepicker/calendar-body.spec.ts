import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {MatCalendarBody, MatCalendarCell} from './calendar-body';
import {By} from '@angular/platform-browser';


describe('MatCalendarBody', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MatCalendarBody,

        // Test components.
        StandardCalendarBody,
        RangeCalendarBody,
        CalendarBodyWithDisabledCells,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard calendar body', () => {
    let fixture: ComponentFixture<StandardCalendarBody>;
    let testComponent: StandardCalendarBody;
    let calendarBodyNativeElement: Element;
    let rowEls: NodeListOf<Element>;
    let labelEls: NodeListOf<Element>;
    let cellEls: NodeListOf<Element>;

    let refreshElementLists = () => {
      rowEls = calendarBodyNativeElement.querySelectorAll('tr');
      labelEls = calendarBodyNativeElement.querySelectorAll('.mat-calendar-body-label');
      cellEls = calendarBodyNativeElement.querySelectorAll('.mat-calendar-body-cell');
    };

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardCalendarBody);
      fixture.detectChanges();

      let calendarBodyDebugElement = fixture.debugElement.query(By.directive(MatCalendarBody));
      calendarBodyNativeElement = calendarBodyDebugElement.nativeElement;
      testComponent = fixture.componentInstance;

      refreshElementLists();
    });

    it('creates body', () => {
      expect(rowEls.length).toBe(3);
      expect(labelEls.length).toBe(1);
      expect(cellEls.length).toBe(14);
    });

    it('highlights today', () => {
      let todayCell = calendarBodyNativeElement.querySelector('.mat-calendar-body-today')!;
      expect(todayCell).not.toBeNull();
      expect(todayCell.innerHTML.trim()).toBe('3');
    });

    it('highlights selected', () => {
      let selectedCell = calendarBodyNativeElement.querySelector('.mat-calendar-body-selected')!;
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
      expect(rowEls[0].firstElementChild!.classList)
          .toContain('mat-calendar-body-label', 'first cell should be the label');
      expect(labelEls[0].getAttribute('colspan')).toBe('3');
    });

    it('cell should be selected on click', () => {
      let todayElement =
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

  describe('calendar body with disabled cells', () => {
    let fixture: ComponentFixture<CalendarBodyWithDisabledCells>;
    let testComponent: CalendarBodyWithDisabledCells;
    let calendarBodyNativeElement: Element;
    let cellEls: NodeListOf<Element>;

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarBodyWithDisabledCells);
      fixture.detectChanges();

      let calendarBodyDebugElement = fixture.debugElement.query(By.directive(MatCalendarBody));
      calendarBodyNativeElement = calendarBodyDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
      cellEls = calendarBodyNativeElement.querySelectorAll('.mat-calendar-body-cell');
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

  describe('range calendar body', () => {
    let fixture: ComponentFixture<RangeCalendarBody>;
    let testComponent: RangeCalendarBody;
    let calendarBodyNativeElement: Element;
    let rowEls: NodeListOf<Element>;
    let labelEls: NodeListOf<Element>;
    let cellEls: NodeListOf<Element>;

    let refreshElementLists = () => {
      rowEls = calendarBodyNativeElement.querySelectorAll('tr');
      labelEls = calendarBodyNativeElement.querySelectorAll('.mat-calendar-body-label');
      cellEls = calendarBodyNativeElement.querySelectorAll('.mat-calendar-body-cell');
    };
    let fullRangeSelectedModeOn = () => {
      testComponent.beginValue = null;
      testComponent.endValue = null;
      testComponent.rangeFull = true;
      fixture.detectChanges();
    };
    beforeEach(() => {
      fixture = TestBed.createComponent(RangeCalendarBody);
      fixture.detectChanges();

      let calendarBodyDebugElement = fixture.debugElement.query(By.directive(MatCalendarBody));
      calendarBodyNativeElement = calendarBodyDebugElement.nativeElement;
      testComponent = fixture.componentInstance;

      refreshElementLists();
    });

    it('start and end of interval should be marked as selected', () => {
      let selectedCells = calendarBodyNativeElement
          .querySelectorAll('.mat-calendar-body-selected')!;
      expect(selectedCells.length).toBe(2);
      expect(selectedCells[0].innerHTML.trim()).toBe('4');
      expect(selectedCells[1].innerHTML.trim()).toBe('7');
    });

    it('dates in interval should be marked as semi-selected', () => {
      let semiSelectedCells = calendarBodyNativeElement
          .querySelectorAll('.mat-calendar-body-semi-selected')!;
      expect(semiSelectedCells.length).toBe(2);
      expect(semiSelectedCells[0].innerHTML.trim()).toBe('5');
      expect(semiSelectedCells[1].innerHTML.trim()).toBe('6');
    });

    it('start of interval should be marked as selected without end', () => {
      testComponent.endValue = null;
      fixture.detectChanges();
      let selectedCells = calendarBodyNativeElement
          .querySelectorAll('.mat-calendar-body-selected')!;
      expect(selectedCells.length).toBe(1);
      expect(selectedCells[0].innerHTML.trim()).toBe('4');
    });

    it('end of interval should be marked as selected without start', () => {
      testComponent.beginValue = null;
      fixture.detectChanges();
      let selectedCells = calendarBodyNativeElement
          .querySelectorAll('.mat-calendar-body-selected')!;
      expect(selectedCells.length).toBe(1);
      expect(selectedCells[0].innerHTML.trim()).toBe('7');
    });

    it('all cells should be marked as semi-selected', () => {
      fullRangeSelectedModeOn();
      let semiSelectedCells = calendarBodyNativeElement
          .querySelectorAll('.mat-calendar-body-semi-selected')!;
      expect(semiSelectedCells.length).toBe(14);
    });

    it('no selected cells if full body  inside interval', () => {
      fullRangeSelectedModeOn();
      let selectedCells = calendarBodyNativeElement
          .querySelectorAll('.mat-calendar-body-selected')!;
      expect(selectedCells.length).toBe(0);
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
  template: `<table mat-calendar-body
                    [rows]="rows"
                    [allowDisabledSelection]="allowDisabledSelection"
                    (selectedValueChange)="selected = $event">
             </table>`
})
class CalendarBodyWithDisabledCells {
  rows = [[1, 2, 3, 4]].map(r => r.map(d => {
    let cell = createCell(d);
    cell.enabled = d % 2 == 0;
    return cell;
  }));
  allowDisabledSelection = false;
  selected: number;
}


function createCell(value: number) {
  return new MatCalendarCell(value, `${value}`, `${value}-label`, true);
}


@Component({
  template: `<table mat-calendar-body
                    [rows]="rows"
                    [rangeMode]="true"
                    [rangeFull]="rangeFull"
                    [begin]="beginValue"
                    [end]="endValue">
             </table>`,
})
class RangeCalendarBody {
  label = 'Jan 2017';
  rows = [[1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14]].map(r => r.map(createCell));
  beginValue: number|null = 4;
  endValue: number|null = 7;
  rangeFull = false;
}
