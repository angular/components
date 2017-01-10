import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {MdDatePickerModule} from './index';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdYearView} from './year-view';


describe('MdYearView', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdDatePickerModule],
      declarations: [
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
      let labelEl = yearViewNativeElement.querySelector('.md-calendar-table-label');
      expect(labelEl.innerHTML.trim()).toBe('2017');
    });

    it('has 12 months', () => {
      let cellEls = yearViewNativeElement.querySelectorAll('.md-calendar-table-cell');
      expect(cellEls.length).toBe(12);
    });

    it('shows selected month if in same year', () => {
      let selectedEl = yearViewNativeElement.querySelector('.md-calendar-table-selected');
      expect(selectedEl.innerHTML.trim()).toBe('Mar');
    });

    it('does not show selected month if in different year', () => {
      testComponent.selected = new Date('3/10/2016');
      fixture.detectChanges();

      let selectedEl = yearViewNativeElement.querySelector('.md-calendar-table-selected');
      expect(selectedEl).toBeNull();
    });

    it('fires selected change event on cell clicked', () => {
      let cellEls = yearViewNativeElement.querySelectorAll('.md-calendar-table-cell');
      (cellEls[cellEls.length - 1] as HTMLElement).click();
      fixture.detectChanges();

      let selectedEl = yearViewNativeElement.querySelector('.md-calendar-table-selected');
      expect(selectedEl.innerHTML.trim()).toBe('Dec');
    });
  });
});


@Component({
  template: `<md-year-view [date]="date"
                           [selected]="selected"
                           (selectedChange)="selected = $event">           
             </md-year-view>`,
})
class StandardYearView {
  date = new Date('1/5/2017');
  selected = new Date('3/10/2017');
}
