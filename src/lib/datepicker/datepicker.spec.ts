import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {MdDatepickerModule} from './index';
import {Component, ViewChild} from '@angular/core';
import {MdDatepicker} from './datepicker';
import {MdDatepickerInput} from './datepicker-input';
import {SimpleDate} from '../core/datetime/simple-date';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {dispatchFakeEvent} from '../core/testing/dispatch-events';


describe('MdDatepicker', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdDatepickerModule, FormsModule, ReactiveFormsModule],
      declarations: [
        StandardDatepicker,
        MultiInputDatepicker,
        NoInputDatepicker,
        DatepickerWithStartAt,
        DatepickerWithNgModel,
        DatepickerWithFormControl,
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
      testComponent.datepicker._selected = selected;
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(document.querySelector('md-dialog-container')).toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(selected);
      });
    }));

    it('startAt should fallback to input value', () => {
      expect(testComponent.datepicker.startAt).toEqual(new SimpleDate(2020, 0, 1));
    });
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

  describe('datepicker with ngModel', () => {
    let fixture: ComponentFixture<DatepickerWithNgModel>;
    let testComponent: DatepickerWithNgModel;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(DatepickerWithNgModel);
      detectModelChanges(fixture);

      testComponent = fixture.componentInstance;
    }));

    it('should update datepicker when model changes', fakeAsync(() => {
      expect(testComponent.datepickerInput.value).toBeNull();
      expect(testComponent.datepicker._selected).toBeNull();

      let selected = new SimpleDate(2017, 0, 1);
      testComponent.selected = selected;
      detectModelChanges(fixture);

      expect(testComponent.datepickerInput.value).toEqual(selected);
      expect(testComponent.datepicker._selected).toEqual(selected);
    }));

    it('should update model when date is selected', fakeAsync(() => {
      expect(testComponent.selected).toBeNull();
      expect(testComponent.datepickerInput.value).toBeNull();

      let selected = new SimpleDate(2017, 0, 1);
      testComponent.datepicker._selected = selected;
      detectModelChanges(fixture);

      expect(testComponent.selected).toEqual(selected);
      expect(testComponent.datepickerInput.value).toEqual(selected);
    }));

    it('should mark input dirty after input event', () => {
      let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

      expect(inputEl.classList).toContain('ng-pristine');

      dispatchFakeEvent(inputEl, 'input');
      fixture.detectChanges();

      expect(inputEl.classList).toContain('ng-dirty');
    });

    it('should mark input dirty after date selected', fakeAsync(() => {
      let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

      expect(inputEl.classList).toContain('ng-pristine');

      testComponent.datepicker._selected = new SimpleDate(2017, 0, 1);
      detectModelChanges(fixture);

      expect(inputEl.classList).toContain('ng-dirty');
    }));

    it('should not mark dirty after model change', fakeAsync(() => {
      let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

      expect(inputEl.classList).toContain('ng-pristine');

      testComponent.selected = new SimpleDate(2017, 0, 1);
      detectModelChanges(fixture);

      expect(inputEl.classList).toContain('ng-pristine');
    }));

    it('should mark input touched on blur', () => {
      let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

      expect(inputEl.classList).toContain('ng-untouched');

      dispatchFakeEvent(inputEl, 'focus');
      fixture.detectChanges();

      expect(inputEl.classList).toContain('ng-untouched');

      dispatchFakeEvent(inputEl, 'blur');
      fixture.detectChanges();

      expect(inputEl.classList).toContain('ng-touched');
    });
  });

  describe('datepicker with formControl', () => {
    let fixture: ComponentFixture<DatepickerWithFormControl>;
    let testComponent: DatepickerWithFormControl;

    beforeEach(() => {
      fixture = TestBed.createComponent(DatepickerWithFormControl);
      fixture.detectChanges();

      testComponent = fixture.componentInstance;
    });

    it('should update datepicker when formControl changes', () => {
      expect(testComponent.datepickerInput.value).toBeNull();
      expect(testComponent.datepicker._selected).toBeNull();

      let selected = new SimpleDate(2017, 0, 1);
      testComponent.formControl.setValue(selected);
      fixture.detectChanges();

      expect(testComponent.datepickerInput.value).toEqual(selected);
      expect(testComponent.datepicker._selected).toEqual(selected);
    });

    it('should update formControl when date is selected', () => {
      expect(testComponent.formControl.value).toBeNull();
      expect(testComponent.datepickerInput.value).toBeNull();

      let selected = new SimpleDate(2017, 0, 1);
      testComponent.datepicker._selected = selected;
      fixture.detectChanges();

      expect(testComponent.formControl.value).toEqual(selected);
      expect(testComponent.datepickerInput.value).toEqual(selected);
    });

    it('should disable input when form control disabled', () => {
      let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

      expect(inputEl.disabled).toBe(false);

      testComponent.formControl.disable();
      fixture.detectChanges();

      expect(inputEl.disabled).toBe(true);
    });
  });
});


function detectModelChanges(fixture: ComponentFixture<any>) {
  fixture.detectChanges();
  tick();
  fixture.detectChanges();
}


@Component({
  template: `<input [mdDatepicker]="d" value="1/1/2020"><md-datepicker #d></md-datepicker>`,
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
    <input [mdDatepicker]="d" value="1/1/2020">
    <md-datepicker #d [startAt]="'1/1/2010'"></md-datepicker>
  `,
})
class DatepickerWithStartAt {
  @ViewChild('d') datepicker: MdDatepicker;
}


@Component({
  template: `<input [(ngModel)]="selected" [mdDatepicker]="d"><md-datepicker #d></md-datepicker>`
})
class DatepickerWithNgModel {
  selected: SimpleDate = null;
  @ViewChild('d') datepicker: MdDatepicker;
  @ViewChild(MdDatepickerInput) datepickerInput: MdDatepickerInput;
}


@Component({
  template: `
    <input [formControl]="formControl" [mdDatepicker]="d">
    <md-datepicker #d></md-datepicker>
  `
})
class DatepickerWithFormControl {
  formControl = new FormControl();
  @ViewChild('d') datepicker: MdDatepicker;
  @ViewChild(MdDatepickerInput) datepickerInput: MdDatepickerInput;
}
