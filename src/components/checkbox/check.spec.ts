import {it, ddescribe, beforeEach, inject, async} from '@angular/core/testing';
import {FORM_DIRECTIVES, NgModel, NgControlName, NgControlStatus, NgControl} from '@angular/common';
import {TestComponentBuilder} from '@angular/compiler/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdCheckbox} from './checkbox';

ddescribe('MdCheckbox', () => {
  let builder: TestComponentBuilder;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  it('should apply appriate ngModel css classes', async(() => {
    builder.createAsync(CheckboxWithFormDirectives).then(fixture => {
      fixture.detectChanges();

      let checkboxElement = fixture.debugElement.query(By.directive(MdCheckbox));
      let ngControl = <NgControl> checkboxElement.injector.get(NgControl);
      let testComponent = <CheckboxWithFormDirectives> fixture.debugElement.componentInstance;

      fixture.whenStable().then(() => {
        expect(ngControl.valid).toBe(true);
        expect(ngControl.pristine).toBe(true);
        expect(ngControl.touched).toBe(false);
      }).then(() => {
        testComponent.isGood = true;
        fixture.detectChanges();
        return fixture.whenStable();
      }).then(() => {
        fixture.detectChanges();
        return fixture.whenStable();
      }).then(() => {
        console.log(ngControl.pristine);
        fixture.whenStable().then(() => {
          console.log(ngControl.pristine);
        });
      });
    });
  }));
});


/** Simple component for testing an MdCheckbox with ngModel and ngControl. */
@Component({
  selector: 'checkbox-with-form-directives',
  directives: [MdCheckbox, FORM_DIRECTIVES, NgModel],
  template: `
    <form>
      <md-checkbox ngControl="cb" [(ngModel)]="isGood">Be good</md-checkbox>
    </form>
  `,
})
class CheckboxWithFormDirectives {
  isGood: boolean = false;
}
