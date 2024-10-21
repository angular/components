import {dispatchMouseEvent} from '@angular/cdk/testing/private';
import {Component, DebugElement, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, flush, tick} from '@angular/core/testing';
import {FormControl, FormsModule, NgModel, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {
  MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS,
  MatButtonToggle,
  MatButtonToggleChange,
  MatButtonToggleGroup,
  MatButtonToggleModule,
} from './index';

describe('MatButtonToggle with forms', () => {
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatButtonToggleModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonToggleGroupWithNgModel,
        ButtonToggleGroupWithFormControl,
        ButtonToggleGroupWithIndirectDescendantToggles,
        ButtonToggleGroupWithFormControlAndDynamicButtons,
      ],
    });
  }));

  describe('using FormControl', () => {
    let fixture: ComponentFixture<ButtonToggleGroupWithFormControl>;
    let groupDebugElement: DebugElement;
    let groupInstance: MatButtonToggleGroup;
    let testComponent: ButtonToggleGroupWithFormControl;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(ButtonToggleGroupWithFormControl);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      groupDebugElement = fixture.debugElement.query(By.directive(MatButtonToggleGroup))!;
      groupInstance = groupDebugElement.injector.get<MatButtonToggleGroup>(MatButtonToggleGroup);
    }));

    it('should toggle the disabled state', () => {
      testComponent.control.disable();

      expect(groupInstance.disabled).toBe(true);

      testComponent.control.enable();

      expect(groupInstance.disabled).toBe(false);
    });

    it('should set the value', () => {
      testComponent.control.setValue('green');

      expect(groupInstance.value).toBe('green');

      testComponent.control.setValue('red');

      expect(groupInstance.value).toBe('red');
    });

    it('should register the on change callback', () => {
      const spy = jasmine.createSpy('onChange callback');

      testComponent.control.registerOnChange(spy);
      testComponent.control.setValue('blue');

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('button toggle group with ngModel and change event', () => {
    let fixture: ComponentFixture<ButtonToggleGroupWithNgModel>;
    let groupDebugElement: DebugElement;
    let buttonToggleDebugElements: DebugElement[];
    let groupInstance: MatButtonToggleGroup;
    let buttonToggleInstances: MatButtonToggle[];
    let testComponent: ButtonToggleGroupWithNgModel;
    let groupNgModel: NgModel;
    let innerButtons: HTMLElement[];

    beforeEach(() => {
      fixture = TestBed.createComponent(ButtonToggleGroupWithNgModel);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;

      groupDebugElement = fixture.debugElement.query(By.directive(MatButtonToggleGroup))!;
      groupInstance = groupDebugElement.injector.get<MatButtonToggleGroup>(MatButtonToggleGroup);
      groupNgModel = groupDebugElement.injector.get<NgModel>(NgModel);

      buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(MatButtonToggle));
      buttonToggleInstances = buttonToggleDebugElements.map(debugEl => debugEl.componentInstance);
      innerButtons = buttonToggleDebugElements.map(
        debugEl => debugEl.query(By.css('button'))!.nativeElement,
      );

      fixture.detectChanges();
    });

    it('should update the model before firing change event', fakeAsync(() => {
      expect(testComponent.modelValue).toBeUndefined();
      expect(testComponent.lastEvent).toBeUndefined();

      innerButtons[0].click();
      fixture.detectChanges();

      tick();
      expect(testComponent.modelValue).toBe('red');
      expect(testComponent.lastEvent.value).toBe('red');
    }));

    it('should set individual radio names based on the group name', () => {
      expect(groupInstance.name).toBeTruthy();
      for (let buttonToggle of innerButtons) {
        expect(buttonToggle.getAttribute('name')).toBe(groupInstance.name);
      }

      groupInstance.name = 'new name';
      fixture.detectChanges();

      for (let buttonToggle of innerButtons) {
        expect(buttonToggle.getAttribute('name')).toBe(groupInstance.name);
      }
    });

    it('should update the name of radio DOM elements if the name of the group changes', () => {
      expect(innerButtons.every(button => button.getAttribute('name') === groupInstance.name))
        .withContext('Expected all buttons to have the initial name.')
        .toBe(true);

      fixture.componentInstance.groupName = 'changed-name';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(groupInstance.name).toBe('changed-name');
      expect(innerButtons.every(button => button.getAttribute('name') === groupInstance.name))
        .withContext('Expected all buttons to have the new name.')
        .toBe(true);
    });

    it('should set the name of the buttons to the group name if the name of the button changes after init', () => {
      const firstButton = innerButtons[0];
      expect(firstButton.getAttribute('name')).toBe(fixture.componentInstance.groupName);

      fixture.componentInstance.options[0].name = 'changed-name';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(firstButton.getAttribute('name')).toBe(fixture.componentInstance.groupName);
    });

    it('should check the corresponding button toggle on a group value change', () => {
      expect(groupInstance.value).toBeFalsy();
      for (let buttonToggle of buttonToggleInstances) {
        expect(buttonToggle.checked).toBeFalsy();
      }

      groupInstance.value = 'red';
      for (let buttonToggle of buttonToggleInstances) {
        expect(buttonToggle.checked).toBe(groupInstance.value === buttonToggle.value);
      }

      const selected = groupInstance.selected as MatButtonToggle;

      expect(selected.value).toBe(groupInstance.value);
    });

    it('should have the correct FormControl state initially and after interaction', fakeAsync(() => {
      expect(groupNgModel.valid).toBe(true);
      expect(groupNgModel.pristine).toBe(true);
      expect(groupNgModel.touched).toBe(false);

      buttonToggleInstances[1].checked = true;
      fixture.detectChanges();
      tick();

      expect(groupNgModel.valid).toBe(true);
      expect(groupNgModel.pristine).toBe(true);
      expect(groupNgModel.touched).toBe(false);

      innerButtons[2].click();
      fixture.detectChanges();
      tick();

      expect(groupNgModel.valid).toBe(true);
      expect(groupNgModel.pristine).toBe(false);
      expect(groupNgModel.touched).toBe(true);
    }));

    it('should update the ngModel value when selecting a button toggle', fakeAsync(() => {
      innerButtons[1].click();
      fixture.detectChanges();

      tick();

      expect(testComponent.modelValue).toBe('green');
    }));

    it('should show a ripple on label click', () => {
      const groupElement = groupDebugElement.nativeElement;

      expect(groupElement.querySelectorAll('.mat-ripple-element').length).toBe(0);

      dispatchMouseEvent(innerButtons[0], 'mousedown');
      dispatchMouseEvent(innerButtons[0], 'mouseup');

      expect(groupElement.querySelectorAll('.mat-ripple-element').length).toBe(1);
    });

    it('should allow ripples to be disabled', () => {
      const groupElement = groupDebugElement.nativeElement;

      testComponent.disableRipple = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(groupElement.querySelectorAll('.mat-ripple-element').length).toBe(0);

      dispatchMouseEvent(innerButtons[0], 'mousedown');
      dispatchMouseEvent(innerButtons[0], 'mouseup');

      expect(groupElement.querySelectorAll('.mat-ripple-element').length).toBe(0);
    });

    it(
      'should maintain the selected value when swapping out the list of toggles with one ' +
        'that still contains the value',
      fakeAsync(() => {
        expect(buttonToggleInstances[0].checked).toBe(false);
        expect(fixture.componentInstance.modelValue).toBeFalsy();
        expect(groupInstance.value).toBeFalsy();

        groupInstance.value = 'red';
        fixture.detectChanges();

        expect(buttonToggleInstances[0].checked).toBe(true);
        expect(groupInstance.value).toBe('red');

        fixture.componentInstance.options = [...fixture.componentInstance.options];
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(MatButtonToggle));
        buttonToggleInstances = buttonToggleDebugElements.map(debugEl => debugEl.componentInstance);

        expect(buttonToggleInstances[0].checked).toBe(true);
        expect(groupInstance.value).toBe('red');
      }),
    );
  });

  it('should be able to pick up toggles that are not direct descendants', fakeAsync(() => {
    const fixture = TestBed.createComponent(ButtonToggleGroupWithIndirectDescendantToggles);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.mat-button-toggle button');
    const groupDebugElement = fixture.debugElement.query(By.directive(MatButtonToggleGroup))!;
    const groupInstance =
      groupDebugElement.injector.get<MatButtonToggleGroup>(MatButtonToggleGroup);

    button.click();
    fixture.detectChanges();
    tick();

    expect(groupInstance.value).toBe('red');
    expect(fixture.componentInstance.control.value).toBe('red');
    expect(groupInstance._buttonToggles.length).toBe(3);
  }));

  it('should preserve the selection if the pre-selected option is removed and re-added', () => {
    const fixture = TestBed.createComponent(ButtonToggleGroupWithFormControlAndDynamicButtons);
    const instance = fixture.componentInstance;
    instance.control.setValue('a');
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.mat-button-toggle-button');

    expect(instance.toggles.map(t => t.checked)).toEqual([true, false, false]);

    buttons[2].click();
    fixture.detectChanges();

    instance.values.shift();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(instance.toggles.map(t => t.checked)).toEqual([false, true]);

    instance.values.unshift('a');
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(instance.toggles.map(t => t.checked)).toEqual([false, false, true]);
  });

  it('should preserve the pre-selected option if it is removed and re-added', () => {
    const fixture = TestBed.createComponent(ButtonToggleGroupWithFormControlAndDynamicButtons);
    const instance = fixture.componentInstance;
    instance.control.setValue('a');
    fixture.detectChanges();
    expect(instance.toggles.map(t => t.checked)).toEqual([true, false, false]);

    instance.values.shift();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(instance.toggles.map(t => t.checked)).toEqual([false, false]);

    instance.values.unshift('a');
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(instance.toggles.map(t => t.checked)).toEqual([true, false, false]);
  });
});

