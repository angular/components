import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {MdDatepickerModule} from './index';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdMonthView} from './month-view';
import {SimpleDate} from '../core/datetime/simple-date';


describe('MdMonthView', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdDatepickerModule],
      declarations: [
        StandardMonthView,
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

    it('has correct year label', () => {
      let labelEl = monthViewNativeElement.querySelector('.mat-calendar-table-label');
      expect(labelEl.innerHTML.trim()).toBe('Jan 2017');
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
  });
});


@Component({
  template: `<md-month-view [date]="date" [(selected)]="selected"></md-month-view>`,
})
class StandardMonthView {
  date = new SimpleDate(2017, 0, 5);
  selected = new SimpleDate(2017, 0, 10);
}
