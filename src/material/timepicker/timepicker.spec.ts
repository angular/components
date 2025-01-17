import {Component, Provider, signal, ViewChild} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {DateAdapter, provideNativeDateAdapter} from '@angular/material/core';
import {
  clearElement,
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  typeInElement,
} from '@angular/cdk/testing/private';
import {
  DOWN_ARROW,
  END,
  ENTER,
  ESCAPE,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  TAB,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {MatInput} from '@angular/material/input';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatTimepickerInput} from './timepicker-input';
import {MatTimepicker} from './timepicker';
import {MatTimepickerToggle} from './timepicker-toggle';
import {MAT_TIMEPICKER_CONFIG, MatTimepickerOption} from './util';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';

describe('MatTimepicker', () => {
  let adapter: DateAdapter<Date>;

  beforeEach(() => configureTestingModule());

  describe('value selection', () => {
    it('should only change the time part of the selected date', fakeAsync(() => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.value.set(new Date(2024, 0, 15, 0, 0, 0));
      fixture.detectChanges();
      getInput(fixture).click();
      fixture.detectChanges();

      getOptions()[3].click();
      fixture.detectChanges();
      flush();

      const value = fixture.componentInstance.input.value()!;
      expect(value).toBeTruthy();
      expect(adapter.getYear(value)).toBe(2024);
      expect(adapter.getMonth(value)).toBe(0);
      expect(adapter.getDate(value)).toBe(15);
      expect(adapter.getHours(value)).toBe(1);
      expect(adapter.getMinutes(value)).toBe(30);
      expect(adapter.getSeconds(value)).toBe(0);
    }));

    it('should accept the selected value and close the panel when clicking an option', fakeAsync(() => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();
      expect(input.value).toBe('');
      expect(fixture.componentInstance.input.value()).toBe(null);
      expect(fixture.componentInstance.selectedSpy).not.toHaveBeenCalled();

      input.click();
      fixture.detectChanges();

      getOptions()[1].click();
      fixture.detectChanges();
      flush();

      expect(getPanel()).toBeFalsy();
      expect(input.value).toBe('12:30 AM');
      expectSameTime(fixture.componentInstance.input.value(), createTime(0, 30));
      expect(fixture.componentInstance.selectedSpy).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.selectedSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          source: fixture.componentInstance.timepicker,
          value: jasmine.any(Date),
        }),
      );
    }));

    it('should support two-way binding on the `value` input', fakeAsync(() => {
      const fixture = TestBed.createComponent(TimepickerTwoWayBinding);
      const input = getInput(fixture);
      fixture.detectChanges();
      const inputInstance = fixture.componentInstance.input;

      // Initial value
      expect(fixture.componentInstance.value).toBeTruthy();
      expectSameTime(inputInstance.value(), fixture.componentInstance.value());

      // Propagation from input back to host
      clearElement(input);
      typeInElement(input, '11:15 AM');
      fixture.detectChanges();
      let value = inputInstance.value()!;
      expect(adapter.getHours(value)).toBe(11);
      expect(adapter.getMinutes(value)).toBe(15);
      expectSameTime(fixture.componentInstance.value(), value);

      // Propagation from host down to input
      fixture.componentInstance.value.set(createTime(13, 37));
      fixture.detectChanges();
      flush();
      value = inputInstance.value()!;
      expect(adapter.getHours(value)).toBe(13);
      expect(adapter.getMinutes(value)).toBe(37);
      expectSameTime(fixture.componentInstance.value(), value);
    }));

    it('should emit the `selected` event if the option being clicked was selected already', fakeAsync(() => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.value.set(new Date(2024, 0, 15, 2, 30, 0));
      fixture.detectChanges();
      getInput(fixture).click();
      fixture.detectChanges();
      expect(fixture.componentInstance.selectedSpy).not.toHaveBeenCalled();

      getOptions()[getActiveOptionIndex()].click();
      fixture.detectChanges();
      flush();

      expect(getPanel()).toBeFalsy();
      expect(fixture.componentInstance.selectedSpy).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.selectedSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          source: fixture.componentInstance.timepicker,
          value: jasmine.any(Date),
        }),
      );
    }));
  });

  describe('input behavior', () => {
    it('should reformat the input value when the model changes', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.componentInstance.value.set(createTime(13, 45));
      fixture.detectChanges();
      expect(input.value).toBe('1:45 PM');
      fixture.componentInstance.value.set(createTime(9, 31));
      fixture.detectChanges();
      expect(input.value).toBe('9:31 AM');
    });

    it('should reformat the input value when the locale changes', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.componentInstance.value.set(createTime(13, 45));
      fixture.detectChanges();
      expect(input.value).toBe('1:45 PM');
      adapter.setLocale('da-DK');
      fixture.detectChanges();
      expect(input.value).toBe('13.45');
    });

    it('should parse a valid time value entered by the user', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();
      expect(fixture.componentInstance.input.value()).toBe(null);

      typeInElement(input, '13:37');
      fixture.detectChanges();

      // The user's value shouldn't be overwritten.
      expect(input.value).toBe('13:37');
      expectSameTime(fixture.componentInstance.input.value(), createTime(13, 37));
    });

    it('should parse invalid time string', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.detectChanges();
      const input = getInput(fixture);
      fixture.componentInstance.input.value.set(createTime(10, 55));

      typeInElement(input, 'not a valid time');
      fixture.detectChanges();

      expect(input.value).toBe('not a valid time');
      expect(adapter.isValid(fixture.componentInstance.input.value()!)).toBe(false);
    });

    it('should format the entered value on blur', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();

      typeInElement(input, '13:37');
      fixture.detectChanges();
      expect(input.value).toBe('13:37');

      dispatchFakeEvent(input, 'blur');
      fixture.detectChanges();
      expect(input.value).toBe('1:37 PM');
    });

    it('should not format invalid time string entered by the user', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();

      typeInElement(input, 'not a valid time');
      fixture.detectChanges();
      expect(input.value).toBe('not a valid time');
      expect(adapter.isValid(fixture.componentInstance.input.value()!)).toBe(false);

      dispatchFakeEvent(input, 'blur');
      fixture.detectChanges();
      expect(input.value).toBe('not a valid time');
      expect(adapter.isValid(fixture.componentInstance.input.value()!)).toBe(false);
    });

    it('should not format invalid time set programmatically', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.value.set(adapter.invalid());
      fixture.detectChanges();
      expect(getInput(fixture).value).toBe('');
    });

    it('should set the disabled state of the input', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();
      expect(input.disabled).toBe(false);
      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      expect(input.disabled).toBe(true);
    });

    it('should assign the last valid date with a new time if the user clears the time and re-enters it', () => {
      const dateParts = [2024, 0, 15] as const;
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();
      const inputInstance = fixture.componentInstance.input;

      inputInstance.value.set(new Date(...dateParts, 8, 15, 0));
      fixture.detectChanges();
      expect(input.value).toBe('8:15 AM');

      clearElement(input);
      fixture.detectChanges();
      expect(input.value).toBe('');
      expect(inputInstance.value()).toBe(null);

      typeInElement(input, '2:10 PM');
      fixture.detectChanges();
      expect(input.value).toBe('2:10 PM');
      expectSameTime(inputInstance.value(), new Date(...dateParts, 14, 10, 0));
    });

    it('should not accept an invalid `min` value', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.min.set(createTime(13, 45));
      fixture.detectChanges();
      expectSameTime(fixture.componentInstance.input.min(), createTime(13, 45));

      fixture.componentInstance.min.set(adapter.invalid());
      fixture.detectChanges();
      expect(fixture.componentInstance.input.min()).toBe(null);
    });

    it('should not accept an invalid `max` value', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.max.set(createTime(13, 45));
      fixture.detectChanges();
      expectSameTime(fixture.componentInstance.input.max(), createTime(13, 45));

      fixture.componentInstance.max.set(adapter.invalid());
      fixture.detectChanges();
      expect(fixture.componentInstance.input.max()).toBe(null);
    });

    it('should accept a valid time string as the `min`', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.min.set('1:45 PM');
      fixture.detectChanges();
      expectSameTime(fixture.componentInstance.input.min(), createTime(13, 45));
    });

    it('should accept a valid time string as the `max`', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.max.set('1:45 PM');
      fixture.detectChanges();
      expectSameTime(fixture.componentInstance.input.max(), createTime(13, 45));
    });

    it('should throw if multiple inputs are associated with a timepicker', () => {
      expect(() => {
        const fixture = TestBed.createComponent(TimepickerWithMultipleInputs);
        fixture.detectChanges();
      }).toThrowError(/MatTimepicker can only be registered with one input at a time/);
    });
  });

  describe('opening and closing', () => {
    it('should open the timepicker on click', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.detectChanges();
      getInput(fixture).click();
      fixture.detectChanges();
      expect(getPanel()).toBeTruthy();
    });

    it('should open the timepicker on arrow press', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.detectChanges();
      const event = dispatchKeyboardEvent(getInput(fixture), 'keydown', DOWN_ARROW);
      fixture.detectChanges();
      expect(getPanel()).toBeTruthy();
      expect(event.defaultPrevented).toBe(true);
    });

    it('should not open the timepicker on focus', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.detectChanges();
      getInput(fixture).focus();
      fixture.detectChanges();
      expect(getPanel()).toBeFalsy();
    });

    it('should close the timepicker when clicking outside', fakeAsync(() => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.detectChanges();
      getInput(fixture).click();
      fixture.detectChanges();
      expect(getPanel()).toBeTruthy();
      document.body.click();
      fixture.detectChanges();
      flush();
      expect(getPanel()).toBeFalsy();
    }));

    it('should close the timepicker when tabbing away from the input', fakeAsync(() => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.detectChanges();
      getInput(fixture).click();
      fixture.detectChanges();
      expect(getPanel()).toBeTruthy();
      dispatchKeyboardEvent(getInput(fixture), 'keydown', TAB);
      fixture.detectChanges();
      flush();
      expect(getPanel()).toBeFalsy();
    }));

    it('should close the timepicker when pressing escape', fakeAsync(() => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.detectChanges();
      getInput(fixture).click();
      fixture.detectChanges();
      expect(getPanel()).toBeTruthy();
      const event = dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
      fixture.detectChanges();
      flush();
      expect(getPanel()).toBeFalsy();
      expect(event.defaultPrevented).toBe(true);
    }));

    it('should emit events on open/close', fakeAsync(() => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.detectChanges();
      const {openedSpy, closedSpy} = fixture.componentInstance;
      expect(openedSpy).not.toHaveBeenCalled();
      expect(closedSpy).not.toHaveBeenCalled();

      getInput(fixture).click();
      fixture.detectChanges();
      expect(openedSpy).toHaveBeenCalledTimes(1);
      expect(closedSpy).not.toHaveBeenCalled();

      document.body.click();
      fixture.detectChanges();
      flush();
      expect(openedSpy).toHaveBeenCalledTimes(1);
      expect(closedSpy).toHaveBeenCalledTimes(1);
    }));

    it('should clean up the overlay if it is open on destroy', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.detectChanges();
      getInput(fixture).click();
      fixture.detectChanges();
      expect(getPanel()).toBeTruthy();
      fixture.destroy();
      expect(getPanel()).toBeFalsy();
    });

    it('should be able to open and close the panel programmatically', fakeAsync(() => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.detectChanges();
      fixture.componentInstance.timepicker.open();
      fixture.detectChanges();
      expect(getPanel()).toBeTruthy();
      fixture.componentInstance.timepicker.close();
      fixture.detectChanges();
      flush();
      expect(getPanel()).toBeFalsy();
    }));

    it('should focus the input when opened programmatically', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();
      fixture.componentInstance.timepicker.open();
      fixture.detectChanges();
      expect(input).toBeTruthy();
      expect(document.activeElement).toBe(input);
    });

    it('should expose the current open state', fakeAsync(() => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.detectChanges();
      const timepicker = fixture.componentInstance.timepicker;
      expect(timepicker.isOpen()).toBe(false);
      timepicker.open();
      fixture.detectChanges();
      expect(timepicker.isOpen()).toBe(true);
      timepicker.close();
      fixture.detectChanges();
      flush();
      expect(timepicker.isOpen()).toBe(false);
    }));

    // Note: this will be a type checking error, but we check it just in case for JIT mode.
    it('should do nothing if trying to open a timepicker without an input', fakeAsync(() => {
      const fixture = TestBed.createComponent(TimepickerWithoutInput);
      fixture.detectChanges();
      fixture.componentInstance.timepicker.open();
      fixture.detectChanges();
      expect(getPanel()).toBeFalsy();

      expect(() => {
        fixture.componentInstance.timepicker.close();
        fixture.detectChanges();
        flush();
      }).not.toThrow();
    }));
  });

  // Note: these tests intentionally don't cover the full option generation logic
  // and interval parsing, because they are tested already in `util.spec.ts`.
  describe('panel options behavior', () => {
    it('should set the selected state of the options based on the input value', () => {
      const getStates = () => {
        return getOptions().map(
          o => `${o.textContent} - ${o.classList.contains('mdc-list-item--selected')}`,
        );
      };
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.componentInstance.min.set(createTime(12, 0));
      fixture.componentInstance.max.set(createTime(14, 0));
      fixture.detectChanges();

      // Initial open with pre-entereted value.
      typeInElement(input, '1:30 PM');
      fixture.detectChanges();
      input.click();
      fixture.detectChanges();
      expect(getStates()).toEqual([
        '12:00 PM - false',
        '12:30 PM - false',
        '1:00 PM - false',
        '1:30 PM - true',
        '2:00 PM - false',
      ]);

      // Clear the input while open.
      clearElement(input);
      fixture.detectChanges();
      expect(getStates()).toEqual([
        '12:00 PM - false',
        '12:30 PM - false',
        '1:00 PM - false',
        '1:30 PM - false',
        '2:00 PM - false',
      ]);

      // Type new value while open.
      typeInElement(input, '12:30 PM');
      fixture.detectChanges();
      expect(getStates()).toEqual([
        '12:00 PM - false',
        '12:30 PM - true',
        '1:00 PM - false',
        '1:30 PM - false',
        '2:00 PM - false',
      ]);

      // Type value that doesn't match anything.
      clearElement(input);
      typeInElement(input, '12:34 PM');
      fixture.detectChanges();
      expect(getStates()).toEqual([
        '12:00 PM - false',
        '12:30 PM - false',
        '1:00 PM - false',
        '1:30 PM - false',
        '2:00 PM - false',
      ]);
    });

    it('should take the input min value into account when generating the options', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.min.set(createTime(18, 0));
      fixture.detectChanges();

      getInput(fixture).click();
      fixture.detectChanges();
      expect(getOptions().map(o => o.textContent)).toEqual([
        '6:00 PM',
        '6:30 PM',
        '7:00 PM',
        '7:30 PM',
        '8:00 PM',
        '8:30 PM',
        '9:00 PM',
        '9:30 PM',
        '10:00 PM',
        '10:30 PM',
        '11:00 PM',
        '11:30 PM',
      ]);
    });

    it('should take the input max value into account when generating the options', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.max.set(createTime(4, 0));
      fixture.detectChanges();

      getInput(fixture).click();
      fixture.detectChanges();
      expect(getOptions().map(o => o.textContent)).toEqual([
        '12:00 AM',
        '12:30 AM',
        '1:00 AM',
        '1:30 AM',
        '2:00 AM',
        '2:30 AM',
        '3:00 AM',
        '3:30 AM',
        '4:00 AM',
      ]);
    });

    it('should take the interval into account when generating the options', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.interval.set('3.5h');
      fixture.detectChanges();

      getInput(fixture).click();
      fixture.detectChanges();
      expect(getOptions().map(o => o.textContent)).toEqual([
        '12:00 AM',
        '3:30 AM',
        '7:00 AM',
        '10:30 AM',
        '2:00 PM',
        '5:30 PM',
        '9:00 PM',
      ]);
    });

    it('should be able to pass a custom array of options', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.customOptions.set([
        {label: 'Breakfast', value: createTime(8, 0)},
        {label: 'Lunch', value: createTime(12, 0)},
        {label: 'Dinner', value: createTime(20, 0)},
      ]);
      fixture.detectChanges();

      getInput(fixture).click();
      fixture.detectChanges();
      expect(getOptions().map(o => o.textContent)).toEqual(['Breakfast', 'Lunch', 'Dinner']);
    });

    it('should throw if both an interval and custom options are passed in', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      expect(() => {
        fixture.componentInstance.interval.set('3h');
        fixture.componentInstance.customOptions.set([{label: 'Noon', value: createTime(12, 0)}]);
        fixture.detectChanges();
      }).toThrowError(/Cannot specify both the `options` and `interval` inputs at the same time/);
    });

    it('should throw if an empty array of custom options is passed in', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      expect(() => {
        fixture.componentInstance.customOptions.set([]);
        fixture.detectChanges();
      }).toThrowError(/Value of `options` input cannot be an empty array/);
    });

    it('should interpret an invalid interval as null', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.interval.set('not a valid interval');
      fixture.detectChanges();
      expect(fixture.componentInstance.timepicker.interval()).toBe(null);
    });
  });

  describe('mat-form-field integration', () => {
    it('should open when clicking on the form field', () => {
      const fixture = TestBed.createComponent(TimepickerInFormField);
      fixture.detectChanges();
      fixture.nativeElement.querySelector('mat-form-field').click();
      fixture.detectChanges();
      expect(getPanel()).toBeTruthy();
    });

    it('should default the aria-labelledby of the panel to the form field label', () => {
      const fixture = TestBed.createComponent(TimepickerInFormField);
      fixture.detectChanges();
      getInput(fixture).click();
      fixture.detectChanges();

      const panel = getPanel();
      const labelId = fixture.nativeElement.querySelector('label').getAttribute('id');
      expect(labelId).toBeTruthy();
      expect(panel.getAttribute('aria-labelledby')).toBe(labelId);
    });
  });

  describe('accessibility', () => {
    it('should set the correct roles', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();
      input.click();
      fixture.detectChanges();
      const panel = getPanel();
      const option = panel.querySelector('mat-option') as HTMLElement;

      expect(input.getAttribute('role')).toBe('combobox');
      expect(input.getAttribute('aria-haspopup')).toBe('listbox');
      expect(panel.getAttribute('role')).toBe('listbox');
      expect(option.getAttribute('role')).toBe('option');
    });

    it('should point the aria-controls attribute to the panel while open', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();
      expect(input.hasAttribute('aria-controls')).toBe(false);

      input.click();
      fixture.detectChanges();
      const panelId = getPanel().getAttribute('id');
      expect(panelId).toBeTruthy();
      expect(input.getAttribute('aria-controls')).toBe(panelId);
    });

    it('should set aria-expanded based on whether the panel is open', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();
      expect(input.getAttribute('aria-expanded')).toBe('false');

      input.click();
      fixture.detectChanges();
      expect(input.getAttribute('aria-expanded')).toBe('true');

      document.body.click();
      fixture.detectChanges();
      expect(input.getAttribute('aria-expanded')).toBe('false');
    });

    it('should be able to set aria-label of the panel', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.ariaLabel.set('Pick a time');
      fixture.detectChanges();
      getInput(fixture).click();
      fixture.detectChanges();
      expect(getPanel().getAttribute('aria-label')).toBe('Pick a time');
    });

    it('should be able to set aria-labelledby of the panel', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.ariaLabelledby.set('some-label');
      fixture.detectChanges();
      getInput(fixture).click();
      fixture.detectChanges();
      expect(getPanel().getAttribute('aria-labelledby')).toBe('some-label');
    });

    it('should give precedence to aria-label over aria-labelledby', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.ariaLabel.set('Pick a time');
      fixture.componentInstance.ariaLabelledby.set('some-label');
      fixture.detectChanges();
      getInput(fixture).click();
      fixture.detectChanges();

      const panel = getPanel();
      expect(panel.getAttribute('aria-label')).toBe('Pick a time');
      expect(panel.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('should navigate up/down the list when pressing the arrow keys', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();
      input.click();
      fixture.detectChanges();
      expect(getActiveOptionIndex()).toBe(0);

      // Navigate down
      for (let i = 1; i < 6; i++) {
        const event = dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
        fixture.detectChanges();
        expect(getActiveOptionIndex()).toBe(i);
        expect(event.defaultPrevented).toBe(true);
      }

      // Navigate back up
      for (let i = 4; i > -1; i--) {
        const event = dispatchKeyboardEvent(input, 'keydown', UP_ARROW);
        fixture.detectChanges();
        expect(getActiveOptionIndex()).toBe(i);
        expect(event.defaultPrevented).toBe(true);
      }
    });

    it('should navigate to the first/last options when pressing home/end', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();
      input.click();
      fixture.detectChanges();
      expect(getActiveOptionIndex()).toBe(0);

      let event = dispatchKeyboardEvent(input, 'keydown', END);
      fixture.detectChanges();
      expect(getActiveOptionIndex()).toBe(getOptions().length - 1);
      expect(event.defaultPrevented).toBe(true);

      event = dispatchKeyboardEvent(input, 'keydown', HOME);
      fixture.detectChanges();
      expect(getActiveOptionIndex()).toBe(0);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should navigate up/down the list using page up/down', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();
      input.click();
      fixture.detectChanges();
      expect(getActiveOptionIndex()).toBe(0);

      let event = dispatchKeyboardEvent(input, 'keydown', PAGE_DOWN);
      fixture.detectChanges();
      expect(getActiveOptionIndex()).toBe(10);
      expect(event.defaultPrevented).toBe(true);

      event = dispatchKeyboardEvent(input, 'keydown', PAGE_UP);
      fixture.detectChanges();
      expect(getActiveOptionIndex()).toBe(0);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should select the active option and close when pressing enter', fakeAsync(() => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();
      input.click();
      fixture.detectChanges();

      for (let i = 0; i < 3; i++) {
        dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
        fixture.detectChanges();
      }

      expect(input.value).toBe('');
      expect(fixture.componentInstance.input.value()).toBe(null);
      expect(getPanel()).toBeTruthy();
      expect(getActiveOptionIndex()).toBe(3);
      expect(fixture.componentInstance.selectedSpy).not.toHaveBeenCalled();

      const event = dispatchKeyboardEvent(input, 'keydown', ENTER);
      fixture.detectChanges();
      flush();

      expect(input.value).toBe('1:30 AM');
      expectSameTime(fixture.componentInstance.input.value(), createTime(1, 30));
      expect(getPanel()).toBeFalsy();
      expect(event.defaultPrevented).toBeTrue();
      expect(fixture.componentInstance.selectedSpy).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.selectedSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          source: fixture.componentInstance.timepicker,
          value: jasmine.any(Date),
        }),
      );
    }));

    it('should not navigate using the left/right arrow keys', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();
      input.click();
      fixture.detectChanges();
      expect(getActiveOptionIndex()).toBe(0);

      let event = dispatchKeyboardEvent(input, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();
      expect(event.defaultPrevented).toBe(false);
      expect(getActiveOptionIndex()).toBe(0);

      event = dispatchKeyboardEvent(input, 'keydown', LEFT_ARROW);
      fixture.detectChanges();
      expect(event.defaultPrevented).toBe(false);
      expect(getActiveOptionIndex()).toBe(0);
    });

    it('should set aria-activedescendant to the currently-active option', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const input = getInput(fixture);
      fixture.detectChanges();

      // Initial state
      expect(input.hasAttribute('aria-activedescendant')).toBe(false);

      // Once the panel is opened
      input.click();
      fixture.detectChanges();
      const optionIds = getOptions().map(o => o.getAttribute('id'));
      expect(optionIds.length).toBeGreaterThan(0);
      expect(optionIds.every(o => o != null)).toBe(true);
      expect(input.getAttribute('aria-activedescendant')).toBe(optionIds[0]);

      // Navigate down once
      dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
      fixture.detectChanges();
      expect(input.getAttribute('aria-activedescendant')).toBe(optionIds[1]);

      // Navigate down again
      dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
      fixture.detectChanges();
      expect(input.getAttribute('aria-activedescendant')).toBe(optionIds[2]);

      // Navigate up once
      dispatchKeyboardEvent(input, 'keydown', UP_ARROW);
      fixture.detectChanges();
      expect(input.getAttribute('aria-activedescendant')).toBe(optionIds[1]);

      // Close
      document.body.click();
      fixture.detectChanges();
      expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    });
  });

  describe('forms integration', () => {
    it('should propagate value typed into the input to the form control', () => {
      const fixture = TestBed.createComponent(TimepickerWithForms);
      const input = getInput(fixture);
      const control = fixture.componentInstance.control;
      fixture.detectChanges();
      expect(control.value).toBe(null);
      expect(control.dirty).toBe(false);

      typeInElement(input, '1:37 PM');
      fixture.detectChanges();
      expectSameTime(control.value, createTime(13, 37));
      expect(control.dirty).toBe(true);
      expect(control.touched).toBe(false);

      clearElement(input);
      fixture.detectChanges();
      expect(control.value).toBe(null);
      expect(control.dirty).toBe(true);
    });

    it('should propagate value selected from the panel to the form control', () => {
      const fixture = TestBed.createComponent(TimepickerWithForms);
      const control = fixture.componentInstance.control;
      fixture.detectChanges();
      expect(control.value).toBe(null);
      expect(control.dirty).toBe(false);

      getInput(fixture).click();
      fixture.detectChanges();
      getOptions()[5].click();
      fixture.detectChanges();

      expectSameTime(control.value, createTime(2, 30));
      expect(control.dirty).toBe(true);
    });

    it('should format values assigned to the input through the form control', () => {
      const fixture = TestBed.createComponent(TimepickerWithForms);
      const input = getInput(fixture);
      const control = fixture.componentInstance.control;
      control.setValue(createTime(13, 37));
      fixture.detectChanges();
      expect(input.value).toBe('1:37 PM');

      control.setValue(createTime(12, 15));
      fixture.detectChanges();
      expect(input.value).toBe('12:15 PM');

      control.reset();
      fixture.detectChanges();
      expect(input.value).toBe('');

      control.setValue(createTime(10, 10));
      fixture.detectChanges();
      expect(input.value).toBe('10:10 AM');
    });

    it('should not change the control if the same value is selected from the dropdown', () => {
      const fixture = TestBed.createComponent(TimepickerWithForms);
      const control = fixture.componentInstance.control;
      control.setValue(createTime(2, 30));
      fixture.detectChanges();
      const spy = jasmine.createSpy('valueChanges');
      const subscription = control.valueChanges.subscribe(spy);
      expect(control.dirty).toBe(false);
      expect(spy).not.toHaveBeenCalled();

      getInput(fixture).click();
      fixture.detectChanges();
      getOptions()[5].click();
      fixture.detectChanges();

      expectSameTime(control.value, createTime(2, 30));
      expect(control.dirty).toBe(false);
      expect(spy).not.toHaveBeenCalled();
      subscription.unsubscribe();
    });

    it('should not propagate programmatic changes to the form control', () => {
      const fixture = TestBed.createComponent(TimepickerWithForms);
      const control = fixture.componentInstance.control;
      control.setValue(createTime(13, 37));
      fixture.detectChanges();
      expect(control.dirty).toBe(false);

      fixture.componentInstance.input.value.set(createTime(12, 0));
      fixture.detectChanges();

      expectSameTime(control.value, createTime(13, 37));
      expect(control.dirty).toBe(false);
    });

    it('should mark the control as touched on blur', () => {
      const fixture = TestBed.createComponent(TimepickerWithForms);
      fixture.detectChanges();
      expect(fixture.componentInstance.control.touched).toBe(false);

      getInput(fixture).click();
      fixture.detectChanges();
      dispatchFakeEvent(getInput(fixture), 'blur');
      fixture.detectChanges();
      expect(fixture.componentInstance.control.touched).toBe(false);
    });

    it('should mark the control as touched on blur while dropdown is open', () => {
      const fixture = TestBed.createComponent(TimepickerWithForms);
      fixture.detectChanges();
      expect(fixture.componentInstance.control.touched).toBe(false);

      dispatchFakeEvent(getInput(fixture), 'blur');
      fixture.detectChanges();
      expect(fixture.componentInstance.control.touched).toBe(true);
    });

    it('should mark the control as touched when the panel is closed', fakeAsync(() => {
      const fixture = TestBed.createComponent(TimepickerWithForms);
      fixture.detectChanges();
      expect(fixture.componentInstance.control.touched).toBe(false);

      getInput(fixture).click();
      fixture.detectChanges();
      expect(fixture.componentInstance.control.touched).toBe(false);

      document.body.click();
      fixture.detectChanges();
      flush();
      expect(fixture.componentInstance.control.touched).toBe(true);
    }));

    it('should not set the `required` error if there is no valid value in the input', () => {
      const fixture = TestBed.createComponent(TimepickerWithForms);
      const control = fixture.componentInstance.control;
      const input = getInput(fixture);
      fixture.detectChanges();
      expect(control.errors?.['required']).toBeTruthy();

      typeInElement(input, '10:10 AM');
      fixture.detectChanges();
      expect(control.errors?.['required']).toBeFalsy();

      typeInElement(input, 'not a valid date');
      fixture.detectChanges();
      expect(control.errors?.['required']).toBeFalsy();
    });

    it('should set an error if the user enters an invalid time string', fakeAsync(() => {
      const fixture = TestBed.createComponent(TimepickerWithForms);
      const control = fixture.componentInstance.control;
      const input = getInput(fixture);
      fixture.detectChanges();
      expect(control.errors?.['matTimepickerParse']).toBeFalsy();
      expect(control.value).toBe(null);

      typeInElement(input, '10:10 AM');
      fixture.detectChanges();
      expect(control.errors?.['matTimepickerParse']).toBeFalsy();
      expectSameTime(control.value, createTime(10, 10));

      clearElement(input);
      typeInElement(input, 'not a valid date');
      fixture.detectChanges();
      expect(control.errors?.['matTimepickerParse']).toEqual(
        jasmine.objectContaining({
          text: 'not a valid date',
        }),
      );
      expect(control.value).toBeTruthy();
      expect(adapter.isValid(control.value!)).toBe(false);

      // Change from one invalid value to the other to make sure that the object stays in sync.
      typeInElement(input, ' (changed)');
      fixture.detectChanges();
      expect(control.errors?.['matTimepickerParse']).toEqual(
        jasmine.objectContaining({
          text: 'not a valid date (changed)',
        }),
      );
      expect(control.value).toBeTruthy();
      expect(adapter.isValid(control.value!)).toBe(false);

      clearElement(input);
      fixture.detectChanges();
      expect(control.errors?.['matTimepickerParse']).toBeFalsy();
      expect(control.value).toBe(null);

      typeInElement(input, '12:10 PM');
      fixture.detectChanges();
      expect(control.errors?.['matTimepickerParse']).toBeFalsy();
      expectSameTime(control.value, createTime(12, 10));
    }));

    it('should set an error if the user enters a time earlier than the minimum', fakeAsync(() => {
      const fixture = TestBed.createComponent(TimepickerWithForms);
      const control = fixture.componentInstance.control;
      const input = getInput(fixture);
      fixture.componentInstance.min.set(createTime(12, 0));
      fixture.detectChanges();

      // No value initially so no error either.
      expect(control.errors?.['matTimepickerMin']).toBeFalsy();
      expect(control.value).toBe(null);

      // Entire a value that is before the minimum.
      typeInElement(input, '11:59 AM');
      fixture.detectChanges();
      expect(control.errors?.['matTimepickerMin']).toBeTruthy();
      expectSameTime(control.value, createTime(11, 59));

      // Change the minimum so the value becomes valid.
      fixture.componentInstance.min.set(createTime(11, 0));
      fixture.detectChanges();
      expect(control.errors?.['matTimepickerMin']).toBeFalsy();
    }));

    it('should set an error if the user enters a time later than the maximum', fakeAsync(() => {
      const fixture = TestBed.createComponent(TimepickerWithForms);
      const control = fixture.componentInstance.control;
      const input = getInput(fixture);
      fixture.componentInstance.max.set(createTime(12, 0));
      fixture.detectChanges();

      // No value initially so no error either.
      expect(control.errors?.['matTimepickerMax']).toBeFalsy();
      expect(control.value).toBe(null);

      // Entire a value that is after the maximum.
      typeInElement(input, '12:01 PM');
      fixture.detectChanges();
      expect(control.errors?.['matTimepickerMax']).toBeTruthy();
      expectSameTime(control.value, createTime(12, 1));

      // Change the maximum so the value becomes valid.
      fixture.componentInstance.max.set(createTime(13, 0));
      fixture.detectChanges();
      expect(control.errors?.['matTimepickerMax']).toBeFalsy();
    }));

    it('should mark the input as disabled when the form control is disabled', () => {
      const fixture = TestBed.createComponent(TimepickerWithForms);
      const input = getInput(fixture);
      fixture.detectChanges();
      expect(input.disabled).toBe(false);
      expect(fixture.componentInstance.input.disabled()).toBe(false);

      fixture.componentInstance.control.disable();
      fixture.detectChanges();
      expect(input.disabled).toBe(true);
      expect(fixture.componentInstance.input.disabled()).toBe(true);
    });
  });

  describe('timepicker toggle', () => {
    it('should open the timepicker when clicking the toggle', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.detectChanges();
      expect(getPanel()).toBeFalsy();

      getToggle(fixture).click();
      fixture.detectChanges();
      expect(getPanel()).toBeTruthy();
    });

    it('should set the correct ARIA attributes on the toggle', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const toggle = getToggle(fixture);
      fixture.detectChanges();

      expect(toggle.getAttribute('aria-haspopup')).toBe('listbox');
      expect(toggle.getAttribute('aria-expanded')).toBe('false');

      toggle.click();
      fixture.detectChanges();
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });

    it('should be able to set custom aria-label on the button', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const toggle = getToggle(fixture);
      fixture.detectChanges();
      expect(toggle.hasAttribute('aria-label')).toBe(true);

      fixture.componentInstance.toggleAriaLabel.set('Toggle the timepicker');
      fixture.detectChanges();
      expect(toggle.getAttribute('aria-label')).toBe('Toggle the timepicker');
    });

    it('should be able to set the tabindex on the toggle', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const toggle = getToggle(fixture);
      fixture.detectChanges();
      expect(toggle.getAttribute('tabindex')).toBe('0');

      fixture.componentInstance.toggleTabIndex.set(1);
      fixture.detectChanges();
      expect(toggle.getAttribute('tabindex')).toBe('1');
    });

    it('should be able to set the disabled state on the toggle', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const toggle = getToggle(fixture);
      fixture.detectChanges();
      expect(toggle.disabled).toBe(false);
      expect(toggle.getAttribute('tabindex')).toBe('0');

      fixture.componentInstance.toggleDisabled.set(true);
      fixture.detectChanges();
      expect(toggle.disabled).toBe(true);
      expect(toggle.getAttribute('tabindex')).toBe('-1');
    });

    it('should not open the timepicker on click if the toggle is disabled', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      fixture.componentInstance.toggleDisabled.set(true);
      fixture.detectChanges();
      getToggle(fixture).click();
      fixture.detectChanges();
      expect(getPanel()).toBeFalsy();
    });

    it('should disable the toggle when the timepicker is disabled', () => {
      const fixture = TestBed.createComponent(StandaloneTimepicker);
      const toggle = getToggle(fixture);
      fixture.detectChanges();
      expect(toggle.disabled).toBe(false);
      expect(toggle.getAttribute('tabindex')).toBe('0');

      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      expect(toggle.disabled).toBe(true);
      expect(toggle.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('global defaults', () => {
    beforeEach(() => TestBed.resetTestingModule());

    it('should be able to set the default inverval through DI', () => {
      configureTestingModule([
        {
          provide: MAT_TIMEPICKER_CONFIG,
          useValue: {interval: '9h'},
        },
      ]);

      const fixture = TestBed.createComponent(TimepickerInFormField);
      fixture.detectChanges();
      expect(fixture.componentInstance.timepicker.interval()).toBe(9 * 60 * 60);
    });

    it('should be able to set the default disableRipple value through DI', () => {
      configureTestingModule([
        {
          provide: MAT_TIMEPICKER_CONFIG,
          useValue: {disableRipple: true},
        },
      ]);

      const fixture = TestBed.createComponent(TimepickerInFormField);
      fixture.detectChanges();
      expect(fixture.componentInstance.timepicker.disableRipple()).toBe(true);
      expect(fixture.componentInstance.toggle.disableRipple()).toBe(true);
    });
  });

  function expectSameTime(one: Date | null, two: Date | null): void {
    expect(adapter.sameTime(one, two))
      .withContext(`Expected ${one} to be same time as ${two}`)
      .toBe(true);
  }

  function configureTestingModule(additionalProviders: Provider[] = []): void {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [provideNativeDateAdapter(), ...additionalProviders],
    });
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('en-US');
  }

  function getInput(fixture: ComponentFixture<unknown>): HTMLInputElement {
    return fixture.nativeElement.querySelector('.mat-timepicker-input');
  }

  function getPanel(): HTMLElement {
    return document.querySelector('.mat-timepicker-panel')!;
  }

  function getOptions(): HTMLElement[] {
    const panel = getPanel();
    return panel ? Array.from(panel.querySelectorAll('mat-option')) : [];
  }

  function createTime(hours: number, minutes: number): Date {
    return adapter.setTime(adapter.today(), hours, minutes, 0);
  }

  function getActiveOptionIndex(): number {
    return getOptions().findIndex(o => o.classList.contains('mat-mdc-option-active'));
  }

  function getToggle(fixture: ComponentFixture<unknown>): HTMLButtonElement {
    return fixture.nativeElement.querySelector('mat-timepicker-toggle button');
  }
});