describe('MatButtonToggle without forms', () => {
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatButtonToggleModule,
        ButtonTogglesInsideButtonToggleGroup,
        ButtonTogglesInsideButtonToggleGroupMultiple,
        FalsyButtonTogglesInsideButtonToggleGroupMultiple,
        ButtonToggleGroupWithInitialValue,
        StandaloneButtonToggle,
        ButtonToggleWithAriaLabel,
        ButtonToggleWithAriaLabelledby,
        RepeatedButtonTogglesWithPreselectedValue,
        ButtonToggleWithTabindex,
        ButtonToggleWithStaticName,
        ButtonToggleWithStaticChecked,
        ButtonToggleWithStaticAriaAttributes,
      ],
    });
  }));

  describe('inside of an exclusive selection group', () => {
    let fixture: ComponentFixture<ButtonTogglesInsideButtonToggleGroup>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let buttonToggleDebugElements: DebugElement[];
    let buttonToggleNativeElements: HTMLElement[];
    let buttonToggleLabelElements: HTMLLabelElement[];
    let groupInstance: MatButtonToggleGroup;
    let buttonToggleInstances: MatButtonToggle[];
    let testComponent: ButtonTogglesInsideButtonToggleGroup;

    beforeEach(() => {
      fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroup);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      groupDebugElement = fixture.debugElement.query(By.directive(MatButtonToggleGroup))!;
      groupNativeElement = groupDebugElement.nativeElement;
      groupInstance = groupDebugElement.injector.get<MatButtonToggleGroup>(MatButtonToggleGroup);

      buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(MatButtonToggle));

      buttonToggleNativeElements = buttonToggleDebugElements.map(debugEl => debugEl.nativeElement);

      buttonToggleLabelElements = fixture.debugElement
        .queryAll(By.css('button'))
        .map(debugEl => debugEl.nativeElement);

      buttonToggleInstances = buttonToggleDebugElements.map(debugEl => debugEl.componentInstance);
    });

    it('should initialize the tab index correctly', () => {
      buttonToggleLabelElements.forEach((buttonToggle, index) => {
        if (index === 0) {
          expect(buttonToggle.getAttribute('tabindex')).toBe('0');
        } else {
          expect(buttonToggle.getAttribute('tabindex')).toBe('-1');
        }
      });
    });

    it('should update the tab index correctly', () => {
      buttonToggleLabelElements[1].click();
      fixture.detectChanges();

      expect(buttonToggleLabelElements[0].getAttribute('tabindex')).toBe('-1');
      expect(buttonToggleLabelElements[1].getAttribute('tabindex')).toBe('0');
    });

    it('should set individual button toggle names based on the group name', () => {
      expect(groupInstance.name).toBeTruthy();
      for (let buttonToggle of buttonToggleLabelElements) {
        expect(buttonToggle.getAttribute('name')).toBe(groupInstance.name);
      }
    });

    it('should disable click interactions when the group is disabled', () => {
      testComponent.isGroupDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      buttonToggleNativeElements[0].click();
      expect(buttonToggleInstances[0].checked).toBe(false);
      expect(buttonToggleInstances[0].disabled).toBe(true);

      testComponent.isGroupDisabled = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(buttonToggleInstances[0].disabled).toBe(false);

      buttonToggleLabelElements[0].click();
      fixture.detectChanges();

      expect(buttonToggleInstances[0].checked).toBe(true);
    });

    it('should set aria-disabled based on whether the group is disabled', () => {
      expect(groupNativeElement.getAttribute('aria-disabled')).toBe('false');

      testComponent.isGroupDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(groupNativeElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should disable the underlying button when the group is disabled', () => {
      const buttons = buttonToggleNativeElements.map(toggle => toggle.querySelector('button')!);

      expect(buttons.every(input => input.disabled)).toBe(false);

      testComponent.isGroupDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(buttons.every(input => input.disabled)).toBe(true);
    });

    it('should be able to keep the button interactive while disabled', () => {
      const button = buttonToggleNativeElements[0].querySelector('button')!;
      testComponent.isGroupDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(button.hasAttribute('disabled')).toBe(true);
      expect(button.hasAttribute('aria-disabled')).toBe(false);
      expect(button.getAttribute('tabindex')).toBe('-1');

      testComponent.disabledIntearctive = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(button.hasAttribute('disabled')).toBe(false);
      expect(button.getAttribute('aria-disabled')).toBe('true');
      expect(button.getAttribute('tabindex')).toBe('0');
    });

    it('should update the group value when one of the toggles changes', () => {
      expect(groupInstance.value).toBeFalsy();
      buttonToggleLabelElements[0].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test1');
      expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
    });

    it('should propagate the value change back up via a two-way binding', () => {
      expect(groupInstance.value).toBeFalsy();
      buttonToggleLabelElements[0].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test1');
      expect(testComponent.groupValue).toBe('test1');
    });

    it('should update the group and toggles when one of the button toggles is clicked', () => {
      expect(groupInstance.value).toBeFalsy();
      buttonToggleLabelElements[0].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test1');
      expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
      expect(buttonToggleInstances[0].checked).toBe(true);
      expect(buttonToggleInstances[1].checked).toBe(false);

      buttonToggleLabelElements[1].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test2');
      expect(groupInstance.selected).toBe(buttonToggleInstances[1]);
      expect(buttonToggleInstances[0].checked).toBe(false);
      expect(buttonToggleInstances[1].checked).toBe(true);
    });

    it('should check a button toggle upon interaction with underlying native radio button', () => {
      buttonToggleLabelElements[0].click();
      fixture.detectChanges();

      expect(buttonToggleInstances[0].checked).toBe(true);
      expect(groupInstance.value).toBe('test1');
    });

    it('should change the vertical state', () => {
      expect(groupNativeElement.classList).not.toContain('mat-button-toggle-vertical');

      groupInstance.vertical = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(groupNativeElement.classList).toContain('mat-button-toggle-vertical');
    });

    it('should emit a change event from button toggles', fakeAsync(() => {
      expect(buttonToggleInstances[0].checked).toBe(false);

      const changeSpy = jasmine.createSpy('button-toggle change listener');
      buttonToggleInstances[0].change.subscribe(changeSpy);

      buttonToggleLabelElements[0].click();
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalledTimes(1);

      buttonToggleLabelElements[0].click();
      fixture.detectChanges();
      tick();

      // Always emit change event when button toggle is clicked
      expect(changeSpy).toHaveBeenCalledTimes(2);
    }));

    it('should emit a change event from the button toggle group', fakeAsync(() => {
      expect(groupInstance.value).toBeFalsy();

      const changeSpy = jasmine.createSpy('button-toggle-group change listener');
      groupInstance.change.subscribe(changeSpy);

      buttonToggleLabelElements[0].click();
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalled();

      buttonToggleLabelElements[1].click();
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalledTimes(2);
    }));

    it('should update the group and button toggles when updating the group value', () => {
      expect(groupInstance.value).toBeFalsy();

      testComponent.groupValue = 'test1';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test1');
      expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
      expect(buttonToggleInstances[0].checked).toBe(true);
      expect(buttonToggleInstances[1].checked).toBe(false);

      testComponent.groupValue = 'test2';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test2');
      expect(groupInstance.selected).toBe(buttonToggleInstances[1]);
      expect(buttonToggleInstances[0].checked).toBe(false);
      expect(buttonToggleInstances[1].checked).toBe(true);
    });

    it('should deselect all of the checkboxes when the group value is cleared', () => {
      buttonToggleInstances[0].checked = true;

      expect(groupInstance.value).toBeTruthy();

      groupInstance.value = null;

      expect(buttonToggleInstances.every(toggle => !toggle.checked)).toBe(true);
    });

    it('should update the model if a selected toggle is removed', fakeAsync(() => {
      expect(groupInstance.value).toBeFalsy();
      buttonToggleLabelElements[0].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test1');
      expect(groupInstance.selected).toBe(buttonToggleInstances[0]);

      testComponent.renderFirstToggle = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      tick();

      expect(groupInstance.value).toBeFalsy();
      expect(groupInstance.selected).toBeFalsy();
    }));

    it('should show checkmark indicator by default', () => {
      buttonToggleLabelElements[0].click();
      fixture.detectChanges();

      expect(document.querySelectorAll('.mat-pseudo-checkbox').length).toBe(1);
    });
  });

  describe('with initial value and change event', () => {
    it('should not fire an initial change event', () => {
      const fixture = TestBed.createComponent(ButtonToggleGroupWithInitialValue);
      const testComponent = fixture.debugElement.componentInstance;
      const groupDebugElement = fixture.debugElement.query(By.directive(MatButtonToggleGroup))!;
      const groupInstance: MatButtonToggleGroup =
        groupDebugElement.injector.get<MatButtonToggleGroup>(MatButtonToggleGroup);

      fixture.detectChanges();

      // Note that we cast to a boolean, because the event has some circular references
      // which will crash the runner when Jasmine attempts to stringify them.
      expect(!!testComponent.lastEvent).toBe(false);
      expect(groupInstance.value).toBe('red');

      groupInstance.value = 'green';
      fixture.detectChanges();

      expect(!!testComponent.lastEvent).toBe(false);
      expect(groupInstance.value).toBe('green');
    });
  });

  describe('inside of a multiple selection group', () => {
    let fixture: ComponentFixture<ButtonTogglesInsideButtonToggleGroupMultiple>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let buttonToggleDebugElements: DebugElement[];
    let buttonToggleNativeElements: HTMLElement[];
    let buttonToggleLabelElements: HTMLLabelElement[];
    let groupInstance: MatButtonToggleGroup;
    let buttonToggleInstances: MatButtonToggle[];
    let testComponent: ButtonTogglesInsideButtonToggleGroupMultiple;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroupMultiple);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      groupDebugElement = fixture.debugElement.query(By.directive(MatButtonToggleGroup))!;
      groupNativeElement = groupDebugElement.nativeElement;
      groupInstance = groupDebugElement.injector.get<MatButtonToggleGroup>(MatButtonToggleGroup);

      buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(MatButtonToggle));
      buttonToggleNativeElements = buttonToggleDebugElements.map(debugEl => debugEl.nativeElement);
      buttonToggleLabelElements = fixture.debugElement
        .queryAll(By.css('button'))
        .map(debugEl => debugEl.nativeElement);
      buttonToggleInstances = buttonToggleDebugElements.map(debugEl => debugEl.componentInstance);
    }));

    it('should disable click interactions when the group is disabled', () => {
      testComponent.isGroupDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      buttonToggleNativeElements[0].click();
      expect(buttonToggleInstances[0].checked).toBe(false);
    });

    it('should check a button toggle when clicked', () => {
      expect(buttonToggleInstances.every(buttonToggle => !buttonToggle.checked)).toBe(true);

      const nativeCheckboxLabel = buttonToggleDebugElements[0].query(
        By.css('button'),
      )!.nativeElement;

      nativeCheckboxLabel.click();

      expect(groupInstance.value).toEqual(['eggs']);
      expect(buttonToggleInstances[0].checked).toBe(true);
    });

    it('should allow for multiple toggles to be selected', () => {
      buttonToggleInstances[0].checked = true;
      fixture.detectChanges();

      expect(groupInstance.value).toEqual(['eggs']);
      expect(buttonToggleInstances[0].checked).toBe(true);

      buttonToggleInstances[1].checked = true;
      fixture.detectChanges();

      expect(groupInstance.value).toEqual(['eggs', 'flour']);
      expect(buttonToggleInstances[1].checked).toBe(true);
      expect(buttonToggleInstances[0].checked).toBe(true);
    });

    it('should check a button toggle upon interaction with underlying native checkbox', () => {
      const nativeCheckboxButton = buttonToggleDebugElements[0].query(
        By.css('button'),
      )!.nativeElement;

      nativeCheckboxButton.click();
      fixture.detectChanges();

      expect(groupInstance.value).toEqual(['eggs']);
      expect(buttonToggleInstances[0].checked).toBe(true);
    });

    it('should change the vertical state', () => {
      expect(groupNativeElement.classList).not.toContain('mat-button-toggle-vertical');

      groupInstance.vertical = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(groupNativeElement.classList).toContain('mat-button-toggle-vertical');
    });

    it('should deselect a button toggle when selected twice', fakeAsync(() => {
      buttonToggleLabelElements[0].click();
      fixture.detectChanges();
      tick();

      expect(buttonToggleInstances[0].checked).toBe(true);
      expect(groupInstance.value).toEqual(['eggs']);

      buttonToggleLabelElements[0].click();
      fixture.detectChanges();
      tick();

      expect(groupInstance.value).toEqual([]);
      expect(buttonToggleInstances[0].checked).toBe(false);
    }));

    it('should emit a change event for state changes', fakeAsync(() => {
      expect(buttonToggleInstances[0].checked).toBe(false);

      const changeSpy = jasmine.createSpy('button-toggle change listener');
      buttonToggleInstances[0].change.subscribe(changeSpy);

      buttonToggleLabelElements[0].click();
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalled();
      expect(groupInstance.value).toEqual(['eggs']);

      buttonToggleLabelElements[0].click();
      fixture.detectChanges();
      tick();
      expect(groupInstance.value).toEqual([]);

      // The default browser behavior is to emit an event, when the value was set
      // to false. That's because the current input type is set to `checkbox` when
      // using the multiple mode.
      expect(changeSpy).toHaveBeenCalledTimes(2);
    }));

    it('should throw when attempting to assign a non-array value', () => {
      expect(() => {
        groupInstance.value = 'not-an-array';
      }).toThrowError(/Value must be an array/);
    });

    it('should show checkmark indicator by default', () => {
      buttonToggleLabelElements[0].click();
      buttonToggleLabelElements[1].click();
      fixture.detectChanges();

      expect(document.querySelectorAll('.mat-pseudo-checkbox').length).toBe(2);
    });
  });

  describe('as standalone', () => {
    let fixture: ComponentFixture<StandaloneButtonToggle>;
    let buttonToggleDebugElement: DebugElement;
    let buttonToggleNativeElement: HTMLElement;
    let buttonToggleLabelElement: HTMLLabelElement;
    let buttonToggleInstance: MatButtonToggle;
    let buttonToggleButtonElement: HTMLButtonElement;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(StandaloneButtonToggle);
      fixture.detectChanges();

      buttonToggleDebugElement = fixture.debugElement.query(By.directive(MatButtonToggle))!;
      buttonToggleNativeElement = buttonToggleDebugElement.nativeElement;
      buttonToggleLabelElement = fixture.debugElement.query(
        By.css('.mat-button-toggle-label-content'),
      )!.nativeElement;
      buttonToggleInstance = buttonToggleDebugElement.componentInstance;
      buttonToggleButtonElement = buttonToggleNativeElement.querySelector(
        'button',
      )! as HTMLButtonElement;
    }));

    it('should toggle when clicked', fakeAsync(() => {
      buttonToggleLabelElement.click();
      fixture.detectChanges();
      flush();

      expect(buttonToggleInstance.checked).toBe(true);

      buttonToggleLabelElement.click();
      fixture.detectChanges();
      flush();

      expect(buttonToggleInstance.checked).toBe(false);
    }));

    it('should emit a change event for state changes', fakeAsync(() => {
      expect(buttonToggleInstance.checked).toBe(false);

      const changeSpy = jasmine.createSpy('button-toggle change listener');
      buttonToggleInstance.change.subscribe(changeSpy);

      buttonToggleLabelElement.click();
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalled();

      buttonToggleLabelElement.click();
      fixture.detectChanges();
      tick();

      // The default browser behavior is to emit an event, when the value was set
      // to false. That's because the current input type is set to `checkbox`.
      expect(changeSpy).toHaveBeenCalledTimes(2);
    }));

    it('should focus on underlying input element when focus() is called', () => {
      const nativeButton = buttonToggleDebugElement.query(By.css('button'))!.nativeElement;
      expect(document.activeElement).not.toBe(nativeButton);

      buttonToggleInstance.focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(nativeButton);
    });

    it('should not assign a name to the underlying input if one is not passed in', () => {
      expect(buttonToggleButtonElement.getAttribute('name')).toBeFalsy();
    });

    it('should have correct aria-pressed attribute', () => {
      expect(buttonToggleButtonElement.getAttribute('aria-pressed')).toBe('false');

      buttonToggleLabelElement.click();

      fixture.detectChanges();

      expect(buttonToggleButtonElement.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('aria-label handling ', () => {
    it('should not set the aria-label attribute if none is provided', () => {
      const fixture = TestBed.createComponent(StandaloneButtonToggle);
      const checkboxDebugElement = fixture.debugElement.query(By.directive(MatButtonToggle))!;
      const checkboxNativeElement = checkboxDebugElement.nativeElement;
      const buttonElement = checkboxNativeElement.querySelector('button') as HTMLButtonElement;

      fixture.detectChanges();
      expect(buttonElement.hasAttribute('aria-label')).toBe(false);
    });

    it('should use the provided aria-label', () => {
      const fixture = TestBed.createComponent(ButtonToggleWithAriaLabel);
      const checkboxDebugElement = fixture.debugElement.query(By.directive(MatButtonToggle))!;
      const checkboxNativeElement = checkboxDebugElement.nativeElement;
      const buttonElement = checkboxNativeElement.querySelector('button') as HTMLButtonElement;

      fixture.detectChanges();
      expect(buttonElement.getAttribute('aria-label')).toBe('Super effective');
    });

    it('should clear the static aria from the host node', () => {
      const fixture = TestBed.createComponent(ButtonToggleWithStaticAriaAttributes);
      fixture.detectChanges();
      const hostNode: HTMLElement = fixture.nativeElement.querySelector('mat-button-toggle');

      expect(hostNode.hasAttribute('aria-label')).toBe(false);
      expect(hostNode.hasAttribute('aria-labelledby')).toBe(false);
    });
  });

  describe('with provided aria-labelledby ', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let buttonElement: HTMLButtonElement;

    it('should use the provided aria-labelledby', () => {
      const fixture = TestBed.createComponent(ButtonToggleWithAriaLabelledby);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatButtonToggle))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      buttonElement = checkboxNativeElement.querySelector('button') as HTMLButtonElement;

      fixture.detectChanges();
      expect(buttonElement.getAttribute('aria-labelledby')).toBe('some-id');
    });

    it('should not assign aria-labelledby if none is provided', () => {
      const fixture = TestBed.createComponent(StandaloneButtonToggle);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatButtonToggle))!;
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      buttonElement = checkboxNativeElement.querySelector('button') as HTMLButtonElement;

      fixture.detectChanges();
      expect(buttonElement.getAttribute('aria-labelledby')).toBe(null);
    });
  });

  describe('with tabindex', () => {
    it('should forward the tabindex to the underlying button', () => {
      const fixture = TestBed.createComponent(ButtonToggleWithTabindex);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.mat-button-toggle button');

      expect(button.getAttribute('tabindex')).toBe('3');
    });

    it('should have role "presentation"', () => {
      const fixture = TestBed.createComponent(ButtonToggleWithTabindex);
      fixture.detectChanges();

      const host = fixture.nativeElement.querySelector('.mat-button-toggle');

      expect(host.getAttribute('role')).toBe('presentation');
    });

    it('should forward focus to the underlying button when the host is focused', () => {
      const fixture = TestBed.createComponent(ButtonToggleWithTabindex);
      fixture.detectChanges();

      const host = fixture.nativeElement.querySelector('.mat-button-toggle');
      const button = host.querySelector('button');

      expect(document.activeElement).not.toBe(button);

      host.focus();

      expect(document.activeElement).toBe(button);
    });
  });

  describe('with tokens to hide checkmark selection indicators', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          MatButtonToggleModule,
          ButtonTogglesInsideButtonToggleGroup,
          ButtonTogglesInsideButtonToggleGroupMultiple,
        ],
        providers: [
          {
            provide: MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS,
            useValue: {
              hideSingleSelectionIndicator: true,
              hideMultipleSelectionIndicator: true,
            },
          },
        ],
      });
    });

    it('should hide checkmark indicator for single selection', () => {
      const fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroup);
      fixture.detectChanges();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      fixture.detectChanges();

      expect(document.querySelectorAll('.mat-pseudo-checkbox').length).toBe(0);
    });

    it('should hide checkmark indicator for multiple selection', () => {
      const fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroupMultiple);
      fixture.detectChanges();

      // Check all button toggles in the group
      fixture.debugElement
        .queryAll(By.css('button'))
        .forEach(toggleButton => toggleButton.nativeElement.click());
      fixture.detectChanges();

      expect(document.querySelectorAll('.mat-pseudo-checkbox').length).toBe(0);
    });
  });

  it('should not throw on init when toggles are repeated and there is an initial value', () => {
    const fixture = TestBed.createComponent(RepeatedButtonTogglesWithPreselectedValue);

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.componentInstance.toggleGroup.value).toBe('Two');
    expect(fixture.componentInstance.toggles.toArray()[1].checked).toBe(true);
  });

  it('should not throw on init when toggles are repeated and there is an initial value', () => {
    const fixture = TestBed.createComponent(ButtonToggleWithStaticName);
    fixture.detectChanges();

    const hostNode: HTMLElement = fixture.nativeElement.querySelector('.mat-button-toggle');

    expect(hostNode.hasAttribute('name')).toBe(false);
    expect(hostNode.querySelector('button')!.getAttribute('name')).toBe('custom-name');
  });

  it(
    'should maintain the selected state when the value and toggles are swapped out at ' +
      'the same time',
    () => {
      const fixture = TestBed.createComponent(RepeatedButtonTogglesWithPreselectedValue);
      fixture.detectChanges();

      expect(fixture.componentInstance.toggleGroup.value).toBe('Two');
      expect(fixture.componentInstance.toggles.toArray()[1].checked).toBe(true);

      fixture.componentInstance.possibleValues = ['Five', 'Six', 'Seven'];
      fixture.componentInstance.value = 'Seven';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(fixture.componentInstance.toggleGroup.value).toBe('Seven');
      expect(fixture.componentInstance.toggles.toArray()[2].checked).toBe(true);
    },
  );

  it('should select falsy button toggle value in multiple selection', () => {
    const fixture = TestBed.createComponent(FalsyButtonTogglesInsideButtonToggleGroupMultiple);
    fixture.detectChanges();

    expect(fixture.componentInstance.toggles.toArray()[0].checked).toBe(true);
    expect(fixture.componentInstance.toggles.toArray()[1].checked).toBe(false);
    expect(fixture.componentInstance.toggles.toArray()[2].checked).toBe(false);

    fixture.componentInstance.value = [0, false];
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(fixture.componentInstance.toggles.toArray()[0].checked).toBe(true);
    expect(fixture.componentInstance.toggles.toArray()[1].checked).toBe(false);
    expect(fixture.componentInstance.toggles.toArray()[2].checked).toBe(true);
  });

  it('should not throw if initial value is set during creation', () => {
    const fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroupMultiple);

    // In Ivy static inputs are set during creation. We simulate this by not calling
    // `fixture.detectChanges` immediately, but getting a hold of the instance via the
    // DebugElement and setting the value ourselves.
    expect(() => {
      const toggle = fixture.debugElement.query(By.css('mat-button-toggle'))!.componentInstance;
      toggle.checked = true;
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should have a focus indicator', () => {
    const fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroup);
    const buttonNativeElements = [...fixture.debugElement.nativeElement.querySelectorAll('button')];

    expect(
      buttonNativeElements.every(element => element.classList.contains('mat-focus-indicator')),
    ).toBe(true);
  });

  it('should be able to pre-check a button toggle using a static checked binding', () => {
    const fixture = TestBed.createComponent(ButtonToggleWithStaticChecked);
    fixture.detectChanges();

    expect(fixture.componentInstance.toggles.map(t => t.checked)).toEqual([false, true]);
    expect(fixture.componentInstance.group.value).toBe('2');
  });
});

