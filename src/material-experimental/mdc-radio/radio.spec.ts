import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';

import {MatRadioButton, MatRadioModule} from './index';

describe('MatRadio', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatRadioModule, FormsModule, ReactiveFormsModule],
      declarations: [
        DisableableRadioButton,
        CustomIdRadioButton,
      ]
    });

    TestBed.compileComponents();
  }));

  describe('disableable', () => {
    let fixture: ComponentFixture<DisableableRadioButton>;
    let radioInstance: MatRadioButton;
    let radioNativeElement: HTMLInputElement;
    let testComponent: DisableableRadioButton;
    let foundationRootElement: HTMLDivElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(DisableableRadioButton);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      const radioDebugElement = fixture.debugElement.query(By.directive(MatRadioButton))!;
      radioInstance = radioDebugElement.injector.get<MatRadioButton>(MatRadioButton);
      radioNativeElement = radioDebugElement.nativeElement.querySelector('input');
      foundationRootElement = radioDebugElement.nativeElement.querySelector('.mdc-radio');
    });

    it('should toggle the disabled state', () => {
      expect(foundationRootElement.classList.contains('mdc-radio--disabled')).toBeFalsy();
      expect(radioInstance.disabled).toBeFalsy();
      expect(radioNativeElement.disabled).toBeFalsy();

      testComponent.disabled = true;
      fixture.detectChanges();
      expect(foundationRootElement.classList.contains('mdc-radio--disabled')).toBeTruthy();
      expect(radioInstance.disabled).toBeTruthy();
      expect(radioNativeElement.disabled).toBeTruthy();

      testComponent.disabled = false;
      fixture.detectChanges();
      expect(foundationRootElement.classList.contains('mdc-radio--disabled')).toBeFalsy();
      expect(radioInstance.disabled).toBeFalsy();
      expect(radioNativeElement.disabled).toBeFalsy();
    });
  });

  describe('ids', () => {
    const CUSTOM_ID = 'custom-id';
    let fixture: ComponentFixture<CustomIdRadioButton>;
    let radioInstance: MatRadioButton;
    let radioDebugElement: DebugElement;
    let radioNativeElement: HTMLInputElement;
    let labelElement: HTMLLabelElement;
    let testComponent: CustomIdRadioButton;

    beforeEach(() => {
      fixture = TestBed.createComponent(CustomIdRadioButton);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      radioDebugElement = fixture.debugElement.query(By.directive(MatRadioButton))!;
      radioInstance = radioDebugElement.injector.get<MatRadioButton>(MatRadioButton);
      radioNativeElement = radioDebugElement.nativeElement.querySelector('input');
      labelElement = radioDebugElement.nativeElement.querySelector('label');
    });

    it('should pull the id from the attribute', () => {
      expect(radioInstance.id).toBe(null);
      expect(radioDebugElement.nativeElement.hasAttribute('id')).toBeFalsy();
      expect(radioNativeElement.getAttribute('id')).not.toBeFalsy();
      expect(radioNativeElement.getAttribute('id')).toBe(labelElement.getAttribute('for'));

      testComponent.customId = CUSTOM_ID;
      fixture.detectChanges();
      expect(radioInstance.id).toBe(CUSTOM_ID);
      expect(radioDebugElement.nativeElement.getAttribute('id')).toBe(CUSTOM_ID);
      expect(radioNativeElement.getAttribute('id')).not.toBeFalsy();
      expect(radioNativeElement.getAttribute('id')).toBe(labelElement.getAttribute('for'));
    });

    it('should generate unique ids for multiple instances', () => {
      const fixture2 = TestBed.createComponent(CustomIdRadioButton);
      fixture2.detectChanges();

      const radioDebugElement2 = fixture2.debugElement.query(By.directive(MatRadioButton))!;
      const radioInstance2 = radioDebugElement2.injector.get<MatRadioButton>(MatRadioButton);
      const radioNativeElement2 = radioDebugElement2.nativeElement.querySelector('input');
      const labelElement2 = radioDebugElement2.nativeElement.querySelector('label');

      expect(radioInstance.inputId).not.toBe(radioInstance2.inputId);
      expect(radioNativeElement.getAttribute('id'))
          .not.toBe(radioNativeElement2.getAttribute('id'));
      expect(labelElement.getAttribute('for')).not.toBe(labelElement2.getAttribute('for'));
    });
  });
});

@Component({
  template: `<mat-radio-button [disabled]="disabled">One</mat-radio-button>`
})
class DisableableRadioButton {
  disabled = false;
}

@Component({
  template: `<mat-radio-button [id]="customId">One</mat-radio-button>`
})
class CustomIdRadioButton {
  customId: string | null = null;
}
