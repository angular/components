import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {MdDatepickerModule} from './index';
import {Component, ViewChild} from '@angular/core';
import {MdDatepicker} from './datepicker';
import {MdDatepickerInput} from './datepicker-input';
import {SimpleDate} from '../core/datetime/simple-date';

describe('MdDatepicker', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdDatepickerModule],
      declarations: [
        StandardDatepicker,
        MultiInputDatepicker,
        NoInputDatepicker,
        DatepickerWithStartAt,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard datepicker', () => {
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

    it('close should close popup', async(() => {
      testComponent.datepicker.openStandardUi();
      fixture.detectChanges();

      let popup = document.querySelector('.cdk-overlay-pane');
      expect(popup).not.toBeNull();
      expect(parseInt(getComputedStyle(popup).height)).not.toBe(0);

      testComponent.datepicker.close();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(parseInt(getComputedStyle(popup).height)).toBe(0);
      });
    }));

    it('close should close dialog', async(() => {
      testComponent.datepicker.openTouchUi();
      fixture.detectChanges();

      expect(document.querySelector('md-dialog-container')).not.toBeNull();

      testComponent.datepicker.close();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(document.querySelector('md-dialog-container')).toBeNull();
      });
    }));

    it('setting selected should update input and close calendar', async(() => {
      testComponent.datepicker.openTouchUi();
      fixture.detectChanges();

      expect(document.querySelector('md-dialog-container')).not.toBeNull();
      expect(testComponent.datepickerInput.value).toEqual(new SimpleDate(2020, 0, 1));

      let selected = new SimpleDate(2017, 0, 1);
      testComponent.datepicker.selected = selected;
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(document.querySelector('md-dialog-container')).toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(selected);
      });
    }));

    it('startAt should fallback to input value', () => {
      expect(testComponent.datepicker.startAt).toEqual(new SimpleDate(2020, 0, 1));
    })
  });

  describe('datepicker with too many inputs', () => {
    it('should throw when multiple inputs registered', () => {
      let fixture = TestBed.createComponent(MultiInputDatepicker);
      expect(() => fixture.detectChanges()).toThrow();
    });
  });

  describe('datepicker with no inputs', () => {
    let fixture: ComponentFixture<NoInputDatepicker>;
    let testComponent: NoInputDatepicker;

    beforeEach(() => {
      fixture = TestBed.createComponent(NoInputDatepicker);
      fixture.detectChanges();

      testComponent = fixture.componentInstance;
    });

    it('should throw when opened with no registered inputs', () => {
      expect(() => testComponent.datepicker.openStandardUi()).toThrow();
    });
  });

  describe('datepicker with startAt', () => {
    let fixture: ComponentFixture<DatepickerWithStartAt>;
    let testComponent: DatepickerWithStartAt;

    beforeEach(() => {
      fixture = TestBed.createComponent(DatepickerWithStartAt);
      fixture.detectChanges();

      testComponent = fixture.componentInstance;
    });

    it('explicit startAt should override input value', () => {
      expect(testComponent.datepicker.startAt).toEqual(new SimpleDate(2010, 0, 1));
    });
  });
});


@Component({
  template: `<input [mdDatepicker]="d" [value]="'1/1/2020'"><md-datepicker #d></md-datepicker>`,
})
class StandardDatepicker {
  @ViewChild('d') datepicker: MdDatepicker;
  @ViewChild(MdDatepickerInput) datepickerInput: MdDatepickerInput;
}


@Component({
  template: `
    <input [mdDatepicker]="d"><input [mdDatepicker]="d"><md-datepicker #d></md-datepicker>
  `,
})
class MultiInputDatepicker {}


@Component({
  template: `<md-datepicker #d></md-datepicker>`,
})
class NoInputDatepicker {
  @ViewChild('d') datepicker: MdDatepicker;
}


@Component({
  template: `
    <input [mdDatepicker]="d" [value]="'1/1/2020'">
    <md-datepicker #d [startAt]="'1/1/2010'"></md-datepicker>
  `,
})
class DatepickerWithStartAt {
  @ViewChild('d') datepicker: MdDatepicker;
}