@Component({
  template: `
  <mat-button-toggle-group
    [disabled]="isGroupDisabled"
    [disabledInteractive]="disabledIntearctive"
    [vertical]="isVertical"
    [(value)]="groupValue">
    @if (renderFirstToggle) {
      <mat-button-toggle value="test1">Test1</mat-button-toggle>
    }
    <mat-button-toggle value="test2">Test2</mat-button-toggle>
    <mat-button-toggle value="test3">Test3</mat-button-toggle>
  </mat-button-toggle-group>
  `,
  standalone: true,
  imports: [MatButtonToggleModule],
})
class ButtonTogglesInsideButtonToggleGroup {
  isGroupDisabled: boolean = false;
  disabledIntearctive = false;
  isVertical: boolean = false;
  groupValue: string;
  renderFirstToggle = true;
}

@Component({
  template: `
  <mat-button-toggle-group
    [name]="groupName"
    [(ngModel)]="modelValue"
    (change)="lastEvent = $event">
    @for (option of options; track option) {
      <mat-button-toggle
        [value]="option.value"
        [disableRipple]="disableRipple"
        [name]="option.name">{{option.label}}</mat-button-toggle>
    }
  </mat-button-toggle-group>
  `,
  standalone: true,
  imports: [MatButtonToggleModule, FormsModule, ReactiveFormsModule],
})
class ButtonToggleGroupWithNgModel {
  groupName = 'group-name';
  modelValue: string;
  options = [
    {label: 'Red', value: 'red', name: ''},
    {label: 'Green', value: 'green', name: ''},
    {label: 'Blue', value: 'blue', name: ''},
  ];
  lastEvent: MatButtonToggleChange;
  disableRipple = false;
}

