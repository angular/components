import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {MdDatePickerModule} from './index';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdMonthView} from './month-view';


describe('MdMonthView', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdDatePickerModule],
      declarations: [
        StandardMonthView,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard year view', () => {
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
      let labelEl = monthViewNativeElement.querySelector('.md-calendar-table-label');
      expect(labelEl.innerHTML.trim()).toBe('JAN 2017');
    });

    it('has 31 days', () => {
      let cellEls = monthViewNativeElement.querySelectorAll('.md-calendar-table-cell');
      expect(cellEls.length).toBe(31);
    });

    it('shows selected date if in same month', () => {
      let selectedEl = monthViewNativeElement.querySelector('.md-calendar-table-selected');
      expect(selectedEl.innerHTML.trim()).toBe('10');
    });

    it('does not show selected date if in different month', () => {
      testComponent.selected = new Date('3/10/2017');
      fixture.detectChanges();

      let selectedEl = monthViewNativeElement.querySelector('.md-calendar-table-selected');
      expect(selectedEl).toBeNull();
    });

    it('fires selected change event on cell clicked', () => {
      let cellEls = monthViewNativeElement.querySelectorAll('.md-calendar-table-cell');
      (cellEls[cellEls.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      let selectedEl = monthViewNativeElement.querySelector('.md-calendar-table-selected');
      expect(selectedEl.innerHTML.trim()).toBe('31');
    });
  });
});


@Component({
  template: `<md-month-view [date]="date"
                            [selected]="selected"
                            (selectedChange)="selected = $event">           
             </md-month-view>`,
})
class StandardMonthView {
  date = new Date('1/5/2017');
  selected = new Date('1/10/2017');
}