@Component({
  template: `
    <input
      [matTimepicker]="picker"
      [disabled]="disabled()"
      [matTimepickerMin]="min()"
      [matTimepickerMax]="max()"
      [value]="value()"/>
    <mat-timepicker
      #picker
      (opened)="openedSpy()"
      (closed)="closedSpy()"
      (selected)="selectedSpy($event)"
      [interval]="interval()"
      [options]="customOptions()"
      [aria-label]="ariaLabel()"
      [aria-labelledby]="ariaLabelledby()"/>
    <mat-timepicker-toggle
      [for]="picker"
      [aria-label]="toggleAriaLabel()"
      [disabled]="toggleDisabled()"
      [tabIndex]="toggleTabIndex()"/>
  `,
  imports: [MatTimepicker, MatTimepickerInput, MatTimepickerToggle],
})
class StandaloneTimepicker {
  @ViewChild(MatTimepickerInput) input: MatTimepickerInput<Date>;
  @ViewChild(MatTimepicker) timepicker: MatTimepicker<Date>;
  readonly value = signal<Date | null>(null);
  readonly disabled = signal(false);
  readonly interval = signal<string | null>(null);
  readonly min = signal<Date | string | null>(null);
  readonly max = signal<Date | string | null>(null);
  readonly ariaLabel = signal<string | null>(null);
  readonly ariaLabelledby = signal<string | null>(null);
  readonly toggleAriaLabel = signal<string | null>(null);
  readonly toggleDisabled = signal<boolean>(false);
  readonly toggleTabIndex = signal<number>(0);
  readonly customOptions = signal<MatTimepickerOption<Date>[] | null>(null);
  readonly openedSpy = jasmine.createSpy('opened');
  readonly closedSpy = jasmine.createSpy('closed');
  readonly selectedSpy = jasmine.createSpy('selected');
}

