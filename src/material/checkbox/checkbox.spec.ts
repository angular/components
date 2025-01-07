import {dispatchFakeEvent} from '@angular/cdk/testing/private';
import {ChangeDetectionStrategy, Component, DebugElement, Type} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, flush, flushMicrotasks} from '@angular/core/testing';
import {FormControl, FormsModule, NgModel, ReactiveFormsModule} from '@angular/forms';
import {ThemePalette} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {
  MAT_CHECKBOX_DEFAULT_OPTIONS,
  MatCheckbox,
  MatCheckboxChange,
  MatCheckboxDefaultOptions,
  MatCheckboxModule,
} from './index';

describe('MatCheckbox', () => {
  let fixture: ComponentFixture<any>;

  function createComponent<T>(componentType: Type<T>) {
    TestBed.configureTestingModule({
      imports: [MatCheckboxModule, FormsModule, ReactiveFormsModule, componentType],
    });

    return TestBed.createComponent<T>(componentType);
  }

  describe('basic behaviors', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let checkboxInstance: MatCheckbox;
    let testComponent: SingleCheckbox;
    let inputElement: HTMLInputElement;
    let labelElement: HTMLLabelElement;
    let checkboxElement: HTMLElement;

    beforeEach(() => {
      fixture = createComponent(SingleCheckbox);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      checkboxInstance = checkboxDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
      labelElement = <HTMLLabelElement>checkboxNativeElement.querySelector('label');
      checkboxElement = <HTMLLabelElement>checkboxNativeElement.querySelector('.mdc-checkbox');
    });

    it('should add and remove the checked state', fakeAsync(() => {
      expect(checkboxInstance.checked).toBe(false);
      expect(inputElement.checked).toBe(false);

      testComponent.isChecked = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(true);
      expect(inputElement.checked).toBe(true);
      expect(inputElement.hasAttribute('aria-checked'))
        .withContext('Expect aria-checked attribute to not be used')
        .toBe(false);

      testComponent.isChecked = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(inputElement.checked).toBe(false);
    }));

    it('should hide the internal SVG', () => {
      const svg = checkboxNativeElement.querySelector('svg')!;
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    });

    it('should toggle checkbox ripple disabledness correctly', fakeAsync(() => {
      const rippleSelector = '.mat-ripple-element:not(.mat-checkbox-persistent-ripple)';

      testComponent.isDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      dispatchFakeEvent(checkboxElement, 'mousedown');
      dispatchFakeEvent(checkboxElement, 'mouseup');
      checkboxElement.click();
      expect(checkboxNativeElement.querySelectorAll(rippleSelector).length).toBe(0);

      flush();
      testComponent.isDisabled = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      dispatchFakeEvent(checkboxElement, 'mousedown');
      dispatchFakeEvent(checkboxElement, 'mouseup');
      checkboxElement.click();
      expect(checkboxNativeElement.querySelectorAll(rippleSelector).length).toBe(1);

      flush();
    }));

    it('should add and remove indeterminate state', fakeAsync(() => {
      expect(inputElement.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(false);

      testComponent.isIndeterminate = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      flush();

      expect(inputElement.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(true);

      testComponent.isIndeterminate = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      flush();

      expect(inputElement.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(false);
    }));

    it('should set indeterminate to false when input clicked', fakeAsync(() => {
      testComponent.isIndeterminate = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(checkboxInstance.indeterminate).toBe(true);
      expect(inputElement.indeterminate).toBe(true);
      expect(testComponent.isIndeterminate).toBe(true);

      inputElement.click();
      fixture.detectChanges();

      // Flush the microtasks because the forms module updates the model state asynchronously.
      flush();

      // The checked property has been updated from the model and now the view needs
      // to reflect the state change.
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(true);
      expect(inputElement.indeterminate).toBe(false);
      expect(inputElement.checked).toBe(true);
      expect(testComponent.isIndeterminate).toBe(false);

      testComponent.isIndeterminate = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(checkboxInstance.indeterminate).toBe(true);
      expect(inputElement.indeterminate).toBe(true);
      expect(inputElement.checked).toBe(true);
      expect(testComponent.isIndeterminate).toBe(true);

      inputElement.click();
      fixture.detectChanges();

      // Flush the microtasks because the forms module updates the model state asynchronously.
      flush();

      // The checked property has been updated from the model and now the view needs
      // to reflect the state change.
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(false);
      expect(inputElement.checked).toBe(false);
      expect(testComponent.isIndeterminate).toBe(false);
    }));

    it('should not set indeterminate to false when checked is set programmatically', fakeAsync(() => {
      testComponent.isIndeterminate = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      flush();

      expect(checkboxInstance.indeterminate).toBe(true);
      expect(inputElement.indeterminate).toBe(true);
      expect(testComponent.isIndeterminate).toBe(true);

      testComponent.isChecked = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(true);
      expect(inputElement.indeterminate).toBe(true);
      expect(inputElement.checked).toBe(true);
      expect(testComponent.isIndeterminate).toBe(true);

      testComponent.isChecked = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(true);
      expect(inputElement.checked).toBe(false);
      expect(testComponent.isIndeterminate).toBe(true);
    }));

    it('should change native element checked when check programmatically', () => {
      expect(inputElement.checked).toBe(false);

      checkboxInstance.checked = true;
      fixture.detectChanges();

      expect(inputElement.checked).toBe(true);
    });

    it('should toggle checked state on click', fakeAsync(() => {
      expect(checkboxInstance.checked).toBe(false);

      labelElement.click();
      fixture.detectChanges();
      flush();

      expect(checkboxInstance.checked).toBe(true);

      labelElement.click();
      fixture.detectChanges();
      flush();

      expect(checkboxInstance.checked).toBe(false);
    }));

    it('should change from indeterminate to checked on click', fakeAsync(() => {
      testComponent.isChecked = false;
      testComponent.isIndeterminate = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(checkboxInstance.indeterminate).toBe(true);

      inputElement.click();
      fixture.detectChanges();
      flush();

      expect(checkboxInstance.checked).toBe(true);
      expect(checkboxInstance.indeterminate).toBe(false);

      inputElement.click();
      fixture.detectChanges();
      flush();

      expect(checkboxInstance.checked).toBe(false);
      expect(checkboxInstance.indeterminate).toBe(false);
    }));

    it('should add and remove disabled state', fakeAsync(() => {
      expect(checkboxInstance.disabled).toBe(false);
      expect(inputElement.tabIndex).toBe(0);
      expect(inputElement.disabled).toBe(false);

      testComponent.isDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(checkboxInstance.disabled).toBe(true);
      expect(inputElement.disabled).toBe(true);

      testComponent.isDisabled = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(checkboxInstance.disabled).toBe(false);
      expect(inputElement.tabIndex).toBe(0);
      expect(inputElement.disabled).toBe(false);
    }));

    it('should not toggle `checked` state upon interation while disabled', () => {
      testComponent.isDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      checkboxNativeElement.click();
      expect(checkboxInstance.checked).toBe(false);
    });

    it('should overwrite indeterminate state when clicked', fakeAsync(() => {
      testComponent.isIndeterminate = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      inputElement.click();
      fixture.detectChanges();

      // Flush the microtasks because the indeterminate state will be updated in the next tick.
      flush();

      expect(checkboxInstance.checked).toBe(true);
      expect(checkboxInstance.indeterminate).toBe(false);
    }));

    it('should preserve the user-provided id', fakeAsync(() => {
      expect(checkboxNativeElement.id).toBe('simple-check');
      expect(inputElement.id).toBe('simple-check-input');
    }));

    it('should generate a unique id for the checkbox input if no id is set', fakeAsync(() => {
      testComponent.checkboxId = null;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(checkboxInstance.inputId).toMatch(/mat-mdc-checkbox-\w+\d+/);
      expect(inputElement.id).toBe(checkboxInstance.inputId);
    }));

    it('should project the checkbox content into the label element', fakeAsync(() => {
      let label = <HTMLLabelElement>checkboxNativeElement.querySelector('label');
      expect(label.textContent!.trim()).toBe('Simple checkbox');
    }));

    it('should make the host element a tab stop', fakeAsync(() => {
      expect(inputElement.tabIndex).toBe(0);
    }));

    it('should add a css class to position the label before the checkbox', fakeAsync(() => {
      testComponent.labelPos = 'before';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(checkboxNativeElement.querySelector('.mdc-form-field')!.classList).toContain(
        'mdc-form-field--align-end',
      );
    }));

    it('should trigger the click once when clicking on the <input/>', fakeAsync(() => {
      spyOn(testComponent, 'onCheckboxClick');

      expect(inputElement.checked).toBe(false);

      inputElement.click();
      fixture.detectChanges();
      flush();

      expect(inputElement.checked).toBe(true);
      expect(testComponent.onCheckboxClick).toHaveBeenCalledTimes(1);
    }));

    it('should trigger the click event once when clicking on the label', fakeAsync(() => {
      // By default, when clicking on a label element, a generated click will be dispatched
      // on the associated input element.
      // Since we're using a label element and a visual hidden input, this behavior can led
      // to an issue, where the click events on the checkbox are getting executed twice.

      spyOn(testComponent, 'onCheckboxClick');

      expect(inputElement.checked).toBe(false);

      labelElement.click();
      fixture.detectChanges();
      flush();

      expect(inputElement.checked).toBe(true);
      expect(testComponent.onCheckboxClick).toHaveBeenCalledTimes(1);
    }));

    it('should trigger a change event when the native input does', fakeAsync(() => {
      spyOn(testComponent, 'onCheckboxChange');

      expect(inputElement.checked).toBe(false);

      labelElement.click();
      fixture.detectChanges();
      flush();

      expect(inputElement.checked).toBe(true);
      expect(testComponent.onCheckboxChange).toHaveBeenCalledTimes(1);
    }));

    it('should not trigger the change event by changing the native value', fakeAsync(() => {
      spyOn(testComponent, 'onCheckboxChange');

      expect(inputElement.checked).toBe(false);

      testComponent.isChecked = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      flush();

      expect(inputElement.checked).toBe(true);
      expect(testComponent.onCheckboxChange).not.toHaveBeenCalled();
    }));

    it('should keep the view in sync if the `checked` value changes inside the `change` listener', fakeAsync(() => {
      spyOn(testComponent, 'onCheckboxChange').and.callFake(() => {
        checkboxInstance.checked = false;
      });

      labelElement.click();
      fixture.detectChanges();
      flush();

      expect(inputElement.checked).toBe(false);
    }));

    it('should forward the required attribute', fakeAsync(() => {
      testComponent.isRequired = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(inputElement.required).toBe(true);

      testComponent.isRequired = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(inputElement.required).toBe(false);
    }));

    it('should focus on underlying input element when focus() is called', fakeAsync(() => {
      expect(document.activeElement).not.toBe(inputElement);

      checkboxInstance.focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(inputElement);
    }));

    it('should focus underlying input element when the touch target is clicked', fakeAsync(() => {
      const touchTarget = checkboxElement.querySelector(
        '.mat-mdc-checkbox-touch-target',
      ) as HTMLElement;

      expect(document.activeElement).not.toBe(inputElement);

      touchTarget.click();
      fixture.detectChanges();
      flush();

      expect(document.activeElement).toBe(inputElement);
    }));

    it('should forward the value to input element', fakeAsync(() => {
      testComponent.checkboxValue = 'basic_checkbox';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(inputElement.value).toBe('basic_checkbox');
    }));

    it('should remove the SVG checkmark from the tab order', fakeAsync(() => {
      expect(checkboxNativeElement.querySelector('svg')!.getAttribute('focusable')).toBe('false');
    }));

    it('should be able to mark a checkbox as disabled while keeping it interactive', fakeAsync(() => {
      testComponent.isDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(checkboxNativeElement.classList).not.toContain(
        'mat-mdc-checkbox-disabled-interactive',
      );
      expect(inputElement.hasAttribute('aria-disabled')).toBe(false);
      expect(inputElement.tabIndex).toBe(-1);
      expect(inputElement.disabled).toBe(true);

      testComponent.disabledInteractive = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(checkboxNativeElement.classList).toContain('mat-mdc-checkbox-disabled-interactive');
      expect(inputElement.getAttribute('aria-disabled')).toBe('true');
      expect(inputElement.tabIndex).toBe(0);
      expect(inputElement.disabled).toBe(false);
    }));

    it('should not change the checked state if disabled and interactive', fakeAsync(() => {
      testComponent.isDisabled = testComponent.disabledInteractive = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(inputElement.checked).toBe(false);

      inputElement.click();
      fixture.detectChanges();

      expect(inputElement.checked).toBe(false);
    }));

    describe('ripple elements', () => {
      it('should show ripples on label mousedown', fakeAsync(() => {
        const rippleSelector = '.mat-ripple-element:not(.mat-checkbox-persistent-ripple)';

        expect(checkboxNativeElement.querySelector(rippleSelector)).toBeFalsy();

        dispatchFakeEvent(checkboxElement, 'mousedown');
        dispatchFakeEvent(checkboxElement, 'mouseup');
        checkboxElement.click();

        expect(checkboxNativeElement.querySelectorAll(rippleSelector).length).toBe(1);

        flush();
      }));

      it('should not show ripples when disabled', fakeAsync(() => {
        const rippleSelector = '.mat-ripple-element:not(.mat-checkbox-persistent-ripple)';
        testComponent.isDisabled = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        dispatchFakeEvent(checkboxElement, 'mousedown');
        dispatchFakeEvent(checkboxElement, 'mouseup');
        checkboxElement.click();

        expect(checkboxNativeElement.querySelectorAll(rippleSelector).length).toBe(0);

        flush();
        testComponent.isDisabled = false;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        dispatchFakeEvent(checkboxElement, 'mousedown');
        dispatchFakeEvent(checkboxElement, 'mouseup');
        checkboxElement.click();

        expect(checkboxNativeElement.querySelectorAll(rippleSelector).length).toBe(1);

        flush();
      }));

      it('should remove ripple if matRippleDisabled input is set', fakeAsync(() => {
        const rippleSelector = '.mat-ripple-element:not(.mat-checkbox-persistent-ripple)';
        testComponent.disableRipple = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        dispatchFakeEvent(checkboxElement, 'mousedown');
        dispatchFakeEvent(checkboxElement, 'mouseup');
        checkboxElement.click();

        expect(checkboxNativeElement.querySelectorAll(rippleSelector).length).toBe(0);

        flush();
        testComponent.disableRipple = false;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        dispatchFakeEvent(checkboxElement, 'mousedown');
        dispatchFakeEvent(checkboxElement, 'mouseup');
        checkboxElement.click();

        expect(checkboxNativeElement.querySelectorAll(rippleSelector).length).toBe(1);

        flush();
      }));
    });

    describe('color behaviour', () => {
      it('should apply class based on color attribute', fakeAsync(() => {
        testComponent.checkboxColor = 'primary';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(checkboxNativeElement.classList.contains('mat-primary')).toBe(true);

        testComponent.checkboxColor = 'accent';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(checkboxNativeElement.classList.contains('mat-accent')).toBe(true);
      }));

      it('should not clear previous defined classes', fakeAsync(() => {
        checkboxNativeElement.classList.add('custom-class');

        testComponent.checkboxColor = 'primary';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(checkboxNativeElement.classList.contains('mat-primary')).toBe(true);
        expect(checkboxNativeElement.classList.contains('custom-class')).toBe(true);

        testComponent.checkboxColor = 'accent';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(checkboxNativeElement.classList.contains('mat-primary')).toBe(false);
        expect(checkboxNativeElement.classList.contains('mat-accent')).toBe(true);
        expect(checkboxNativeElement.classList.contains('custom-class')).toBe(true);
      }));

      it('should default to accent if no color is passed in', fakeAsync(() => {
        testComponent.checkboxColor = undefined;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(checkboxNativeElement.classList).toContain('mat-accent');
      }));
    });

    describe(`when MAT_CHECKBOX_CLICK_ACTION is 'check'`, () => {
      beforeEach(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [MatCheckboxModule, FormsModule, ReactiveFormsModule, SingleCheckbox],
          providers: [{provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: {clickAction: 'check'}}],
        });

        fixture = createComponent(SingleCheckbox);
        fixture.detectChanges();

        checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
        checkboxNativeElement = checkboxDebugElement.nativeElement;
        checkboxInstance = checkboxDebugElement.componentInstance;
        testComponent = fixture.debugElement.componentInstance;

        inputElement = checkboxNativeElement.querySelector('input') as HTMLInputElement;
        labelElement = checkboxNativeElement.querySelector('label') as HTMLLabelElement;
      });

      it('should not set `indeterminate` to false on click if check is set', fakeAsync(() => {
        testComponent.isIndeterminate = true;
        fixture.changeDetectorRef.markForCheck();
        inputElement.click();
        fixture.detectChanges();
        flush();

        expect(inputElement.checked).toBe(true);
        expect(inputElement.indeterminate).toBe(true);
      }));
    });

    describe(`when MAT_CHECKBOX_CLICK_ACTION is 'noop'`, () => {
      beforeEach(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [MatCheckboxModule, FormsModule, ReactiveFormsModule, SingleCheckbox],
          providers: [{provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: {clickAction: 'noop'}}],
        });

        fixture = createComponent(SingleCheckbox);
        fixture.detectChanges();

        checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
        checkboxNativeElement = checkboxDebugElement.nativeElement;
        checkboxInstance = checkboxDebugElement.componentInstance;
        testComponent = fixture.debugElement.componentInstance;
        inputElement = checkboxNativeElement.querySelector('input') as HTMLInputElement;
        labelElement = checkboxNativeElement.querySelector('label') as HTMLLabelElement;
      });

      it('should not change `indeterminate` on click if noop is set', fakeAsync(() => {
        testComponent.isIndeterminate = true;
        fixture.changeDetectorRef.markForCheck();
        inputElement.click();
        fixture.detectChanges();
        flush();

        expect(inputElement.checked).toBe(false);
        expect(inputElement.indeterminate).toBe(true);
      }));

      it(`should not change 'checked' or 'indeterminate' on click if noop is set`, fakeAsync(() => {
        testComponent.isChecked = true;
        testComponent.isIndeterminate = true;
        fixture.changeDetectorRef.markForCheck();
        inputElement.click();
        fixture.detectChanges();
        flush();

        expect(inputElement.checked).toBe(true);
        expect(inputElement.indeterminate).toBe(true);

        testComponent.isChecked = false;
        fixture.changeDetectorRef.markForCheck();
        inputElement.click();
        fixture.detectChanges();
        flush();

        expect(inputElement.checked).toBe(false);
        expect(inputElement.indeterminate)
          .withContext('indeterminate should not change')
          .toBe(true);
      }));
    });

    it('should have a focus indicator', () => {
      const checkboxRippleNativeElement = checkboxNativeElement.querySelector(
        '.mat-mdc-checkbox-ripple',
      )!;

      expect(checkboxRippleNativeElement.classList.contains('mat-focus-indicator')).toBe(true);
    });
  });

  describe('with change event and no initial value', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let checkboxInstance: MatCheckbox;
    let testComponent: CheckboxWithChangeEvent;
    let inputElement: HTMLInputElement;
    let labelElement: HTMLLabelElement;

    beforeEach(() => {
      fixture = createComponent(CheckboxWithChangeEvent);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      checkboxInstance = checkboxDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
      labelElement = <HTMLLabelElement>checkboxNativeElement.querySelector('label');
    });

    it('should emit the event to the change observable', fakeAsync(() => {
      let changeSpy = jasmine.createSpy('onChangeObservable');

      checkboxInstance.change.subscribe(changeSpy);

      fixture.detectChanges();
      expect(changeSpy).not.toHaveBeenCalled();

      // When changing the native `checked` property the checkbox will not fire a change event,
      // because the element is not focused and it's not the native behavior of the input
      // element.
      labelElement.click();
      fixture.detectChanges();
      flush();

      expect(changeSpy).toHaveBeenCalledTimes(1);
    }));

    it('should not emit a DOM event to the change output', fakeAsync(() => {
      fixture.detectChanges();
      expect(testComponent.lastEvent).toBeUndefined();

      // Trigger the click on the inputElement, because the input will probably
      // emit a DOM event to the change output.
      inputElement.click();
      fixture.detectChanges();
      flush();

      // We're checking the arguments type / emitted value to be a boolean, because sometimes the
      // emitted value can be a DOM Event, which is not valid.
      // See angular/angular#4059
      expect(testComponent.lastEvent.checked).toBe(true);
    }));
  });

  describe('aria handling', () => {
    it('should use the provided aria-label', fakeAsync(() => {
      fixture = createComponent(CheckboxWithAriaLabel);
      const checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      const checkboxNativeElement = checkboxDebugElement.nativeElement;
      const inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-label')).toBe('Super effective');
    }));

    it('should not set the aria-label attribute if no value is provided', fakeAsync(() => {
      fixture = createComponent(SingleCheckbox);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('input').hasAttribute('aria-label')).toBe(false);
    }));

    it('should use the provided aria-labelledby', fakeAsync(() => {
      fixture = createComponent(CheckboxWithAriaLabelledby);
      const checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      const checkboxNativeElement = checkboxDebugElement.nativeElement;
      const inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-labelledby')).toBe('some-id');
    }));

    it('should not assign aria-labelledby if none is provided', fakeAsync(() => {
      fixture = createComponent(SingleCheckbox);
      const checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      const checkboxNativeElement = checkboxDebugElement.nativeElement;
      const inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-labelledby')).toBe(null);
    }));

    it('should clear the static aria attributes from the host node', () => {
      fixture = createComponent(CheckboxWithStaticAriaAttributes);
      const checkbox = fixture.debugElement.query(By.directive(MatCheckbox))!.nativeElement;
      fixture.detectChanges();

      expect(checkbox.hasAttribute('aria')).toBe(false);
      expect(checkbox.hasAttribute('aria-labelledby')).toBe(false);
    });
  });

  describe('with provided aria-describedby ', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let inputElement: HTMLInputElement;

    it('should use the provided aria-describedby', () => {
      fixture = createComponent(CheckboxWithAriaDescribedby);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-describedby')).toBe('some-id');
    });

    it('should not assign aria-describedby if none is provided', () => {
      fixture = createComponent(SingleCheckbox);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-describedby')).toBe(null);
    });
  });

  describe('with provided aria-expanded', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let inputElement: HTMLInputElement;

    it('should use the provided postive aria-expanded', () => {
      fixture = createComponent(CheckboxWithPositiveAriaExpanded);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-expanded')).toBe('true');
    });

    it('should use the provided negative aria-expanded', () => {
      fixture = createComponent(CheckboxWithNegativeAriaExpanded);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-expanded')).toBe('false');
    });

    it('should not assign aria-expanded if none is provided', () => {
      fixture = createComponent(SingleCheckbox);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-expanded')).toBe(null);
    });
  });

  describe('with provided aria-controls', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let inputElement: HTMLInputElement;

    it('should use the provided aria-controls', () => {
      fixture = createComponent(CheckboxWithAriaControls);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-controls')).toBe('some-id');
    });

    it('should not assign aria-controls if none is provided', () => {
      fixture = createComponent(SingleCheckbox);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-controls')).toBe(null);
    });
  });

  describe('with provided aria-owns', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let inputElement: HTMLInputElement;

    it('should use the provided aria-owns', () => {
      fixture = createComponent(CheckboxWithAriaOwns);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-owns')).toBe('some-id');
    });

    it('should not assign aria-owns if none is provided', () => {
      fixture = createComponent(SingleCheckbox);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-owns')).toBe(null);
    });
  });

  describe('with provided tabIndex', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let testComponent: CheckboxWithTabIndex;
    let inputElement: HTMLInputElement;

    beforeEach(() => {
      fixture = createComponent(CheckboxWithTabIndex);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
    });

    it('should preserve any given tabIndex', fakeAsync(() => {
      expect(inputElement.tabIndex).toBe(7);
    }));

    it('should preserve given tabIndex when the checkbox is disabled then enabled', fakeAsync(() => {
      testComponent.isDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      testComponent.customTabIndex = 13;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      testComponent.isDisabled = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(inputElement.tabIndex).toBe(13);
    }));
  });

  describe('with native tabindex attribute', () => {
    it('should properly detect native tabindex attribute', fakeAsync(() => {
      fixture = createComponent(CheckboxWithTabindexAttr);
      fixture.detectChanges();

      const checkbox = fixture.debugElement.query(By.directive(MatCheckbox))!
        .componentInstance as MatCheckbox;

      expect(checkbox.tabIndex)
        .withContext('Expected tabIndex property to have been set based on the native attribute')
        .toBe(5);
    }));

    it('should clear the tabindex attribute from the host element', fakeAsync(() => {
      fixture = createComponent(CheckboxWithTabindexAttr);
      fixture.detectChanges();

      const checkbox = fixture.debugElement.query(By.directive(MatCheckbox))!.nativeElement;
      expect(checkbox.getAttribute('tabindex')).toBeFalsy();
    }));
  });

  describe('with multiple checkboxes', () => {
    beforeEach(() => {
      fixture = createComponent(MultipleCheckboxes);
      fixture.detectChanges();
    });

    it('should assign a unique id to each checkbox', fakeAsync(() => {
      let [firstId, secondId] = fixture.debugElement
        .queryAll(By.directive(MatCheckbox))
        .map(debugElement => debugElement.nativeElement.querySelector('input').id);

      expect(firstId).toMatch(/mat-mdc-checkbox-\w+\d+-input/);
      expect(secondId).toMatch(/mat-mdc-checkbox-\w+\d+-input/);
      expect(firstId).not.toEqual(secondId);
    }));
  });

  describe('with ngModel', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let checkboxInstance: MatCheckbox;
    let inputElement: HTMLInputElement;
    let ngModel: NgModel;

    beforeEach(() => {
      fixture = createComponent(CheckboxWithNgModel);

      fixture.componentInstance.isRequired = false;
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      checkboxInstance = checkboxDebugElement.componentInstance;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
      ngModel = checkboxDebugElement.injector.get<NgModel>(NgModel);
    });

    it('should be pristine, untouched, and valid initially', fakeAsync(() => {
      expect(ngModel.valid).toBe(true);
      expect(ngModel.pristine).toBe(true);
      expect(ngModel.touched).toBe(false);
    }));

    it('should have correct control states after interaction', fakeAsync(() => {
      inputElement.click();
      fixture.detectChanges();

      // Flush the timeout that is being created whenever a `click` event has been fired by
      // the underlying input.
      flush();

      // After the value change through interaction, the control should be dirty, but remain
      // untouched as long as the focus is still on the underlying input.
      expect(ngModel.pristine).toBe(false);
      expect(ngModel.touched).toBe(false);

      // If the input element loses focus, the control should remain dirty but should
      // also turn touched.
      dispatchFakeEvent(inputElement, 'blur');
      fixture.detectChanges();
      flush();

      expect(ngModel.pristine).toBe(false);
      expect(ngModel.touched).toBe(true);
    }));

    it('should mark the element as touched on blur when inside an OnPush parent', fakeAsync(() => {
      fixture.destroy();
      TestBed.resetTestingModule();
      fixture = createComponent(CheckboxWithNgModelAndOnPush);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      checkboxInstance = checkboxDebugElement.componentInstance;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
      ngModel = checkboxDebugElement.injector.get<NgModel>(NgModel);

      inputElement.click();
      fixture.detectChanges();
      flush();

      expect(checkboxNativeElement.classList).not.toContain('ng-touched');

      dispatchFakeEvent(inputElement, 'blur');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();

      expect(checkboxNativeElement.classList).toContain('ng-touched');
    }));

    it('should not throw an error when disabling while focused', fakeAsync(() => {
      expect(() => {
        // Focus the input element because after disabling, the `blur` event should automatically
        // fire and not result in a changed after checked exception. Related: #12323
        inputElement.focus();

        fixture.componentInstance.isDisabled = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        flush();
      }).not.toThrow();
    }));

    it('should toggle checked state on click', fakeAsync(() => {
      expect(checkboxInstance.checked).toBe(false);

      inputElement.click();
      fixture.detectChanges();
      flush();

      expect(checkboxInstance.checked).toBe(true);

      inputElement.click();
      fixture.detectChanges();
      flush();

      expect(checkboxInstance.checked).toBe(false);
    }));

    it('should validate with RequiredTrue validator', fakeAsync(() => {
      fixture.componentInstance.isRequired = true;
      inputElement.click();
      fixture.detectChanges();
      flush();

      expect(checkboxInstance.checked).toBe(true);
      expect(ngModel.valid).toBe(true);

      inputElement.click();
      fixture.detectChanges();
      flush();

      expect(checkboxInstance.checked).toBe(false);
      expect(ngModel.valid).toBe(false);
    }));

    it('should update the ngModel value when using the `toggle` method', fakeAsync(() => {
      const checkbox = fixture.debugElement.query(By.directive(MatCheckbox)).componentInstance;

      expect(fixture.componentInstance.isGood).toBe(false);

      checkbox.toggle();
      fixture.detectChanges();

      expect(fixture.componentInstance.isGood).toBe(true);
    }));
  });

  describe('with name attribute', () => {
    beforeEach(() => {
      fixture = createComponent(CheckboxWithNameAttribute);
      fixture.detectChanges();
    });

    it('should forward name value to input element', fakeAsync(() => {
      let checkboxElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      let inputElement = <HTMLInputElement>checkboxElement.nativeElement.querySelector('input');

      expect(inputElement.getAttribute('name')).toBe('test-name');
    }));
  });

  describe('with form control', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxInstance: MatCheckbox;
    let testComponent: CheckboxWithFormControl;
    let inputElement: HTMLInputElement;

    beforeEach(() => {
      fixture = createComponent(CheckboxWithFormControl);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxInstance = checkboxDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
      inputElement = <HTMLInputElement>checkboxDebugElement.nativeElement.querySelector('input');
    });

    it('should toggle the disabled state', fakeAsync(() => {
      expect(checkboxInstance.disabled).toBe(false);

      testComponent.formControl.disable();
      fixture.detectChanges();

      expect(checkboxInstance.disabled).toBe(true);
      expect(inputElement.disabled).toBe(true);

      testComponent.formControl.enable();
      fixture.detectChanges();

      expect(checkboxInstance.disabled).toBe(false);
      expect(inputElement.disabled).toBe(false);
    }));
  });

  describe('without label', () => {
    let checkboxInnerContainer: HTMLElement;

    beforeEach(() => {
      fixture = createComponent(CheckboxWithoutLabel);
      const checkboxDebugEl = fixture.debugElement.query(By.directive(MatCheckbox))!;
      checkboxInnerContainer = checkboxDebugEl.query(By.css('.mdc-form-field'))!.nativeElement;
    });

    it('should not add the "name" attribute if it is not passed in', fakeAsync(() => {
      fixture.detectChanges();
      expect(checkboxInnerContainer.querySelector('input')!.hasAttribute('name')).toBe(false);
    }));

    it('should not add the "value" attribute if it is not passed in', fakeAsync(() => {
      fixture.detectChanges();
      expect(checkboxInnerContainer.querySelector('input')!.hasAttribute('value')).toBe(false);
    }));
  });
});