@Component({
  template: `
  <mat-button-toggle-group [disabled]="isGroupDisabled" [vertical]="isVertical" multiple>
    <mat-button-toggle value="eggs">Eggs</mat-button-toggle>
    <mat-button-toggle value="flour">Flour</mat-button-toggle>
    <mat-button-toggle value="sugar">Sugar</mat-button-toggle>
  </mat-button-toggle-group>
  `,
  standalone: true,
  imports: [MatButtonToggleModule],
})
class ButtonTogglesInsideButtonToggleGroupMultiple {
  isGroupDisabled: boolean = false;
  isVertical: boolean = false;
}

@Component({
  template: `
  <mat-button-toggle-group multiple [value]="value">
    <mat-button-toggle [value]="0">Eggs</mat-button-toggle>
    <mat-button-toggle [value]="null">Flour</mat-button-toggle>
    <mat-button-toggle [value]="false">Sugar</mat-button-toggle>
    <mat-button-toggle>Sugar</mat-button-toggle>
  </mat-button-toggle-group>
  `,
  standalone: true,
  imports: [MatButtonToggleModule],
})
class FalsyButtonTogglesInsideButtonToggleGroupMultiple {
  value: ('' | number | null | undefined | boolean)[] = [0];
  @ViewChildren(MatButtonToggle) toggles: QueryList<MatButtonToggle>;
}

