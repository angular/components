import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdYearView} from './year-view';
import {SimpleDate} from '../core/datetime/simple-date';
import {MdCalendarTable} from './calendar-table';
import {DatetimeModule} from '../core/datetime/index';


describe('MdYearView', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DatetimeModule,
      ],
      declarations: [
        MdCalendarTable,
        MdYearView,

        // Test components.
        StandardYearView,
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
      let labelEl = yearViewNativeElement.querySelector('.mat-calendar-table-label');
      expect(labelEl.innerHTML.trim()).toBe('2017');
    });

    it('has 12 months', () => {
      let cellEls = yearViewNativeElement.querySelectorAll('.mat-calendar-table-cell');
      expect(cellEls.length).toBe(12);
    });

    it('shows selected month if in same year', () => {
      let selectedEl = yearViewNativeElement.querySelector('.mat-calendar-table-selected');
      expect(selectedEl.innerHTML.trim()).toBe('MAR');
    });

    it('does not show selected month if in different year', () => {
      testComponent.selected = new SimpleDate(2016, 2, 10);
      fixture.detectChanges();

      let selectedEl = yearViewNativeElement.querySelector('.mat-calendar-table-selected');
      expect(selectedEl).toBeNull();
    });

    it('fires selected change event on cell clicked', () => {
      let cellEls = yearViewNativeElement.querySelectorAll('.mat-calendar-table-cell');
      (cellEls[cellEls.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      let selectedEl = yearViewNativeElement.querySelector('.mat-calendar-table-selected');
      expect(selectedEl.innerHTML.trim()).toBe('DEC');
    });
  });
});


@Component({
  template: `<md-year-view [date]="date" [(selected)]="selected"></md-year-view>`,
})
class StandardYearView {
  date = new SimpleDate(2017, 0, 5);
  selected = new SimpleDate(2017, 2, 10);
}