describe('MatCheckboxDefaultOptions', () => {
  describe('when MAT_CHECKBOX_DEFAULT_OPTIONS overridden', () => {
    function configure(defaults: MatCheckboxDefaultOptions) {
      TestBed.configureTestingModule({
        imports: [MatCheckboxModule, FormsModule, SingleCheckbox, SingleCheckbox],
        providers: [{provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: defaults}],
      });
    }

    it('should override default color in component', () => {
      configure({color: 'primary'});
      const fixture: ComponentFixture<SingleCheckbox> = TestBed.createComponent(SingleCheckbox);
      fixture.detectChanges();
      const checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      expect(checkboxDebugElement.nativeElement.classList).toContain('mat-primary');
    });

    it('should not override explicit input bindings', () => {
      configure({color: 'primary'});
      const fixture: ComponentFixture<SingleCheckbox> = TestBed.createComponent(SingleCheckbox);
      fixture.componentInstance.checkboxColor = 'warn';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      const checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      expect(checkboxDebugElement.nativeElement.classList).not.toContain('mat-primary');
      expect(checkboxDebugElement.nativeElement.classList).toContain('mat-warn');
      expect(checkboxDebugElement.nativeElement.classList).toContain('mat-warn');
    });

    it('should default to accent if config does not specify color', () => {
      configure({clickAction: 'noop'});
      const fixture: ComponentFixture<SingleCheckbox> = TestBed.createComponent(SingleCheckbox);
      fixture.componentInstance.checkboxColor = undefined;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      const checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox))!;
      expect(checkboxDebugElement.nativeElement.classList).toContain('mat-accent');
    });
  });
});