@Component({
  template: `
  <mat-button-toggle>Yes</mat-button-toggle>
  `,
  standalone: true,
  imports: [MatButtonToggleModule],
})
class StandaloneButtonToggle {}

@Component({
  template: `
  <mat-button-toggle-group (change)="lastEvent = $event" value="red">
    <mat-button-toggle value="red">Value Red</mat-button-toggle>
    <mat-button-toggle value="green">Value Green</mat-button-toggle>
  </mat-button-toggle-group>
  `,
  standalone: true,
  imports: [MatButtonToggleModule],
})
class ButtonToggleGroupWithInitialValue {
  lastEvent: MatButtonToggleChange;
}

@Component({
  template: `
  <mat-button-toggle-group [formControl]="control">
    <mat-button-toggle value="red">Value Red</mat-button-toggle>
    <mat-button-toggle value="green">Value Green</mat-button-toggle>
    <mat-button-toggle value="blue">Value Blue</mat-button-toggle>
  </mat-button-toggle-group>
  `,
  standalone: true,
  imports: [MatButtonToggleModule, FormsModule, ReactiveFormsModule],
})
class ButtonToggleGroupWithFormControl {
  control = new FormControl('');
}

@Component({
  // We need the `@if` so that there's a container between the group and the toggles.
  template: `
    <mat-button-toggle-group [formControl]="control">
      @if (true) {
        <mat-button-toggle value="red">Value Red</mat-button-toggle>
        <mat-button-toggle value="green">Value Green</mat-button-toggle>
        <mat-button-toggle value="blue">Value Blue</mat-button-toggle>
      }
    </mat-button-toggle-group>
  `,
  standalone: true,
  imports: [MatButtonToggleModule, FormsModule, ReactiveFormsModule],
})
class ButtonToggleGroupWithIndirectDescendantToggles {
  control = new FormControl('');
}

