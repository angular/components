import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {MdDatepickerModule} from './index';
import {Component, ViewChild} from '@angular/core';
import {MdDatepicker} from './datepicker';

describe('MdDatepicker', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdDatepickerModule],
      declarations: [
        StandardDatepicker,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard month view', () => {
    let fixture: ComponentFixture<StandardDatepicker>;
    let testComponent: StandardDatepicker;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardDatepicker);
      fixture.detectChanges();

      testComponent = fixture.componentInstance;
    });

    it('openStandardUi should open popup', () => {
      expect(document.querySelector('.cdk-overlay-pane')).toBeNull();

      testComponent.datepicker.openStandardUi();
      fixture.detectChanges();

      expect(document.querySelector('.cdk-overlay-pane')).not.toBeNull();
    });

    it('openTouchUi should open dialog', () => {
      expect(document.querySelector('md-dialog-container')).toBeNull();

      testComponent.datepicker.openTouchUi();
      fixture.detectChanges();

      expect(document.querySelector('md-dialog-container')).not.toBeNull();
    });

    it('close should close popup', () => {
      testComponent.datepicker.openStandardUi();
      fixture.detectChanges();

      let popup = document.querySelector('.cdk-overlay-pane');
      expect(popup).not.toBeNull();
      expect(parseInt(getComputedStyle(popup).height)).not.toBe(0);

      testComponent.datepicker.close();
      fixture.detectChanges();

      expect(parseInt(getComputedStyle(popup).height)).toBe(0);
    });

    it('openTouchUi should open dialog', () => {
      testComponent.datepicker.openTouchUi();
      fixture.detectChanges();

      expect(document.querySelector('md-dialog-container')).not.toBeNull();

      testComponent.datepicker.close();
      fixture.detectChanges();

      expect(document.querySelector('md-dialog-container')).toBeNull();
    });
  });
});


@Component({
  template: `<input [mdDatepicker]="d"><md-datepicker #d></md-datepicker>`,
})
class StandardDatepicker {
  @ViewChild('d') datepicker: MdDatepicker;
}