/** Simple component for testing a single checkbox. */
@Component({
  template: `
  <div (click)="parentElementClicked = true" (keyup)="parentElementKeyedUp = true" (click)="onCheckboxClick($event)">
    <mat-checkbox
        [id]="checkboxId"
        [required]="isRequired"
        [labelPosition]="labelPos"
        [checked]="isChecked"
        [(indeterminate)]="isIndeterminate"
        [disabled]="isDisabled"
        [color]="checkboxColor"
        [disableRipple]="disableRipple"
        [value]="checkboxValue"
        [disabledInteractive]="disabledInteractive"
        (change)="onCheckboxChange($event)">
      Simple checkbox
    </mat-checkbox>
  </div>`,
  imports: [MatCheckbox],
})
class SingleCheckbox {
  labelPos: 'before' | 'after' = 'after';
  isChecked = false;
  isRequired = false;
  isIndeterminate = false;
  isDisabled = false;
  disableRipple = false;
  parentElementClicked = false;
  parentElementKeyedUp = false;
  disabledInteractive = false;
  checkboxId: string | null = 'simple-check';
  checkboxColor: ThemePalette = 'primary';
  checkboxValue: string = 'single_checkbox';

  onCheckboxClick: (event?: Event) => void = () => {};
  onCheckboxChange: (event?: MatCheckboxChange) => void = () => {};
}