/** Simple test component with an aria-label set. */
@Component({
  template: `<mat-button-toggle aria-label="Super effective"></mat-button-toggle>`,
  standalone: true,
  imports: [MatButtonToggleModule],
})
class ButtonToggleWithAriaLabel {}

/** Simple test component with an aria-label set. */
@Component({
  template: `<mat-button-toggle aria-labelledby="some-id"></mat-button-toggle>`,
  standalone: true,
  imports: [MatButtonToggleModule],
})
class ButtonToggleWithAriaLabelledby {}

@Component({
  template: `
    <mat-button-toggle-group [(value)]="value">
      @for (toggle of possibleValues; track toggle) {
        <mat-button-toggle [value]="toggle">{{toggle}}</mat-button-toggle>
      }
    </mat-button-toggle-group>
  `,
  standalone: true,
  imports: [MatButtonToggleModule],
})
class RepeatedButtonTogglesWithPreselectedValue {
  @ViewChild(MatButtonToggleGroup) toggleGroup: MatButtonToggleGroup;
  @ViewChildren(MatButtonToggle) toggles: QueryList<MatButtonToggle>;

  possibleValues = ['One', 'Two', 'Three'];
  value = 'Two';
}

@Component({
  template: `<mat-button-toggle tabindex="3"></mat-button-toggle>`,
  standalone: true,
  imports: [MatButtonToggleModule],
})
class ButtonToggleWithTabindex {}