@Component({
  template: `
    <mat-form-field>
      <mat-label>Pick a time</mat-label>
      <input matInput [matTimepicker]="picker"/>
      <mat-timepicker #picker/>
      <mat-timepicker-toggle [for]="picker" matSuffix/>
    </mat-form-field>
  `,
  imports: [
    MatTimepicker,
    MatTimepickerInput,
    MatTimepickerToggle,
    MatInput,
    MatLabel,
    MatFormField,
    MatSuffix,
  ],
})
class TimepickerInFormField {
  @ViewChild(MatTimepicker) timepicker: MatTimepicker<Date>;
  @ViewChild(MatTimepickerToggle) toggle: MatTimepickerToggle<Date>;
}

@Component({
  template: `
    <input [matTimepicker]="picker" [(value)]="value"/>
    <mat-timepicker #picker/>
  `,
  imports: [MatTimepicker, MatTimepickerInput],
})
class TimepickerTwoWayBinding {
  @ViewChild(MatTimepickerInput) input: MatTimepickerInput<Date>;
  readonly value = signal(new Date(2024, 0, 15, 10, 30, 0));
}

@Component({
  template: `
    <input
      [formControl]="control"
      [matTimepicker]="picker"
      [matTimepickerMin]="min()"
      [matTimepickerMax]="max()"/>
    <mat-timepicker #picker/>
  `,
  imports: [MatTimepicker, MatTimepickerInput, ReactiveFormsModule],
})
class TimepickerWithForms {
  @ViewChild(MatTimepickerInput) input: MatTimepickerInput<Date>;
  readonly control = new FormControl<Date | null>(null, [Validators.required]);
  readonly min = signal<Date | null>(null);
  readonly max = signal<Date | null>(null);
}

@Component({
  template: `
    <input [matTimepicker]="picker"/>
    <input [matTimepicker]="picker"/>
    <mat-timepicker #picker/>
  `,
  imports: [MatTimepicker, MatTimepickerInput],
})
class TimepickerWithMultipleInputs {}

@Component({
  template: '<mat-timepicker/>',
  imports: [MatTimepicker],
})
class TimepickerWithoutInput {
  @ViewChild(MatTimepicker) timepicker: MatTimepicker<Date>;
}