/** Simple component for testing an MatCheckbox with required ngModel. */
@Component({
  template: `<mat-checkbox [required]="isRequired" [(ngModel)]="isGood"
                           [disabled]="isDisabled">Be good</mat-checkbox>`,
  imports: [MatCheckbox, FormsModule],
})
class CheckboxWithNgModel {
  isGood = false;
  isRequired = true;
  isDisabled = false;
}

@Component({
  template: `<mat-checkbox [required]="isRequired" [(ngModel)]="isGood">Be good</mat-checkbox>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCheckbox, FormsModule],
})
class CheckboxWithNgModelAndOnPush extends CheckboxWithNgModel {}

/** Simple test component with multiple checkboxes. */
@Component({
  template: `
    <mat-checkbox>Option 1</mat-checkbox>
    <mat-checkbox>Option 2</mat-checkbox>
  `,
  imports: [MatCheckbox],
})
class MultipleCheckboxes {}

/** Simple test component with tabIndex */
@Component({
  template: `
    <mat-checkbox
        [tabIndex]="customTabIndex"
        [disabled]="isDisabled">
    </mat-checkbox>`,
  imports: [MatCheckbox],
})
class CheckboxWithTabIndex {
  customTabIndex: number = 7;
  isDisabled: boolean = false;
}

/** Simple test component with an aria-label set. */
@Component({
  template: `<mat-checkbox aria-label="Super effective"></mat-checkbox>`,
  imports: [MatCheckbox],
})
class CheckboxWithAriaLabel {}

/** Simple test component with an aria-label set. */
@Component({
  template: `<mat-checkbox aria-labelledby="some-id"></mat-checkbox>`,
  imports: [MatCheckbox],
})
class CheckboxWithAriaLabelledby {}

/** Simple test component with an aria-describedby set. */
@Component({
  template: `<mat-checkbox aria-describedby="some-id"></mat-checkbox>`,
  imports: [MatCheckbox],
})
class CheckboxWithAriaDescribedby {}

/** Simple test component with an aria-expanded set with true. */
@Component({
  template: `<mat-checkbox aria-expanded="true"></mat-checkbox>`,
  imports: [MatCheckbox],
})
class CheckboxWithPositiveAriaExpanded {}

/** Simple test component with an aria-expanded set with false. */
@Component({
  template: `<mat-checkbox aria-expanded="false"></mat-checkbox>`,
  imports: [MatCheckbox],
})
class CheckboxWithNegativeAriaExpanded {}

/** Simple test component with an aria-controls set. */
@Component({
  template: `<mat-checkbox aria-controls="some-id"></mat-checkbox>`,
  imports: [MatCheckbox],
})
class CheckboxWithAriaControls {}

/** Simple test component with an aria-owns set. */
@Component({
  template: `<mat-checkbox aria-owns="some-id"></mat-checkbox>`,
  imports: [MatCheckbox],
})
class CheckboxWithAriaOwns {}

/** Simple test component with name attribute */
@Component({
  template: `<mat-checkbox name="test-name"></mat-checkbox>`,
  imports: [MatCheckbox],
})
class CheckboxWithNameAttribute {}

/** Simple test component with change event */
@Component({
  template: `<mat-checkbox (change)="lastEvent = $event"></mat-checkbox>`,
  imports: [MatCheckbox],
})
class CheckboxWithChangeEvent {
  lastEvent: MatCheckboxChange;
}

/** Test component with reactive forms */
@Component({
  template: `<mat-checkbox [formControl]="formControl"></mat-checkbox>`,
  imports: [MatCheckbox, ReactiveFormsModule],
})
class CheckboxWithFormControl {
  formControl = new FormControl(false);
}

/** Test component without label */
@Component({
  template: `<mat-checkbox>{{ label }}</mat-checkbox>`,
  imports: [MatCheckbox],
})
class CheckboxWithoutLabel {
  label: string;
}

/** Test component with the native tabindex attribute. */
@Component({
  template: `<mat-checkbox tabindex="5"></mat-checkbox>`,
  imports: [MatCheckbox],
})
class CheckboxWithTabindexAttr {}

@Component({
  template: `<mat-checkbox aria-label="Checkbox" aria-labelledby="something"></mat-checkbox>`,
  imports: [MatCheckbox],
})
class CheckboxWithStaticAriaAttributes {}