@Component({
  template: `<mat-button-toggle name="custom-name"></mat-button-toggle>`,
  standalone: true,
  imports: [MatButtonToggleModule],
})
class ButtonToggleWithStaticName {}

@Component({
  template: `
    <mat-button-toggle-group>
      <mat-button-toggle value="1">One</mat-button-toggle>
      <mat-button-toggle value="2" checked>Two</mat-button-toggle>
    </mat-button-toggle-group>
  `,
  standalone: true,
  imports: [MatButtonToggleModule],
})
class ButtonToggleWithStaticChecked {
  @ViewChild(MatButtonToggleGroup) group: MatButtonToggleGroup;
  @ViewChildren(MatButtonToggle) toggles: QueryList<MatButtonToggle>;
}

@Component({
  template: `
    <mat-button-toggle aria-label="Toggle me" aria-labelledby="something"></mat-button-toggle>
  `,
  standalone: true,
  imports: [MatButtonToggleModule],
})
class ButtonToggleWithStaticAriaAttributes {}

@Component({
  template: `
  <mat-button-toggle-group [formControl]="control">
    @for (value of values; track value) {
      <mat-button-toggle [value]="value">{{value}}</mat-button-toggle>
    }
  </mat-button-toggle-group>
  `,
  standalone: true,
  imports: [MatButtonToggleModule, FormsModule, ReactiveFormsModule],
})
class ButtonToggleGroupWithFormControlAndDynamicButtons {
  @ViewChildren(MatButtonToggle) toggles: QueryList<MatButtonToggle>;
  control = new FormControl('');
  values = ['a', 'b', 'c'];
}
