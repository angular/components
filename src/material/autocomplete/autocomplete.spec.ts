import {Directionality} from '@angular/cdk/bidi';
import {DOWN_ARROW, ENTER, ESCAPE, SPACE, TAB, UP_ARROW} from '@angular/cdk/keycodes';
import {Overlay, OverlayContainer, OverlayModule} from '@angular/cdk/overlay';
import {_supportsShadowDom} from '@angular/cdk/platform';
import {ScrollDispatcher} from '@angular/cdk/scrolling';
import {
  clearElement,
  createKeyboardEvent,
  dispatchEvent,
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  typeInElement,
} from '@angular/cdk/testing/private';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Provider,
  QueryList,
  Type,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  inject,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatOption, MatOptionSelectionChange} from '@angular/material/core';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {EMPTY, Observable, Subject, Subscription} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {
  MAT_AUTOCOMPLETE_DEFAULT_OPTIONS,
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
  MatAutocomplete,
  MatAutocompleteDefaultOptions,
  MatAutocompleteModule,
  MatAutocompleteOrigin,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  getMatAutocompleteMissingPanelError,
} from './index';

describe('MDC-based MatAutocomplete', () => {
  let overlayContainerElement: HTMLElement;

  // Creates a test component fixture.
  function createComponent<T>(component: Type<T>, providers: Provider[] = []) {
    TestBed.configureTestingModule({
      imports: [
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        OverlayModule,
      ],
      providers,
      declarations: [component],
    });

    TestBed.compileComponents();

    inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainerElement = oc.getContainerElement();
    })();

    return TestBed.createComponent<T>(component);
  }

  describe('panel toggling', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;

    beforeEach(() => {
      fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();
      input = fixture.debugElement.query(By.css('input'))!.nativeElement;
    });

    it('should open the panel when the input is focused', () => {
      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected panel state to start out closed.`)
        .toBe(false);

      dispatchFakeEvent(input, 'focusin');
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected panel state to read open when input is focused.`)
        .toBe(true);
      expect(overlayContainerElement.textContent)
        .withContext(`Expected panel to display when input is focused.`)
        .toContain('Alabama');
      expect(overlayContainerElement.textContent)
        .withContext(`Expected panel to display when input is focused.`)
        .toContain('California');
    });

    it('should not open the panel on focus if the input is readonly', fakeAsync(() => {
      const trigger = fixture.componentInstance.trigger;
      input.readOnly = true;
      fixture.detectChanges();

      expect(trigger.panelOpen)
        .withContext('Expected panel state to start out closed.')
        .toBe(false);
      dispatchFakeEvent(input, 'focusin');
      flush();

      fixture.detectChanges();
      expect(trigger.panelOpen).withContext('Expected panel to stay closed.').toBe(false);
    }));

    it('should not open using the arrow keys when the input is readonly', fakeAsync(() => {
      const trigger = fixture.componentInstance.trigger;
      input.readOnly = true;
      fixture.detectChanges();

      expect(trigger.panelOpen)
        .withContext('Expected panel state to start out closed.')
        .toBe(false);
      dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
      flush();

      fixture.detectChanges();
      expect(trigger.panelOpen).withContext('Expected panel to stay closed.').toBe(false);
    }));

    it('should open the panel programmatically', () => {
      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected panel state to start out closed.`)
        .toBe(false);

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected panel state to read open when opened programmatically.`)
        .toBe(true);
      expect(overlayContainerElement.textContent)
        .withContext(`Expected panel to display when opened programmatically.`)
        .toContain('Alabama');
      expect(overlayContainerElement.textContent)
        .withContext(`Expected panel to display when opened programmatically.`)
        .toContain('California');
    });

    it('should close the panel when the user clicks away', waitForAsync(async () => {
      dispatchFakeEvent(input, 'focusin');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      dispatchFakeEvent(document, 'click');
      await new Promise(r => setTimeout(r));

      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected clicking outside the panel to set its state to closed.`)
        .toBe(false);
      expect(overlayContainerElement.textContent)
        .withContext(`Expected clicking outside the panel to close the panel.`)
        .toEqual('');
    }));

    it('should close the panel when the user clicks away via auxilliary button', waitForAsync(async () => {
      dispatchFakeEvent(input, 'focusin');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      dispatchFakeEvent(document, 'auxclick');
      await new Promise(r => setTimeout(r));

      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected clicking outside the panel to set its state to closed.`)
        .toBe(false);
      expect(overlayContainerElement.textContent)
        .withContext(`Expected clicking outside the panel to close the panel.`)
        .toEqual('');
    }));

    it('should close the panel when the user taps away on a touch device', fakeAsync(() => {
      dispatchFakeEvent(input, 'focus');
      fixture.detectChanges();
      flush();
      dispatchFakeEvent(document, 'touchend');

      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected tapping outside the panel to set its state to closed.`)
        .toBe(false);
      expect(overlayContainerElement.textContent)
        .withContext(`Expected tapping outside the panel to close the panel.`)
        .toEqual('');
    }));

    it('should close the panel when an option is clicked', waitForAsync(async () => {
      dispatchFakeEvent(input, 'focusin');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const option = overlayContainerElement.querySelector('mat-option') as HTMLElement;
      option.click();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected clicking an option to set the panel state to closed.`)
        .toBe(false);
      expect(overlayContainerElement.textContent)
        .withContext(`Expected clicking an option to close the panel.`)
        .toEqual('');
    }));

    it('should close the panel when a newly created option is clicked', waitForAsync(async () => {
      dispatchFakeEvent(input, 'focusin');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      // Filter down the option list to a subset of original options ('Alabama', 'California')
      typeInElement(input, 'al');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      let options = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;
      options[0].click();

      // Changing value from 'Alabama' to 'al' to re-populate the option list,
      // ensuring that 'California' is created new.
      dispatchFakeEvent(input, 'focusin');
      clearElement(input);
      typeInElement(input, 'al');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      options = overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected clicking a new option to set the panel state to closed.`)
        .toBe(false);
      expect(overlayContainerElement.textContent)
        .withContext(`Expected clicking a new option to close the panel.`)
        .toEqual('');
    }));

    it('should close the panel programmatically', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected closing programmatically to set the panel state to closed.`)
        .toBe(false);
      expect(overlayContainerElement.textContent)
        .withContext(`Expected closing programmatically to close the panel.`)
        .toEqual('');
    }));

    it('should not throw when attempting to close the panel of a destroyed autocomplete', () => {
      const trigger = fixture.componentInstance.trigger;

      trigger.openPanel();
      fixture.detectChanges();
      fixture.destroy();

      expect(() => trigger.closePanel()).not.toThrow();
    });

    it('should hide the panel when the options list is empty', fakeAsync(() => {
      dispatchFakeEvent(input, 'focusin');
      fixture.detectChanges();

      const panel = overlayContainerElement.querySelector(
        '.mat-mdc-autocomplete-panel',
      ) as HTMLElement;

      expect(panel.classList)
        .withContext(`Expected panel to start out visible.`)
        .toContain('mat-mdc-autocomplete-visible');

      // Filter down the option list such that no options match the value
      typeInElement(input, 'af');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(panel.classList)
        .withContext(`Expected panel to hide itself when empty.`)
        .toContain('mat-mdc-autocomplete-hidden');
    }));

    it('should keep the label floating until the panel closes', waitForAsync(async () => {
      fixture.componentInstance.trigger.openPanel();
      expect(fixture.componentInstance.formField.floatLabel)
        .withContext('Expected label to float as soon as panel opens.')
        .toEqual('always');

      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      const options = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.formField.floatLabel)
        .withContext('Expected label to return to auto state after panel closes.')
        .toEqual('auto');
    }));

    it('should not open the panel when the `input` event is invoked on a non-focused input', () => {
      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected panel state to start out closed.`)
        .toBe(false);

      input.value = 'Alabama';
      dispatchFakeEvent(input, 'input');
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected panel state to stay closed.`)
        .toBe(false);
    });

    it('should not mess with label placement if set to never', fakeAsync(() => {
      fixture.componentInstance.floatLabel = 'never';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      expect(fixture.componentInstance.formField.floatLabel)
        .withContext('Expected label to stay static.')
        .toEqual('never');
      flush();
      fixture.detectChanges();

      const options = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.formField.floatLabel)
        .withContext('Expected label to stay in static state after close.')
        .toEqual('never');
    }));

    it('should not mess with label placement if set to always', fakeAsync(() => {
      fixture.componentInstance.floatLabel = 'always';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      expect(fixture.componentInstance.formField.floatLabel)
        .withContext('Expected label to stay elevated on open.')
        .toEqual('always');
      flush();
      fixture.detectChanges();

      const options = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.formField.floatLabel)
        .withContext('Expected label to stay elevated after close.')
        .toEqual('always');
    }));

    it('should toggle the visibility when typing and closing the panel', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('.mat-mdc-autocomplete-panel')!.classList)
        .withContext('Expected panel to be visible.')
        .toContain('mat-mdc-autocomplete-visible');

      typeInElement(input, 'x');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('.mat-mdc-autocomplete-panel')!.classList)
        .withContext('Expected panel to be hidden.')
        .toContain('mat-mdc-autocomplete-hidden');

      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      clearElement(input);
      typeInElement(input, 'al');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('.mat-mdc-autocomplete-panel')!.classList)
        .withContext('Expected panel to be visible.')
        .toContain('mat-mdc-autocomplete-visible');
    }));

    it('should animate the label when the input is focused', () => {
      const inputContainer = fixture.componentInstance.formField;

      spyOn(inputContainer, '_animateAndLockLabel');
      expect(inputContainer._animateAndLockLabel).not.toHaveBeenCalled();

      dispatchFakeEvent(fixture.debugElement.query(By.css('input'))!.nativeElement, 'focusin');
      expect(inputContainer._animateAndLockLabel).toHaveBeenCalled();
    });

    it('should provide the open state of the panel', fakeAsync(() => {
      expect(fixture.componentInstance.panel.isOpen).toBeFalsy(
        `Expected the panel to be unopened initially.`,
      );

      dispatchFakeEvent(input, 'focusin');
      fixture.detectChanges();
      flush();

      expect(fixture.componentInstance.panel.isOpen).toBeTruthy(
        `Expected the panel to be opened on focus.`,
      );
    }));

    it('should emit an event when the panel is opened', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      expect(fixture.componentInstance.openedSpy).toHaveBeenCalled();
    });

    it('should not emit the `opened` event when no options are being shown', () => {
      fixture.componentInstance.filteredStates = fixture.componentInstance.states = [];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      expect(fixture.componentInstance.openedSpy).not.toHaveBeenCalled();
    });

    it('should emit the `opened` event if the options come in after the panel is shown', fakeAsync(() => {
      fixture.componentInstance.filteredStates = fixture.componentInstance.states = [];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      expect(fixture.componentInstance.openedSpy).not.toHaveBeenCalled();

      fixture.componentInstance.filteredStates = fixture.componentInstance.states = [
        {name: 'California', code: 'CA'},
      ];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(fixture.componentInstance.openedSpy).toHaveBeenCalled();
    }));

    it('should not emit the opened event multiple times while typing', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      expect(fixture.componentInstance.openedSpy).toHaveBeenCalledTimes(1);

      typeInElement(input, 'Alabam');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(fixture.componentInstance.openedSpy).toHaveBeenCalledTimes(1);
    }));

    it('should emit an event when the panel is closed', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();

      expect(fixture.componentInstance.closedSpy).toHaveBeenCalled();
    });

    it('should not emit the `closed` event when no options were shown', () => {
      fixture.componentInstance.filteredStates = fixture.componentInstance.states = [];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();

      expect(fixture.componentInstance.closedSpy).not.toHaveBeenCalled();
    });

    it('should not be able to open the panel if the autocomplete is disabled', () => {
      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected panel state to start out closed.`)
        .toBe(false);

      fixture.componentInstance.autocompleteDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      dispatchFakeEvent(input, 'focusin');
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected panel to remain closed.`)
        .toBe(false);
    });

    it('should continue to update the model if the autocomplete is disabled', () => {
      fixture.componentInstance.autocompleteDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      typeInElement(input, 'hello');
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.value).toBe('hello');
    });

    it('should set aria-haspopup depending on whether the autocomplete is disabled', () => {
      expect(input.getAttribute('aria-haspopup')).toBe('listbox');

      fixture.componentInstance.autocompleteDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(input.hasAttribute('aria-haspopup')).toBe(false);
    });

    it('should reopen the panel when clicking on the input', fakeAsync(() => {
      const trigger = fixture.componentInstance.trigger;

      input.focus();
      flush();
      fixture.detectChanges();

      expect(document.activeElement).withContext('Expected input to be focused.').toBe(input);
      expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);

      trigger.closePanel();
      fixture.detectChanges();

      expect(document.activeElement)
        .withContext('Expected input to continue to be focused.')
        .toBe(input);
      expect(trigger.panelOpen).withContext('Expected panel to be closed.').toBe(false);

      input.click();
      flush();
      fixture.detectChanges();

      expect(trigger.panelOpen).withContext('Expected panel to reopen on click.').toBe(true);
    }));
  });

  it('should not close the panel when clicking on the input', waitForAsync(async () => {
    const fixture = createComponent(SimpleAutocomplete);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;

    dispatchFakeEvent(input, 'focusin');
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    expect(fixture.componentInstance.trigger.panelOpen)
      .withContext('Expected panel to be opened on focus.')
      .toBe(true);

    input.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.trigger.panelOpen)
      .withContext('Expected panel to remain opened after clicking on the input.')
      .toBe(true);
  }));

  it('should not close the panel when clicking on the input inside shadow DOM', waitForAsync(async () => {
    // This test is only relevant for Shadow DOM-capable browsers.
    if (!_supportsShadowDom()) {
      return;
    }

    const fixture = createComponent(SimpleAutocompleteShadowDom);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;

    dispatchFakeEvent(input, 'focusin');
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    expect(fixture.componentInstance.trigger.panelOpen)
      .withContext('Expected panel to be opened on focus.')
      .toBe(true);

    input.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.trigger.panelOpen)
      .withContext('Expected panel to remain opened after clicking on the input.')
      .toBe(true);
  }));

  it('should have the correct text direction in RTL', () => {
    const rtlFixture = createComponent(SimpleAutocomplete, [
      {provide: Directionality, useFactory: () => ({value: 'rtl', change: EMPTY})},
    ]);

    rtlFixture.detectChanges();
    rtlFixture.componentInstance.trigger.openPanel();
    rtlFixture.detectChanges();

    const boundingBox = overlayContainerElement.querySelector(
      '.cdk-overlay-connected-position-bounding-box',
    )!;
    expect(boundingBox.getAttribute('dir')).toEqual('rtl');
  });

  it('should update the panel direction if it changes for the trigger', () => {
    const dirProvider = {value: 'rtl', change: EMPTY};
    const rtlFixture = createComponent(SimpleAutocomplete, [
      {provide: Directionality, useFactory: () => dirProvider},
    ]);

    rtlFixture.detectChanges();
    rtlFixture.componentInstance.trigger.openPanel();
    rtlFixture.detectChanges();

    let boundingBox = overlayContainerElement.querySelector(
      '.cdk-overlay-connected-position-bounding-box',
    )!;
    expect(boundingBox.getAttribute('dir')).toEqual('rtl');

    rtlFixture.componentInstance.trigger.closePanel();
    rtlFixture.detectChanges();

    dirProvider.value = 'ltr';
    rtlFixture.componentInstance.trigger.openPanel();
    rtlFixture.detectChanges();

    boundingBox = overlayContainerElement.querySelector(
      '.cdk-overlay-connected-position-bounding-box',
    )!;
    expect(boundingBox.getAttribute('dir')).toEqual('ltr');
  });

  it('should be able to set a custom value for the `autocomplete` attribute', () => {
    const fixture = createComponent(AutocompleteWithNativeAutocompleteAttribute);
    const input = fixture.nativeElement.querySelector('input');

    fixture.detectChanges();

    expect(input.getAttribute('autocomplete')).toBe('changed');
  });

  it('should not throw when typing in an element with a null and disabled autocomplete', () => {
    const fixture = createComponent(InputWithoutAutocompleteAndDisabled);
    fixture.detectChanges();

    expect(() => {
      dispatchKeyboardEvent(fixture.nativeElement.querySelector('input'), 'keydown', SPACE);
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should clear the selected option if it no longer matches the input text while typing', waitForAsync(async () => {
    const fixture = createComponent(SimpleAutocomplete);
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    fixture.componentInstance.trigger.openPanel();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    // Select an option and reopen the panel.
    (overlayContainerElement.querySelector('mat-option') as HTMLElement).click();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));
    fixture.detectChanges();
    fixture.componentInstance.trigger.openPanel();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    expect(fixture.componentInstance.options.first.selected).toBe(true);

    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;
    input.value = '';
    typeInElement(input, 'Ala');
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    expect(fixture.componentInstance.options.first.selected).toBe(false);
  }));

  it('should not clear the selected option if it no longer matches the input text while typing with requireSelection', waitForAsync(async () => {
    const fixture = createComponent(SimpleAutocomplete);
    fixture.componentInstance.requireSelection = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    fixture.componentInstance.trigger.openPanel();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    // Select an option and reopen the panel.
    (overlayContainerElement.querySelector('mat-option') as HTMLElement).click();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));
    fixture.detectChanges();
    fixture.componentInstance.trigger.openPanel();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    expect(fixture.componentInstance.options.first.selected).toBe(true);

    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;
    input.value = '';
    typeInElement(input, 'Ala');
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    expect(fixture.componentInstance.options.first.selected).toBe(true);
  }));

  describe('forms integration', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;

    beforeEach(() => {
      fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      input = fixture.debugElement.query(By.css('input'))!.nativeElement;
    });

    it('should update control value as user types with input value', waitForAsync(async () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      typeInElement(input, 'a');
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.value)
        .withContext('Expected control value to be updated as user types.')
        .toEqual('a');

      typeInElement(input, 'l');
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.value)
        .withContext('Expected control value to be updated as user types.')
        .toEqual('al');
    }));

    it('should update control value when autofilling', () => {
      // Simulate the browser autofilling the input by setting a value and
      // dispatching an `input` event while the input is out of focus.
      expect(document.activeElement).not.toBe(input, 'Expected input not to have focus.');
      input.value = 'Alabama';
      dispatchFakeEvent(input, 'input');
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.value)
        .withContext('Expected value to be propagated to the form control.')
        .toBe('Alabama');
    });

    it('should update control value when option is selected with option value', waitForAsync(async () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const options = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.value)
        .withContext('Expected control value to equal the selected option value.')
        .toEqual({code: 'CA', name: 'California'});
    }));

    it('should update the control back to a string if user types after an option is selected', waitForAsync(async () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const options = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      clearElement(input);
      typeInElement(input, 'Californi');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(fixture.componentInstance.stateCtrl.value)
        .withContext('Expected control value to revert back to string.')
        .toEqual('Californi');
    }));

    it('should fill the text field with display value when an option is selected', waitForAsync(async () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const options = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(input.value)
        .withContext(`Expected text field to fill with selected value.`)
        .toContain('California');
    }));

    it('should fill the text field with value if displayWith is not set', waitForAsync(async () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      fixture.componentInstance.panel.displayWith = null;
      fixture.componentInstance.options.toArray()[1].value = 'test value';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      const options = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;
      options[1].click();

      fixture.detectChanges();
      expect(input.value)
        .withContext(`Expected input to fall back to selected option's value.`)
        .toContain('test value');
    }));

    it('should fill the text field correctly if value is set to obj programmatically', fakeAsync(() => {
      fixture.componentInstance.stateCtrl.setValue({code: 'AL', name: 'Alabama'});
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(input.value)
        .withContext(`Expected input to fill with matching option's viewValue.`)
        .toContain('Alabama');
    }));

    it('should clear the text field if value is reset programmatically', fakeAsync(() => {
      typeInElement(input, 'Alabama');
      fixture.detectChanges();
      tick();

      fixture.componentInstance.stateCtrl.reset();
      tick();

      fixture.detectChanges();
      tick();

      expect(input.value).withContext(`Expected input value to be empty after reset.`).toEqual('');
    }));

    it('should clear the previous selection when reactive form field is reset programmatically', waitForAsync(async () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const options = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;
      const clickedOption = options[0];
      const option = fixture.componentInstance.options.first;

      clickedOption.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.value).toEqual({code: 'AL', name: 'Alabama'});
      expect(option.selected).toBe(true);

      fixture.componentInstance.stateCtrl.reset();
      await new Promise(r => setTimeout(r));

      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(fixture.componentInstance.stateCtrl.value).toEqual(null);
      expect(option.selected).toBe(false);
    }));

    it('should disable input in view when disabled programmatically', () => {
      const formFieldElement = fixture.debugElement.query(
        By.css('.mat-mdc-form-field'),
      )!.nativeElement;

      expect(input.disabled)
        .withContext(`Expected input to start out enabled in view.`)
        .toBe(false);
      expect(formFieldElement.classList.contains('mat-form-field-disabled'))
        .withContext(`Expected input underline to start out with normal styles.`)
        .toBe(false);

      fixture.componentInstance.stateCtrl.disable();
      fixture.detectChanges();

      expect(input.disabled)
        .withContext(`Expected input to be disabled in view when disabled programmatically.`)
        .toBe(true);
      expect(formFieldElement.classList.contains('mat-form-field-disabled'))
        .withContext(`Expected input underline to display disabled styles.`)
        .toBe(true);
    });

    it('should mark the autocomplete control as dirty as user types', () => {
      expect(fixture.componentInstance.stateCtrl.dirty)
        .withContext(`Expected control to start out pristine.`)
        .toBe(false);

      typeInElement(input, 'a');
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.dirty)
        .withContext(`Expected control to become dirty when the user types into the input.`)
        .toBe(true);
    });

    it('should mark the autocomplete control as dirty when an option is selected', waitForAsync(async () => {
      expect(fixture.componentInstance.stateCtrl.dirty)
        .withContext(`Expected control to start out pristine.`)
        .toBe(false);

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const options = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.dirty)
        .withContext(`Expected control to become dirty when an option was selected.`)
        .toBe(true);
    }));

    it('should not mark the control dirty when the value is set programmatically', () => {
      expect(fixture.componentInstance.stateCtrl.dirty)
        .withContext(`Expected control to start out pristine.`)
        .toBe(false);

      fixture.componentInstance.stateCtrl.setValue('AL');
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.dirty)
        .withContext(`Expected control to stay pristine if value is set programmatically.`)
        .toBe(false);
    });

    it('should mark the autocomplete control as touched on blur', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      expect(fixture.componentInstance.stateCtrl.touched)
        .withContext(`Expected control to start out untouched.`)
        .toBe(false);

      dispatchFakeEvent(input, 'blur');
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.touched)
        .withContext(`Expected control to become touched on blur.`)
        .toBe(true);
    });

    it('should disable the input when used with a value accessor and without `matInput`', () => {
      fixture.destroy();
      TestBed.resetTestingModule();

      const plainFixture = createComponent(PlainAutocompleteInputWithFormControl);
      plainFixture.detectChanges();
      input = plainFixture.nativeElement.querySelector('input');

      expect(input.disabled).toBe(false);

      plainFixture.componentInstance.formControl.disable();
      plainFixture.detectChanges();

      expect(input.disabled).toBe(true);
    });
  });

  describe('with theming', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;

    beforeEach(() => {
      fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();
    });

    it('should transfer the theme to the autocomplete panel', () => {
      fixture.componentInstance.theme = 'warn';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panel = overlayContainerElement.querySelector(
        '.mat-mdc-autocomplete-panel',
      )! as HTMLElement;
      expect(panel.classList).toContain('mat-warn');
    });
  });

  describe('keyboard events', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;
    let DOWN_ARROW_EVENT: KeyboardEvent;
    let UP_ARROW_EVENT: KeyboardEvent;
    let ENTER_EVENT: KeyboardEvent;

    beforeEach(waitForAsync(async () => {
      fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      input = fixture.debugElement.query(By.css('input'))!.nativeElement;
      DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
      UP_ARROW_EVENT = createKeyboardEvent('keydown', UP_ARROW);
      ENTER_EVENT = createKeyboardEvent('keydown', ENTER);

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
    }));

    it('should not focus the option when DOWN key is pressed', () => {
      spyOn(fixture.componentInstance.options.first, 'focus');

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      expect(fixture.componentInstance.options.first.focus).not.toHaveBeenCalled();
    });

    it('should not close the panel when DOWN key is pressed', () => {
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);

      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected panel state to stay open when DOWN key is pressed.`)
        .toBe(true);
      expect(overlayContainerElement.textContent)
        .withContext(`Expected panel to keep displaying when DOWN key is pressed.`)
        .toContain('Alabama');
      expect(overlayContainerElement.textContent)
        .withContext(`Expected panel to keep displaying when DOWN key is pressed.`)
        .toContain('California');
    });

    it('should set the active item to the first option when DOWN key is pressed', () => {
      const componentInstance = fixture.componentInstance;
      const optionEls = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;

      expect(componentInstance.trigger.panelOpen)
        .withContext('Expected first down press to open the pane.')
        .toBe(true);

      componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      expect(componentInstance.trigger.activeOption === componentInstance.options.first)
        .withContext('Expected first option to be active.')
        .toBe(true);
      expect(optionEls[0].classList).toContain('mat-mdc-option-active');
      expect(optionEls[1].classList).not.toContain('mat-mdc-option-active');

      componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      expect(componentInstance.trigger.activeOption === componentInstance.options.toArray()[1])
        .withContext('Expected second option to be active.')
        .toBe(true);
      expect(optionEls[0].classList).not.toContain('mat-mdc-option-active');
      expect(optionEls[1].classList).toContain('mat-mdc-option-active');
    });

    it('should set the active item to the last option when UP key is pressed', () => {
      const componentInstance = fixture.componentInstance;
      const optionEls = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;

      expect(componentInstance.trigger.panelOpen)
        .withContext('Expected first up press to open the pane.')
        .toBe(true);

      componentInstance.trigger._handleKeydown(UP_ARROW_EVENT);
      fixture.detectChanges();

      expect(componentInstance.trigger.activeOption === componentInstance.options.last)
        .withContext('Expected last option to be active.')
        .toBe(true);
      expect(optionEls[10].classList).toContain('mat-mdc-option-active');
      expect(optionEls[0].classList).not.toContain('mat-mdc-option-active');

      componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      expect(componentInstance.trigger.activeOption === componentInstance.options.first)
        .withContext('Expected first option to be active.')
        .toBe(true);
      expect(optionEls[0].classList).toContain('mat-mdc-option-active');
    });

    it('should set the active item properly after filtering', fakeAsync(() => {
      const componentInstance = fixture.componentInstance;

      componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();
    }));

    it('should set the active item properly after filtering', () => {
      const componentInstance = fixture.componentInstance;

      typeInElement(input, 'o');
      fixture.detectChanges();

      componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      const optionEls = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;

      expect(componentInstance.trigger.activeOption === componentInstance.options.first)
        .withContext('Expected first option to be active.')
        .toBe(true);
      expect(optionEls[0].classList).toContain('mat-mdc-option-active');
      expect(optionEls[1].classList).not.toContain('mat-mdc-option-active');
    });

    it('should fill the text field when an option is selected with ENTER', fakeAsync(() => {
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      flush();
      fixture.detectChanges();

      fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);
      fixture.detectChanges();
      expect(input.value)
        .withContext(`Expected text field to fill with selected value on ENTER.`)
        .toContain('Alabama');
    }));

    it('should prevent the default enter key action', fakeAsync(() => {
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      flush();

      fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);

      expect(ENTER_EVENT.defaultPrevented)
        .withContext('Expected the default action to have been prevented.')
        .toBe(true);
    }));

    it('should not prevent the default enter action for a closed panel after a user action', () => {
      fixture.componentInstance.trigger._handleKeydown(UP_ARROW_EVENT);
      fixture.detectChanges();

      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();
      fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);

      expect(ENTER_EVENT.defaultPrevented)
        .withContext('Default action should not be prevented.')
        .toBe(false);
    });

    it('should not interfere with the ENTER key when pressing a modifier', fakeAsync(() => {
      const trigger = fixture.componentInstance.trigger;

      expect(input.value).withContext('Expected input to start off blank.').toBeFalsy();
      expect(trigger.panelOpen).withContext('Expected panel to start off open.').toBe(true);

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      flush();
      fixture.detectChanges();

      Object.defineProperty(ENTER_EVENT, 'altKey', {get: () => true});
      fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);
      fixture.detectChanges();

      expect(trigger.panelOpen).withContext('Expected panel to remain open.').toBe(true);
      expect(input.value).withContext('Expected input to remain blank.').toBeFalsy();
      expect(ENTER_EVENT.defaultPrevented)
        .withContext('Expected the default ENTER action not to have been prevented.')
        .toBe(false);
    }));

    it('should fill the text field, not select an option, when SPACE is entered', () => {
      typeInElement(input, 'New');
      fixture.detectChanges();

      const SPACE_EVENT = createKeyboardEvent('keydown', SPACE);
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      fixture.componentInstance.trigger._handleKeydown(SPACE_EVENT);
      fixture.detectChanges();

      expect(input.value)
        .not.withContext(`Expected option not to be selected on SPACE.`)
        .toContain('New York');
    });

    it('should mark the control dirty when selecting an option from the keyboard', fakeAsync(() => {
      expect(fixture.componentInstance.stateCtrl.dirty)
        .withContext(`Expected control to start out pristine.`)
        .toBe(false);

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      flush();
      fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);
      fixture.detectChanges();

      expect(fixture.componentInstance.stateCtrl.dirty)
        .withContext(`Expected control to become dirty when option was selected by ENTER.`)
        .toBe(true);
    }));

    it('should open the panel again when typing after making a selection', fakeAsync(() => {
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      flush();
      fixture.componentInstance.trigger._handleKeydown(ENTER_EVENT);
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected panel state to read closed after ENTER key.`)
        .toBe(false);
      expect(overlayContainerElement.textContent)
        .withContext(`Expected panel to close after ENTER key.`)
        .toEqual('');

      dispatchFakeEvent(input, 'focusin');
      clearElement(input);
      typeInElement(input, 'Alabama');
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected panel state to read open when typing in input.`)
        .toBe(true);
      expect(overlayContainerElement.textContent)
        .withContext(`Expected panel to display when typing in input.`)
        .toContain('Alabama');
    }));

    it('should not open the panel if the `input` event was dispatched with changing the value', fakeAsync(() => {
      const trigger = fixture.componentInstance.trigger;

      dispatchFakeEvent(input, 'focusin');
      typeInElement(input, 'A');
      fixture.detectChanges();
      tick();

      expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);

      trigger.closePanel();
      fixture.detectChanges();

      expect(trigger.panelOpen).withContext('Expected panel to be closed.').toBe(false);

      // Dispatch the event without actually changing the value
      // to simulate what happen in some cases on IE.
      dispatchFakeEvent(input, 'input');
      fixture.detectChanges();
      tick();

      expect(trigger.panelOpen).withContext('Expected panel to stay closed.').toBe(false);
    }));

    it('should scroll to active options below the fold', () => {
      const trigger = fixture.componentInstance.trigger;
      const scrollContainer = document.querySelector(
        '.cdk-overlay-pane .mat-mdc-autocomplete-panel',
      )!;

      trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();
      expect(scrollContainer.scrollTop).withContext(`Expected panel not to scroll.`).toEqual(0);

      // These down arrows will set the 6th option active, below the fold.
      [1, 2, 3, 4, 5].forEach(() => trigger._handleKeydown(DOWN_ARROW_EVENT));

      // Expect option bottom minus the panel height plus padding (288 - 256 + 8 = 40)
      // Expect option bottom minus the panel height plus padding (288 - 256 + 8 = 40)
      expect(scrollContainer.scrollTop)
        .withContext(`Expected panel to reveal the sixth option.`)
        .toEqual(40);
    });

    it('should scroll to active options below if the option height is variable', () => {
      // Make every other option a bit taller than the base of 48.
      fixture.componentInstance.states.forEach((state, index) => {
        if (index % 2 === 0) {
          state.height = 64;
        }
      });
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      const trigger = fixture.componentInstance.trigger;
      const scrollContainer = document.querySelector(
        '.cdk-overlay-pane .mat-mdc-autocomplete-panel',
      )!;

      trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();
      expect(scrollContainer.scrollTop).withContext(`Expected panel not to scroll.`).toEqual(0);

      // These down arrows will set the 6th option active, below the fold.
      [1, 2, 3, 4, 5].forEach(() => trigger._handleKeydown(DOWN_ARROW_EVENT));

      // Expect option bottom minus the panel height (336 - 256 + 8 = 88)
      // Expect option bottom minus the panel height (336 - 256 + 8 = 88)
      expect(scrollContainer.scrollTop)
        .withContext(`Expected panel to reveal the sixth option.`)
        .toEqual(88);
    });

    it('should scroll to active options on UP arrow', () => {
      const scrollContainer = document.querySelector(
        '.cdk-overlay-pane .mat-mdc-autocomplete-panel',
      )!;
      const initialScrollTop = scrollContainer.scrollTop;

      fixture.componentInstance.trigger._handleKeydown(UP_ARROW_EVENT);
      fixture.detectChanges();

      expect(scrollContainer.scrollTop)
        .withContext(`Expected panel to reveal last option.`)
        .toBeGreaterThan(initialScrollTop);
    });

    it('should not scroll to active options that are fully in the panel', () => {
      const trigger = fixture.componentInstance.trigger;
      const scrollContainer = document.querySelector(
        '.cdk-overlay-pane .mat-mdc-autocomplete-panel',
      )!;

      trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      expect(scrollContainer.scrollTop).withContext(`Expected panel not to scroll.`).toEqual(0);

      // These down arrows will set the 6th option active, below the fold.
      [1, 2, 3, 4, 5].forEach(() => trigger._handleKeydown(DOWN_ARROW_EVENT));

      // Expect option bottom minus the panel height plus the padding (288 - 256 + 8 = 40)
      // Expect option bottom minus the panel height plus the padding (288 - 256 + 8 = 40)
      expect(scrollContainer.scrollTop)
        .withContext(`Expected panel to reveal the sixth option.`)
        .toEqual(40);

      // These up arrows will set the 2nd option active
      [4, 3, 2, 1].forEach(() => trigger._handleKeydown(UP_ARROW_EVENT));

      // Expect no scrolling to have occurred. Still showing bottom of 6th option.
      // Expect no scrolling to have occurred. Still showing bottom of 6th option.
      expect(scrollContainer.scrollTop)
        .withContext(`Expected panel not to scroll up since sixth option still fully visible.`)
        .toEqual(40);
    });

    it('should scroll to active options that are above the panel', () => {
      const trigger = fixture.componentInstance.trigger;
      const scrollContainer = document.querySelector(
        '.cdk-overlay-pane .mat-mdc-autocomplete-panel',
      )!;

      trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      expect(scrollContainer.scrollTop).withContext(`Expected panel not to scroll.`).toEqual(0);

      // These down arrows will set the 7th option active, below the fold.
      [1, 2, 3, 4, 5, 6].forEach(() => trigger._handleKeydown(DOWN_ARROW_EVENT));

      // These up arrows will set the 2nd option active
      [5, 4, 3, 2, 1].forEach(() => trigger._handleKeydown(UP_ARROW_EVENT));

      // Expect to show the top of the 2nd option at the top of the panel
      // Expect to show the top of the 2nd option at the top of the panel
      expect(scrollContainer.scrollTop)
        .withContext(`Expected panel to scroll up when option is above panel.`)
        .toEqual(56);
    });

    it('should close the panel when pressing escape', fakeAsync(() => {
      const trigger = fixture.componentInstance.trigger;

      input.focus();
      flush();
      fixture.detectChanges();

      expect(document.activeElement).withContext('Expected input to be focused.').toBe(input);
      expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);

      dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
      fixture.detectChanges();

      expect(document.activeElement)
        .withContext('Expected input to continue to be focused.')
        .toBe(input);
      expect(trigger.panelOpen).withContext('Expected panel to be closed.').toBe(false);
    }));

    it('should prevent the default action when pressing escape', fakeAsync(() => {
      const escapeEvent = dispatchKeyboardEvent(input, 'keydown', ESCAPE);
      fixture.detectChanges();

      expect(escapeEvent.defaultPrevented).toBe(true);
    }));

    it('should not close the panel when pressing escape with a modifier', fakeAsync(() => {
      const trigger = fixture.componentInstance.trigger;

      input.focus();
      flush();
      fixture.detectChanges();

      expect(document.activeElement).withContext('Expected input to be focused.').toBe(input);
      expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);

      const event = dispatchKeyboardEvent(document.body, 'keydown', ESCAPE, undefined, {alt: true});
      fixture.detectChanges();

      expect(document.activeElement)
        .withContext('Expected input to continue to be focused.')
        .toBe(input);
      expect(trigger.panelOpen).withContext('Expected panel to stay open.').toBe(true);
      expect(event.defaultPrevented)
        .withContext('Expected default action not to be prevented.')
        .toBe(false);
    }));

    it('should close the panel when pressing ALT + UP_ARROW', fakeAsync(() => {
      const trigger = fixture.componentInstance.trigger;
      const upArrowEvent = createKeyboardEvent('keydown', UP_ARROW, undefined, {alt: true});
      spyOn(upArrowEvent, 'stopPropagation').and.callThrough();

      input.focus();
      flush();
      fixture.detectChanges();

      expect(document.activeElement).withContext('Expected input to be focused.').toBe(input);
      expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);

      dispatchEvent(document.body, upArrowEvent);
      fixture.detectChanges();

      expect(document.activeElement)
        .withContext('Expected input to continue to be focused.')
        .toBe(input);
      expect(trigger.panelOpen).withContext('Expected panel to be closed.').toBe(false);
      expect(upArrowEvent.stopPropagation).toHaveBeenCalled();
    }));

    it('should close the panel when tabbing away from a trigger without results', fakeAsync(() => {
      fixture.componentInstance.states = [];
      fixture.componentInstance.filteredStates = [];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      input.focus();
      flush();

      expect(overlayContainerElement.querySelector('.mat-mdc-autocomplete-panel'))
        .withContext('Expected panel to be rendered.')
        .toBeTruthy();

      dispatchKeyboardEvent(input, 'keydown', TAB);
      fixture.detectChanges();
      tick();

      expect(overlayContainerElement.querySelector('.mat-mdc-autocomplete-panel'))
        .withContext('Expected panel to be removed.')
        .toBeFalsy();
    }));

    it('should not close when a click event occurs on the outside while the panel has focus', fakeAsync(() => {
      const trigger = fixture.componentInstance.trigger;

      input.focus();
      flush();
      fixture.detectChanges();

      expect(document.activeElement).toBe(input, 'Expected input to be focused.');
      expect(trigger.panelOpen).toBe(true, 'Expected panel to be open.');

      dispatchMouseEvent(document.body, 'click');
      fixture.detectChanges();

      expect(document.activeElement).toBe(input, 'Expected input to continue to be focused.');
      expect(trigger.panelOpen).toBe(true, 'Expected panel to stay open.');
    }));

    it('should reset the active option when closing with the escape key', fakeAsync(() => {
      const trigger = fixture.componentInstance.trigger;

      trigger.openPanel();
      fixture.detectChanges();
      tick();

      expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);
      expect(!!trigger.activeOption).withContext('Expected no active option.').toBe(false);

      // Press the down arrow a few times.
      [1, 2, 3].forEach(() => {
        trigger._handleKeydown(DOWN_ARROW_EVENT);
        tick();
        fixture.detectChanges();
      });

      // Note that this casts to a boolean, in order to prevent Jasmine
      // from crashing when trying to stringify the option if the test fails.
      // Note that this casts to a boolean, in order to prevent Jasmine
      // from crashing when trying to stringify the option if the test fails.
      expect(!!trigger.activeOption).withContext('Expected to find an active option.').toBe(true);

      dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
      tick();

      expect(!!trigger.activeOption).withContext('Expected no active options.').toBe(false);
    }));

    it('should reset the active option when closing by selecting with enter', fakeAsync(() => {
      const trigger = fixture.componentInstance.trigger;

      trigger.openPanel();
      fixture.detectChanges();
      tick();

      expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);
      expect(!!trigger.activeOption).withContext('Expected no active option.').toBe(false);

      // Press the down arrow a few times.
      [1, 2, 3].forEach(() => {
        trigger._handleKeydown(DOWN_ARROW_EVENT);
        tick();
        fixture.detectChanges();
      });

      // Note that this casts to a boolean, in order to prevent Jasmine
      // from crashing when trying to stringify the option if the test fails.
      // Note that this casts to a boolean, in order to prevent Jasmine
      // from crashing when trying to stringify the option if the test fails.
      expect(!!trigger.activeOption).withContext('Expected to find an active option.').toBe(true);

      trigger._handleKeydown(ENTER_EVENT);
      tick();

      expect(!!trigger.activeOption).withContext('Expected no active options.').toBe(false);
    }));

    it('should not prevent the default action when a modifier key is pressed', () => {
      ['metaKey', 'ctrlKey', 'altKey', 'shiftKey'].forEach(name => {
        const event = createKeyboardEvent('keydown', DOWN_ARROW);
        Object.defineProperty(event, name, {get: () => true});

        fixture.componentInstance.trigger._handleKeydown(event);
        fixture.detectChanges();

        expect(event.defaultPrevented)
          .withContext(`Expected autocompete not to block ${name} key`)
          .toBe(false);
      });
    });
  });

  describe('option groups', () => {
    let DOWN_ARROW_EVENT: KeyboardEvent;
    let UP_ARROW_EVENT: KeyboardEvent;

    beforeEach(() => {
      DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
      UP_ARROW_EVENT = createKeyboardEvent('keydown', UP_ARROW);
    });

    it('should scroll to active options below the fold', waitForAsync(async () => {
      const fixture = createComponent(AutocompleteWithGroups);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();
      const container = document.querySelector('.mat-mdc-autocomplete-panel') as HTMLElement;

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();
      expect(container.scrollTop).withContext('Expected the panel not to scroll.').toBe(0);

      // Press the down arrow five times.
      for (const _unused of [1, 2, 3, 4, 5]) {
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        await new Promise(r => setTimeout(r));
      }

      // <option bottom> - <panel height> + <2x group labels> + panel padding = 136
      // 288 - 256 + 96 + 8 = 128
      // <option bottom> - <panel height> + <2x group labels> + panel padding = 136
      // 288 - 256 + 96 + 8 = 128
      expect(container.scrollTop)
        .withContext('Expected panel to reveal the sixth option.')
        .toBe(136);
    }));

    it('should scroll to active options on UP arrow', waitForAsync(async () => {
      const fixture = createComponent(AutocompleteWithGroups);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();
      const container = document.querySelector('.mat-mdc-autocomplete-panel') as HTMLElement;

      fixture.componentInstance.trigger._handleKeydown(UP_ARROW_EVENT);
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      // <option bottom> - <panel height> + <3x group label> + panel padding = 472
      // 576 - 256 + 144 + 8 = 472
      // <option bottom> - <panel height> + <3x group label> + panel padding = 472
      // 576 - 256 + 144 + 8 = 472
      expect(container.scrollTop).withContext('Expected panel to reveal last option.').toBe(472);
    }));

    it('should scroll to active options that are above the panel', fakeAsync(() => {
      const fixture = createComponent(AutocompleteWithGroups);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const container = document.querySelector('.mat-mdc-autocomplete-panel') as HTMLElement;

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();
      expect(container.scrollTop).withContext('Expected panel not to scroll.').toBe(0);

      // These down arrows will set the 7th option active, below the fold.
      [1, 2, 3, 4, 5, 6].forEach(() => {
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        tick();
      });

      // These up arrows will set the 2nd option active
      [5, 4, 3, 2, 1].forEach(() => {
        fixture.componentInstance.trigger._handleKeydown(UP_ARROW_EVENT);
        tick();
      });

      // Expect to show the top of the 2nd option at the top of the panel.
      // It is offset by 56, because there's a group label above it plus the panel padding.
      // Expect to show the top of the 2nd option at the top of the panel.
      // It is offset by 56, because there's a group label above it plus the panel padding.
      expect(container.scrollTop)
        .withContext('Expected panel to scroll up when option is above panel.')
        .toBe(104);
    }));

    it('should scroll back to the top when reaching the first option with preceding group label', fakeAsync(() => {
      const fixture = createComponent(AutocompleteWithGroups);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const container = document.querySelector('.mat-mdc-autocomplete-panel') as HTMLElement;

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();
      expect(container.scrollTop).withContext('Expected the panel not to scroll.').toBe(0);

      // Press the down arrow five times.
      [1, 2, 3, 4, 5].forEach(() => {
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        tick();
      });

      // Press the up arrow five times.
      [1, 2, 3, 4, 5].forEach(() => {
        fixture.componentInstance.trigger._handleKeydown(UP_ARROW_EVENT);
        tick();
      });

      expect(container.scrollTop).withContext('Expected panel to be scrolled to the top.').toBe(0);
    }));

    it('should scroll to active option when group is indirect descendant', waitForAsync(async () => {
      const fixture = createComponent(AutocompleteWithIndirectGroups);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();
      const container = document.querySelector('.mat-mdc-autocomplete-panel') as HTMLElement;

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();
      expect(container.scrollTop).withContext('Expected the panel not to scroll.').toBe(0);

      // Press the down arrow five times.
      for (const _unused of [1, 2, 3, 4, 5]) {
        fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
        await new Promise(r => setTimeout(r));
      }

      // <option bottom> - <panel height> + <2x group labels> + panel padding = 128
      // 288 - 256 + 96 + 8 = 136
      // <option bottom> - <panel height> + <2x group labels> + panel padding = 128
      // 288 - 256 + 96 + 8 = 136
      expect(container.scrollTop)
        .withContext('Expected panel to reveal the sixth option.')
        .toBe(136);
    }));
  });

  describe('aria', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;

    beforeEach(() => {
      fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      input = fixture.debugElement.query(By.css('input'))!.nativeElement;
    });

    it('should set role of input to combobox', () => {
      expect(input.getAttribute('role'))
        .withContext('Expected role of input to be combobox.')
        .toEqual('combobox');
    });

    it('should set role of autocomplete panel to listbox', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panel = fixture.debugElement.query(
        By.css('.mat-mdc-autocomplete-panel'),
      )!.nativeElement;

      expect(panel.getAttribute('role'))
        .withContext('Expected role of the panel to be listbox.')
        .toEqual('listbox');
    });

    it('should point the aria-labelledby of the panel to the field label', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panel = fixture.debugElement.query(
        By.css('.mat-mdc-autocomplete-panel'),
      )!.nativeElement;
      const labelId = fixture.nativeElement.querySelector('label').id;
      expect(panel.getAttribute('aria-labelledby')).toBe(labelId);
      expect(panel.hasAttribute('aria-label')).toBe(false);
    });

    it('should add a custom aria-labelledby to the panel', () => {
      fixture.componentInstance.ariaLabelledby = 'myLabelId';
      fixture.changeDetectorRef.markForCheck();
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panel = fixture.debugElement.query(
        By.css('.mat-mdc-autocomplete-panel'),
      )!.nativeElement;
      const labelId = fixture.nativeElement.querySelector('label').id;
      expect(panel.getAttribute('aria-labelledby')).toBe(`${labelId} myLabelId`);
      expect(panel.hasAttribute('aria-label')).toBe(false);
    });

    it('should trim aria-labelledby if the input does not have a label', () => {
      fixture.componentInstance.hasLabel = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      fixture.componentInstance.ariaLabelledby = 'myLabelId';
      fixture.changeDetectorRef.markForCheck();
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panel = fixture.debugElement.query(
        By.css('.mat-mdc-autocomplete-panel'),
      )!.nativeElement;
      expect(panel.getAttribute('aria-labelledby')).toBe(`myLabelId`);
    });

    it('should clear aria-labelledby from the panel if an aria-label is set', () => {
      fixture.componentInstance.ariaLabel = 'My label';
      fixture.changeDetectorRef.markForCheck();
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panel = fixture.debugElement.query(
        By.css('.mat-mdc-autocomplete-panel'),
      )!.nativeElement;
      expect(panel.getAttribute('aria-label')).toBe('My label');
      expect(panel.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('should clear aria-labelledby if the form field does not have a label', () => {
      fixture.componentInstance.hasLabel = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panel = fixture.debugElement.query(
        By.css('.mat-mdc-autocomplete-panel'),
      )!.nativeElement;
      expect(panel.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('should support setting a custom aria-label', () => {
      fixture.componentInstance.ariaLabel = 'Custom Label';
      fixture.changeDetectorRef.markForCheck();
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panel = fixture.debugElement.query(
        By.css('.mat-mdc-autocomplete-panel'),
      )!.nativeElement;

      expect(panel.getAttribute('aria-label')).toEqual('Custom Label');
      expect(panel.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('should set aria-autocomplete to list', () => {
      expect(input.getAttribute('aria-autocomplete'))
        .withContext('Expected aria-autocomplete attribute to equal list.')
        .toEqual('list');
    });

    it('should set aria-activedescendant based on the active option', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      expect(input.hasAttribute('aria-activedescendant'))
        .withContext('Expected aria-activedescendant to be absent if no active item.')
        .toBe(false);

      const DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();

      expect(input.getAttribute('aria-activedescendant'))
        .withContext('Expected aria-activedescendant to match the active item after 1 down arrow.')
        .toEqual(fixture.componentInstance.options.first.id);

      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      tick();
      fixture.detectChanges();

      expect(input.getAttribute('aria-activedescendant'))
        .withContext('Expected aria-activedescendant to match the active item after 2 down arrows.')
        .toEqual(fixture.componentInstance.options.toArray()[1].id);
    }));

    it('should set aria-expanded based on whether the panel is open', () => {
      expect(input.getAttribute('aria-expanded'))
        .withContext('Expected aria-expanded to be false while panel is closed.')
        .toBe('false');

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      expect(input.getAttribute('aria-expanded'))
        .withContext('Expected aria-expanded to be true while panel is open.')
        .toBe('true');

      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();

      expect(input.getAttribute('aria-expanded'))
        .withContext('Expected aria-expanded to be false when panel closes again.')
        .toBe('false');
    });

    it('should set aria-expanded properly when the panel is hidden', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      expect(input.getAttribute('aria-expanded'))
        .withContext('Expected aria-expanded to be true while panel is open.')
        .toBe('true');

      typeInElement(input, 'zz');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(input.getAttribute('aria-expanded'))
        .withContext('Expected aria-expanded to be false when panel hides itself.')
        .toBe('false');
    }));

    it('should set aria-controls based on the attached autocomplete', () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panel = fixture.debugElement.query(
        By.css('.mat-mdc-autocomplete-panel'),
      )!.nativeElement;

      expect(input.getAttribute('aria-controls'))
        .withContext('Expected aria-controls to match attached autocomplete.')
        .toBe(panel.getAttribute('id'));
    });

    it('should not set aria-controls while the autocomplete is closed', () => {
      expect(input.getAttribute('aria-controls')).toBeFalsy();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      expect(input.getAttribute('aria-controls')).toBeTruthy();
    });

    it('should restore focus to the input when clicking to select a value', waitForAsync(async () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const option = overlayContainerElement.querySelector('mat-option') as HTMLElement;

      // Focus the option manually since the synthetic click may not do it.
      option.focus();
      option.click();
      fixture.detectChanges();

      expect(document.activeElement)
        .withContext('Expected focus to be restored to the input.')
        .toBe(input);
    }));

    it('should remove autocomplete-specific aria attributes when autocomplete is disabled', () => {
      fixture.componentInstance.autocompleteDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(input.getAttribute('role')).toBeFalsy();
      expect(input.getAttribute('aria-autocomplete')).toBeFalsy();
      expect(input.getAttribute('aria-expanded')).toBeFalsy();
      expect(input.getAttribute('aria-owns')).toBeFalsy();
    });
  });

  describe('Fallback positions', () => {
    it('should use below positioning by default', waitForAsync(async () => {
      let fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();
      let inputReference = fixture.debugElement.query(By.css('.mdc-text-field'))!.nativeElement;

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      const inputBottom = inputReference.getBoundingClientRect().bottom;
      const panel = overlayContainerElement.querySelector('.mat-mdc-autocomplete-panel')!;
      const panelTop = panel.getBoundingClientRect().top;

      expect(Math.floor(inputBottom))
        .withContext(`Expected panel top to match input bottom by default.`)
        .toEqual(Math.floor(panelTop));
      expect(panel.classList).not.toContain('mat-mdc-autocomplete-panel-above');
    }));

    it('should reposition the panel on scroll', () => {
      let scrolledSubject = new Subject();
      let spacer = document.createElement('div');
      let fixture = createComponent(SimpleAutocomplete, [
        {
          provide: ScrollDispatcher,
          useValue: {scrolled: () => scrolledSubject},
        },
      ]);

      fixture.detectChanges();

      let inputReference = fixture.debugElement.query(By.css('.mdc-text-field'))!.nativeElement;
      spacer.style.height = '1000px';
      document.body.appendChild(spacer);

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      window.scroll(0, 100);
      scrolledSubject.next();
      fixture.detectChanges();

      const inputBottom = inputReference.getBoundingClientRect().bottom;
      const panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
      const panelTop = panel.getBoundingClientRect().top;

      expect(Math.floor(inputBottom))
        .withContext('Expected panel top to match input bottom after scrolling.')
        .toEqual(Math.floor(panelTop));

      spacer.remove();
      window.scroll(0, 0);
    });

    it('should fall back to above position if panel cannot fit below', waitForAsync(async () => {
      let fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();
      let inputReference = fixture.debugElement.query(By.css('.mdc-text-field'))!.nativeElement;

      // Push the autocomplete trigger down so it won't have room to open "below"
      inputReference.style.bottom = '0';
      inputReference.style.position = 'fixed';

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      const inputTop = inputReference.getBoundingClientRect().top;
      const panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
      const panelBottom = panel.getBoundingClientRect().bottom;

      expect(Math.floor(inputTop))
        .withContext(`Expected panel to fall back to above position.`)
        .toEqual(Math.floor(panelBottom));

      expect(panel.classList).toContain('mat-mdc-autocomplete-panel-above');
    }));

    it('should allow the panel to expand when the number of results increases', waitForAsync(async () => {
      let fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;
      let inputReference = fixture.debugElement.query(By.css('.mdc-text-field'))!.nativeElement;

      // Push the element down so it has a little bit of space, but not enough to render.
      inputReference.style.bottom = '10px';
      inputReference.style.position = 'fixed';

      // Type enough to only show one option.
      typeInElement(inputEl, 'California');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      let panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
      let initialPanelHeight = panel.getBoundingClientRect().height;

      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();

      // Change the text so we get more than one result.
      clearElement(inputEl);
      typeInElement(inputEl, 'C');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;

      expect(panel.getBoundingClientRect().height).toBeGreaterThan(initialPanelHeight);
    }));

    it('should align panel properly when filtering in "above" position', waitForAsync(async () => {
      let fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      let input = fixture.debugElement.query(By.css('input'))!.nativeElement;
      let inputReference = fixture.debugElement.query(By.css('.mdc-text-field'))!.nativeElement;

      // Push the autocomplete trigger down so it won't have room to open "below"
      inputReference.style.bottom = '0';
      inputReference.style.position = 'fixed';

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      typeInElement(input, 'f');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const inputTop = inputReference.getBoundingClientRect().top;
      const panel = overlayContainerElement.querySelector('.mat-mdc-autocomplete-panel')!;
      const panelBottom = panel.getBoundingClientRect().bottom;

      expect(Math.floor(inputTop))
        .withContext(`Expected panel to stay aligned after filtering.`)
        .toEqual(Math.floor(panelBottom));
    }));

    it(
      'should fall back to above position when requested if options are added while ' +
        'the panel is open',
      waitForAsync(async () => {
        let fixture = createComponent(SimpleAutocomplete);
        fixture.componentInstance.states = fixture.componentInstance.states.slice(0, 1);
        fixture.componentInstance.filteredStates = fixture.componentInstance.states.slice();
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;
        let inputReference = fixture.debugElement.query(By.css('.mdc-text-field'))!.nativeElement;

        // Push the element down so it has a little bit of space, but not enough to render.
        inputReference.style.bottom = '100px';
        inputReference.style.position = 'fixed';

        dispatchFakeEvent(inputEl, 'focusin');
        fixture.detectChanges();
        await new Promise(r => setTimeout(r));
        fixture.detectChanges();

        let panel = overlayContainerElement.querySelector('.mat-mdc-autocomplete-panel')!;
        let inputRect = inputReference.getBoundingClientRect();
        let panelRect = panel.getBoundingClientRect();

        expect(Math.floor(panelRect.top))
          .withContext(`Expected panel top to be below input before repositioning.`)
          .toBe(Math.floor(inputRect.bottom));

        for (let i = 0; i < 20; i++) {
          fixture.componentInstance.filteredStates.push({code: 'FK', name: 'Fake State'});
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();
        }

        // Request a position update now that there are too many suggestions to fit in the viewport.
        fixture.componentInstance.trigger.updatePosition();

        inputRect = inputReference.getBoundingClientRect();
        panelRect = panel.getBoundingClientRect();

        expect(Math.floor(panelRect.bottom))
          .withContext(`Expected panel to fall back to above position after repositioning.`)
          .toBe(Math.floor(inputRect.top));
        await new Promise(r => setTimeout(r));
      }),
    );

    it('should not throw if a panel reposition is requested while the panel is closed', () => {
      let fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      expect(() => fixture.componentInstance.trigger.updatePosition()).not.toThrow();
    });

    it('should be able to force below position even if there is not enough space', waitForAsync(async () => {
      let fixture = createComponent(SimpleAutocomplete);
      fixture.componentInstance.position = 'below';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      let inputReference = fixture.debugElement.query(By.css('.mdc-text-field'))!.nativeElement;

      // Push the autocomplete trigger down so it won't have room to open below.
      inputReference.style.bottom = '0';
      inputReference.style.position = 'fixed';

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      const inputBottom = inputReference.getBoundingClientRect().bottom;
      const panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
      const panelTop = panel.getBoundingClientRect().top;

      expect(Math.floor(inputBottom))
        .withContext('Expected panel to be below the input.')
        .toEqual(Math.floor(panelTop));

      expect(panel.classList).not.toContain('mat-mdc-autocomplete-panel-above');
    }));

    it('should be able to force above position even if there is not enough space', waitForAsync(async () => {
      let fixture = createComponent(SimpleAutocomplete);
      fixture.componentInstance.position = 'above';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      let inputReference = fixture.debugElement.query(By.css('.mdc-text-field'))!.nativeElement;

      // Push the autocomplete trigger up so it won't have room to open above.
      inputReference.style.top = '0';
      inputReference.style.position = 'fixed';

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      const inputTop = inputReference.getBoundingClientRect().top;
      const panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
      const panelBottom = panel.getBoundingClientRect().bottom;

      expect(Math.floor(inputTop))
        .withContext('Expected panel to be above the input.')
        .toEqual(Math.floor(panelBottom));

      expect(panel.classList).toContain('mat-mdc-autocomplete-panel-above');
    }));

    it('should handle the position being changed after the first open', waitForAsync(async () => {
      let fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();
      let inputReference = fixture.debugElement.query(By.css('.mdc-text-field'))!.nativeElement;
      let openPanel = async () => {
        fixture.componentInstance.trigger.openPanel();
        fixture.detectChanges();
        await new Promise(r => setTimeout(r));
        fixture.detectChanges();
      };

      // Push the autocomplete trigger down so it won't have room to open below.
      inputReference.style.bottom = '0';
      inputReference.style.position = 'fixed';
      await openPanel();

      let inputRect = inputReference.getBoundingClientRect();
      let panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
      let panelRect = panel.getBoundingClientRect();

      expect(Math.floor(inputRect.top))
        .withContext('Expected panel to be above the input.')
        .toEqual(Math.floor(panelRect.bottom));
      expect(panel.classList).toContain('mat-mdc-autocomplete-panel-above');

      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();

      fixture.componentInstance.position = 'below';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await openPanel();

      inputRect = inputReference.getBoundingClientRect();
      panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
      panelRect = panel.getBoundingClientRect();

      expect(Math.floor(inputRect.bottom))
        .withContext('Expected panel to be below the input.')
        .toEqual(Math.floor(panelRect.top));
      expect(panel.classList).not.toContain('mat-mdc-autocomplete-panel-above');
    }));
  });

  describe('Option selection', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;

    beforeEach(() => {
      fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();
    });

    it('should deselect any other selected option', waitForAsync(async () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      let options = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;
      options[0].click();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      let componentOptions = fixture.componentInstance.options.toArray();
      expect(componentOptions[0].selected)
        .withContext(`Clicked option should be selected.`)
        .toBe(true);

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      options = overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(componentOptions[0].selected)
        .withContext(`Previous option should not be selected.`)
        .toBe(false);
      expect(componentOptions[1].selected)
        .withContext(`New Clicked option should be selected.`)
        .toBe(true);
    }));

    it('should call deselect only on the previous selected option', waitForAsync(async () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      let options = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;
      options[0].click();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      let componentOptions = fixture.componentInstance.options.toArray();
      componentOptions.forEach(option => spyOn(option, 'deselect'));

      expect(componentOptions[0].selected)
        .withContext(`Clicked option should be selected.`)
        .toBe(true);

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      options = overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      options[1].click();
      fixture.detectChanges();

      expect(componentOptions[0].deselect).toHaveBeenCalled();
      componentOptions.slice(1).forEach(option => expect(option.deselect).not.toHaveBeenCalled());
    }));

    it('should be able to preselect the first option', waitForAsync(async () => {
      fixture.componentInstance.trigger.autocomplete.autoActiveFirstOption = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('mat-option')[0].classList)
        .withContext('Expected first option to be highlighted.')
        .toContain('mat-mdc-option-active');
    }));

    it(
      'should skip to the next enabled option if the first one is disabled ' +
        'when using `autoActiveFirstOption`',
      waitForAsync(async () => {
        const testComponent = fixture.componentInstance;
        testComponent.trigger.autocomplete.autoActiveFirstOption = true;
        testComponent.states[0].disabled = true;
        testComponent.states[1].disabled = true;
        testComponent.trigger.openPanel();
        fixture.detectChanges();
        await new Promise(r => setTimeout(r));
        fixture.detectChanges();

        expect(overlayContainerElement.querySelectorAll('mat-option')[2].classList)
          .withContext('Expected third option to be highlighted.')
          .toContain('mat-mdc-option-active');
      }),
    );

    it('should not activate any option if all options are disabled', waitForAsync(async () => {
      const testComponent = fixture.componentInstance;
      testComponent.trigger.autocomplete.autoActiveFirstOption = true;
      for (const state of testComponent.states) {
        state.disabled = true;
      }
      testComponent.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      const selectedOptions = overlayContainerElement.querySelectorAll(
        'mat-option.mat-mdc-option-active',
      );
      expect(selectedOptions.length).withContext('expected no options to be active').toBe(0);
    }));

    it('should remove aria-activedescendant when panel is closed with autoActiveFirstOption', waitForAsync(async () => {
      const input: HTMLElement = fixture.nativeElement.querySelector('input');

      expect(input.hasAttribute('aria-activedescendant'))
        .withContext('Expected no active descendant on init.')
        .toBe(false);

      fixture.componentInstance.trigger.autocomplete.autoActiveFirstOption = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      expect(input.getAttribute('aria-activedescendant'))
        .withContext('Expected active descendant while open.')
        .toBeTruthy();

      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();

      expect(input.hasAttribute('aria-activedescendant'))
        .withContext('Expected no active descendant when closed.')
        .toBe(false);
    }));

    it('should be able to preselect the first option when the floating label is disabled', waitForAsync(async () => {
      fixture.componentInstance.floatLabel = 'never';
      fixture.componentInstance.trigger.autocomplete.autoActiveFirstOption = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      // Note: should not have a detectChanges call here
      // in order for the test to fail when it's supposed to.

      expect(overlayContainerElement.querySelectorAll('mat-option')[0].classList)
        .withContext('Expected first option to be highlighted.')
        .toContain('mat-mdc-option-active');
    }));

    it('should be able to configure preselecting the first option globally', waitForAsync(async () => {
      fixture.destroy();
      TestBed.resetTestingModule();
      fixture = createComponent(SimpleAutocomplete, [
        {provide: MAT_AUTOCOMPLETE_DEFAULT_OPTIONS, useValue: {autoActiveFirstOption: true}},
      ]);

      fixture.detectChanges();
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('mat-option')[0].classList)
        .withContext('Expected first option to be highlighted.')
        .toContain('mat-mdc-option-active');
    }));

    it('should handle `optionSelections` being accessed too early', waitForAsync(async () => {
      fixture.destroy();
      fixture = TestBed.createComponent(SimpleAutocomplete);

      let spy = jasmine.createSpy('option selection spy');
      let subscription: Subscription;

      expect(fixture.componentInstance.trigger.autocomplete).toBeFalsy();
      expect(() => {
        subscription = fixture.componentInstance.trigger.optionSelections.subscribe(spy);
      }).not.toThrow();

      fixture.detectChanges();
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const option = overlayContainerElement.querySelector('mat-option') as HTMLElement;

      option.click();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(spy).toHaveBeenCalledWith(jasmine.any(MatOptionSelectionChange));
      subscription!.unsubscribe();
    }));

    it('should emit to `optionSelections` if the list of options changes', waitForAsync(async () => {
      const spy = jasmine.createSpy('option selection spy');
      const subscription = fixture.componentInstance.trigger.optionSelections.subscribe(spy);
      const openAndSelectFirstOption = async () => {
        fixture.detectChanges();
        fixture.componentInstance.trigger.openPanel();
        fixture.detectChanges();
        await new Promise(r => setTimeout(r));
        (overlayContainerElement.querySelector('mat-option') as HTMLElement).click();
        fixture.detectChanges();
        await new Promise(r => setTimeout(r));
      };

      fixture.componentInstance.states = [{code: 'OR', name: 'Oregon'}];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      await openAndSelectFirstOption();
      expect(spy).toHaveBeenCalledTimes(1);

      fixture.componentInstance.states = [{code: 'WV', name: 'West Virginia'}];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      await openAndSelectFirstOption();
      expect(spy).toHaveBeenCalledTimes(2);

      subscription!.unsubscribe();
    }));

    it('should reposition the panel when the amount of options changes', waitForAsync(async () => {
      const flushPosition = async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r));
        fixture.detectChanges();
        await new Promise(r => setTimeout(r));
        fixture.detectChanges();
        // Safari seems to require an extra round that other browsers don't.
        await new Promise(r => setTimeout(r));
        fixture.detectChanges();
        await new Promise(r => setTimeout(r));
        fixture.detectChanges();
        await new Promise(r => setTimeout(r));
        fixture.detectChanges();
        await new Promise(r => setTimeout(r));
        fixture.detectChanges();
      };

      await flushPosition();

      let formField = fixture.debugElement.query(By.css('.mat-mdc-form-field'))!.nativeElement;
      let inputReference = formField.querySelector('.mdc-text-field');
      let input = inputReference.querySelector('input');

      formField.style.bottom = '100px';
      formField.style.position = 'fixed';

      typeInElement(input, 'Cali');
      await flushPosition();

      const inputBottom = inputReference.getBoundingClientRect().bottom;
      const panel = overlayContainerElement.querySelector('.mat-mdc-autocomplete-panel')!;
      const panelTop = panel.getBoundingClientRect().top;

      expect(Math.floor(inputBottom))
        .withContext(`Expected panel top to match input bottom when there is only one option.`)
        .toBe(Math.floor(panelTop));

      clearElement(input);
      await flushPosition();

      const inputTop = inputReference.getBoundingClientRect().top;
      const panelBottom = panel.getBoundingClientRect().bottom;

      expect(Math.floor(inputTop))
        .withContext(`Expected panel switch to the above position if the options no longer fit.`)
        .toBe(Math.floor(panelBottom));
    }));

    it('should clear the selected option when the input value is cleared', waitForAsync(async () => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const input = fixture.nativeElement.querySelector('input');
      const option = overlayContainerElement.querySelector('mat-option') as HTMLElement;
      const optionInstance = fixture.componentInstance.options.first;
      const spy = jasmine.createSpy('selectionChange spy');

      option.click();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(input.value).toBe('Alabama');
      expect(optionInstance.selected).toBe(true);

      const subscription = optionInstance.onSelectionChange.subscribe(spy);

      clearElement(input);
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(input.value).toBe('');
      expect(optionInstance.selected).toBe(false);
      expect(spy).not.toHaveBeenCalled();

      subscription.unsubscribe();
    }));

    it('should accept the user selection if they click on an option while selection is required', waitForAsync(async () => {
      const input = fixture.nativeElement.querySelector('input');
      const {stateCtrl, trigger, states} = fixture.componentInstance;
      fixture.componentInstance.requireSelection = true;
      fixture.changeDetectorRef.markForCheck();
      stateCtrl.setValue(states[1]);
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(input.value).toBe('California');
      expect(stateCtrl.value).toEqual({code: 'CA', name: 'California'});

      trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const options = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;
      const spy = jasmine.createSpy('optionSelected spy');
      const subscription = trigger.optionSelections.subscribe(spy);

      options[5].click();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(input.value).toBe('Oregon');
      expect(stateCtrl.value).toEqual({code: 'OR', name: 'Oregon'});
      expect(spy).toHaveBeenCalledTimes(1);

      subscription.unsubscribe();
    }));

    it('should accept the user selection if they press enter on an option while selection is required', waitForAsync(async () => {
      const input = fixture.nativeElement.querySelector('input');
      const {stateCtrl, trigger, states} = fixture.componentInstance;
      fixture.componentInstance.requireSelection = true;
      fixture.changeDetectorRef.markForCheck();
      stateCtrl.setValue(states[1]);
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(input.value).toBe('California');
      expect(stateCtrl.value).toEqual({code: 'CA', name: 'California'});

      trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const options = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;
      const spy = jasmine.createSpy('optionSelected spy');
      const subscription = trigger.optionSelections.subscribe(spy);

      dispatchKeyboardEvent(options[5], 'keydown', ENTER);
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(input.value).toBe('Oregon');
      expect(stateCtrl.value).toEqual({code: 'OR', name: 'Oregon'});
      expect(spy).toHaveBeenCalledTimes(1);

      subscription.unsubscribe();
    }));

    it('should accept the user selection if autoSelectActiveOption is enabled', waitForAsync(async () => {
      const input = fixture.nativeElement.querySelector('input');
      const {stateCtrl, trigger, states} = fixture.componentInstance;
      fixture.componentInstance.requireSelection = true;
      trigger.autocomplete.autoSelectActiveOption = true;
      fixture.changeDetectorRef.markForCheck();
      stateCtrl.setValue(states[1]);
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(input.value).toBe('California');
      expect(stateCtrl.value).toEqual({code: 'CA', name: 'California'});

      trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      for (let i = 0; i < 5; i++) {
        dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
        fixture.detectChanges();
      }

      dispatchFakeEvent(document, 'click');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(input.value).toBe('New York');
      expect(stateCtrl.value).toEqual({code: 'NY', name: 'New York'});
    }));

    it('should clear the value if selection is required and the user interacted with the panel without selecting anything', waitForAsync(async () => {
      const input = fixture.nativeElement.querySelector('input');
      const {stateCtrl, trigger, states} = fixture.componentInstance;
      fixture.componentInstance.requireSelection = true;
      fixture.changeDetectorRef.markForCheck();
      stateCtrl.setValue(states[1]);
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(input.value).toBe('California');
      expect(stateCtrl.value).toEqual({code: 'CA', name: 'California'});

      trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const spy = jasmine.createSpy('optionSelected spy');
      const subscription = trigger.optionSelections.subscribe(spy);

      input.value = 'Cali';
      dispatchKeyboardEvent(input, 'input');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(input.value).toBe('Cali');
      expect(stateCtrl.value).toEqual({code: 'CA', name: 'California'});
      expect(spy).not.toHaveBeenCalled();

      dispatchFakeEvent(document, 'click');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(input.value).toBe('');
      expect(stateCtrl.value).toBe(null);
      expect(spy).not.toHaveBeenCalled();

      subscription.unsubscribe();
    }));

    it('should preserve the value if a selection is required, but the user opened and closed the panel without interacting with it', waitForAsync(async () => {
      const input = fixture.nativeElement.querySelector('input');
      const {stateCtrl, trigger, states} = fixture.componentInstance;
      fixture.componentInstance.requireSelection = true;
      fixture.changeDetectorRef.markForCheck();
      stateCtrl.setValue(states[1]);
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(input.value).toBe('California');
      expect(stateCtrl.value).toEqual({code: 'CA', name: 'California'});

      trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const spy = jasmine.createSpy('optionSelected spy');
      const subscription = trigger.optionSelections.subscribe(spy);

      dispatchFakeEvent(document, 'click');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(input.value).toBe('California');
      expect(stateCtrl.value).toEqual({code: 'CA', name: 'California'});
      expect(spy).not.toHaveBeenCalled();
      subscription.unsubscribe();
    }));

    it('should preserve the value if a selection is required, and there are no options', waitForAsync(async () => {
      const input = fixture.nativeElement.querySelector('input');
      const {stateCtrl, trigger, states} = fixture.componentInstance;
      fixture.componentInstance.requireSelection = true;
      fixture.changeDetectorRef.markForCheck();
      stateCtrl.setValue(states[1]);
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(input.value).toBe('California');
      expect(stateCtrl.value).toEqual({code: 'CA', name: 'California'});

      fixture.componentInstance.states = fixture.componentInstance.filteredStates = [];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const spy = jasmine.createSpy('optionSelected spy');
      const subscription = trigger.optionSelections.subscribe(spy);

      dispatchFakeEvent(document, 'click');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(input.value).toBe('California');
      expect(stateCtrl.value).toEqual({code: 'CA', name: 'California'});
      expect(spy).not.toHaveBeenCalled();
      subscription.unsubscribe();
    }));

    it('should clear the value if requireSelection is enabled and the user edits the input before clicking away', waitForAsync(async () => {
      const input = fixture.nativeElement.querySelector('input');
      const {stateCtrl, trigger} = fixture.componentInstance;
      fixture.componentInstance.requireSelection = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      // Simulate opening the input and clicking the first option.
      trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      (overlayContainerElement.querySelector('mat-option') as HTMLElement).click();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      expect(trigger.panelOpen).toBe(false);
      expect(input.value).toBe('Alabama');
      expect(stateCtrl.value).toEqual({code: 'AL', name: 'Alabama'});

      // Simulate pressing backspace while focus is still on the input.
      dispatchFakeEvent(input, 'keydown');
      input.value = 'Alabam';
      fixture.detectChanges();
      dispatchFakeEvent(input, 'input');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(trigger.panelOpen).toBe(true);
      expect(input.value).toBe('Alabam');
      expect(stateCtrl.value).toEqual({code: 'AL', name: 'Alabama'});

      // Simulate clicking away.
      input.blur();
      dispatchFakeEvent(document, 'click');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(trigger.panelOpen).toBe(false);
      expect(input.value).toBe('');
      expect(stateCtrl.value).toBe(null);
    }));
  });

  describe('panel closing', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;
    let input: HTMLInputElement;
    let trigger: MatAutocompleteTrigger;
    let closingActionSpy: jasmine.Spy;
    let closingActionsSub: Subscription;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      trigger = fixture.componentInstance.trigger;
      closingActionSpy = jasmine.createSpy('closing action listener');
      closingActionsSub = trigger.panelClosingActions.subscribe(closingActionSpy);

      input = fixture.debugElement.query(By.css('input'))!.nativeElement;

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();
      flush();
    }));

    afterEach(() => {
      closingActionsSub.unsubscribe();
    });

    it('should emit panel close event when clicking away', () => {
      expect(closingActionSpy).not.toHaveBeenCalled();
      dispatchFakeEvent(document, 'click');
      expect(closingActionSpy).toHaveBeenCalledWith(null);
    });

    it('should emit panel close event when tabbing out', () => {
      const tabEvent = createKeyboardEvent('keydown', TAB);
      input.focus();

      expect(closingActionSpy).not.toHaveBeenCalled();
      trigger._handleKeydown(tabEvent);
      expect(closingActionSpy).toHaveBeenCalledWith(null);
    });

    it('should not emit when tabbing away from a closed panel', waitForAsync(async () => {
      const tabEvent = createKeyboardEvent('keydown', TAB);

      input.focus();
      await new Promise(r => setTimeout(r));

      trigger._handleKeydown(tabEvent);

      // Ensure that it emitted once while the panel was open.
      expect(closingActionSpy).toHaveBeenCalledTimes(1);

      trigger._handleKeydown(tabEvent);

      // Ensure that it didn't emit again when tabbing out again.
      expect(closingActionSpy).toHaveBeenCalledTimes(1);
    }));

    it('should emit panel close event when selecting an option', () => {
      const option = overlayContainerElement.querySelector('mat-option') as HTMLElement;

      expect(closingActionSpy).not.toHaveBeenCalled();
      option.click();
      expect(closingActionSpy).toHaveBeenCalledWith(jasmine.any(MatOptionSelectionChange));
    });

    it('should close the panel when pressing escape', () => {
      expect(closingActionSpy).not.toHaveBeenCalled();
      dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
      expect(closingActionSpy).toHaveBeenCalledWith(null);
    });

    // TODO(mmalerba): This test previously only passed because it wasn't properly flushed.
    //  We should figure out if this is indeed the desired behavior, and if so fix the
    //  implementation.
    // tslint:disable-next-line:ban
    xit('should not prevent escape key propagation when there are no options', waitForAsync(async () => {
      fixture.componentInstance.filteredStates = fixture.componentInstance.states = [];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      const event = createKeyboardEvent('keydown', ESCAPE);
      spyOn(event, 'stopPropagation').and.callThrough();
      dispatchEvent(document.body, event);
      fixture.detectChanges();

      expect(event.stopPropagation).not.toHaveBeenCalled();
    }));
  });

  describe('without matInput', () => {
    let fixture: ComponentFixture<AutocompleteWithNativeInput>;

    beforeEach(() => {
      fixture = createComponent(AutocompleteWithNativeInput);
      fixture.detectChanges();
    });

    it('should not throw when clicking outside', fakeAsync(() => {
      dispatchFakeEvent(fixture.debugElement.query(By.css('input'))!.nativeElement, 'focus');
      fixture.detectChanges();
      flush();

      expect(() => dispatchFakeEvent(document, 'click')).not.toThrow();
    }));
  });

  describe('with panel classes in the default options', () => {
    it('should apply them if provided as string', fakeAsync(() => {
      const fixture = createComponent(SimpleAutocomplete, [
        {provide: MAT_AUTOCOMPLETE_DEFAULT_OPTIONS, useValue: {overlayPanelClass: 'default1'}},
      ]);

      fixture.detectChanges();
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panelClassList = overlayContainerElement.querySelector('.cdk-overlay-pane')!.classList;
      expect(panelClassList).toContain('default1');
    }));

    it('should apply them if provided as array', fakeAsync(() => {
      const fixture = createComponent(SimpleAutocomplete, [
        {
          provide: MAT_AUTOCOMPLETE_DEFAULT_OPTIONS,
          useValue: {overlayPanelClass: ['default1', 'default2']},
        },
      ]);

      fixture.detectChanges();
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panelClassList = overlayContainerElement.querySelector('.cdk-overlay-pane')!.classList;
      expect(panelClassList).toContain('default1');
      expect(panelClassList).toContain('default2');
    }));
  });

  describe('misc', () => {
    it('should allow basic use without any forms directives', () => {
      expect(() => {
        const fixture = createComponent(AutocompleteWithoutForms);
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input'))!.nativeElement;
        typeInElement(input, 'd');
        fixture.detectChanges();

        const options = overlayContainerElement.querySelectorAll(
          'mat-option',
        ) as NodeListOf<HTMLElement>;
        expect(options.length).toBe(1);
      }).not.toThrowError();
    });

    it('should display an empty input when the value is undefined with ngModel', () => {
      const fixture = createComponent(AutocompleteWithNgModel);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('input'))!.nativeElement.value).toBe('');
    });

    it('should display the number when the selected option is the number zero', fakeAsync(() => {
      const fixture = createComponent(AutocompleteWithNumbers);

      fixture.componentInstance.selectedNumber = 0;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      tick();

      expect(fixture.debugElement.query(By.css('input'))!.nativeElement.value).toBe('0');
    }));

    it('should work when input is wrapped in ngIf', () => {
      const fixture = createComponent(NgIfAutocomplete);
      fixture.detectChanges();

      dispatchFakeEvent(fixture.debugElement.query(By.css('input'))!.nativeElement, 'focusin');
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.panelOpen)
        .withContext(`Expected panel state to read open when input is focused.`)
        .toBe(true);
      expect(overlayContainerElement.textContent)
        .withContext(`Expected panel to display when input is focused.`)
        .toContain('One');
      expect(overlayContainerElement.textContent)
        .withContext(`Expected panel to display when input is focused.`)
        .toContain('Two');
    });

    it('should filter properly with ngIf after setting the active item', () => {
      const fixture = createComponent(NgIfAutocomplete);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
      fixture.componentInstance.trigger._handleKeydown(DOWN_ARROW_EVENT);
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'))!.nativeElement;
      typeInElement(input, 'o');
      fixture.detectChanges();

      expect(fixture.componentInstance.matOptions.length).toBe(2);
    });

    it('should throw if the user attempts to open the panel too early', () => {
      const fixture = createComponent(AutocompleteWithoutPanel);
      fixture.detectChanges();

      expect(() => {
        fixture.componentInstance.trigger.openPanel();
      }).toThrow(getMatAutocompleteMissingPanelError());
    });

    it('should not throw on init, even if the panel is not defined', fakeAsync(() => {
      expect(() => {
        const fixture = createComponent(AutocompleteWithoutPanel);
        fixture.componentInstance.control.setValue('Something');
        fixture.detectChanges();
        tick();
      }).not.toThrow();
    }));

    it('should transfer the mat-autocomplete classes to the panel element', fakeAsync(() => {
      const fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      tick();
      fixture.detectChanges();

      const autocomplete = fixture.debugElement.nativeElement.querySelector('mat-autocomplete');
      const panel = overlayContainerElement.querySelector('.mat-mdc-autocomplete-panel')!;

      expect(autocomplete.classList).not.toContain('class-one');
      expect(autocomplete.classList).not.toContain('class-two');

      expect(panel.classList).toContain('class-one');
      expect(panel.classList).toContain('class-two');
    }));

    it('should remove old classes when the panel class changes', fakeAsync(() => {
      const fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      tick();
      fixture.detectChanges();

      const classList = overlayContainerElement.querySelector(
        '.mat-mdc-autocomplete-panel',
      )!.classList;

      expect(classList).toContain('mat-mdc-autocomplete-visible');
      expect(classList).toContain('class-one');
      expect(classList).toContain('class-two');

      fixture.componentInstance.panelClass = 'class-three class-four';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(classList).not.toContain('class-one');
      expect(classList).not.toContain('class-two');
      expect(classList).toContain('mat-mdc-autocomplete-visible');
      expect(classList).toContain('class-three');
      expect(classList).toContain('class-four');
    }));

    it('should reset correctly when closed programmatically', waitForAsync(async () => {
      const scrolledSubject = new Subject();
      const fixture = createComponent(SimpleAutocomplete, [
        {
          provide: ScrollDispatcher,
          useValue: {scrolled: () => scrolledSubject},
        },
        {
          provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
          useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close(),
          deps: [Overlay],
        },
      ]);

      fixture.detectChanges();
      const trigger = fixture.componentInstance.trigger;

      trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);

      scrolledSubject.next();
      fixture.detectChanges();

      expect(trigger.panelOpen).withContext('Expected panel to be closed.').toBe(false);
    }));

    it('should handle autocomplete being attached to number inputs', fakeAsync(() => {
      const fixture = createComponent(AutocompleteWithNumberInputAndNgModel);
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'))!.nativeElement;

      typeInElement(input, '1337');
      fixture.detectChanges();

      expect(fixture.componentInstance.selectedValue).toBe(1337);
    }));

    it('should not focus the option when DOWN key is pressed', fakeAsync(() => {
      const fixture = createComponent(SimpleAutocomplete);
      const input = fixture.debugElement.query(By.css('input'))!.nativeElement;
      fixture.detectChanges();
      const spy = spyOn(console, 'error');

      dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      // Note: for some reason the error here gets logged using console.error, rather than being
      // thrown, hence why we use a spy to assert against it, rather than `.not.toThrow`.
      expect(spy).not.toHaveBeenCalled();
    }));
  });

  describe('automatically selecting the active option', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;

    beforeEach(() => {
      fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();
      fixture.componentInstance.trigger.autocomplete.autoSelectActiveOption = true;
      fixture.changeDetectorRef.markForCheck();
    });

    it(
      'should update the input value as the user is navigating, without changing the model ' +
        'value or closing the panel',
      waitForAsync(async () => {
        const {trigger, stateCtrl, closedSpy} = fixture.componentInstance;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        trigger.openPanel();
        fixture.detectChanges();
        await new Promise(r => setTimeout(r));
        fixture.detectChanges();

        expect(stateCtrl.value).toBeFalsy();
        expect(input.value).toBeFalsy();
        expect(trigger.panelOpen).toBe(true);
        expect(closedSpy).not.toHaveBeenCalled();

        dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
        fixture.detectChanges();

        expect(stateCtrl.value).toBeFalsy();
        expect(input.value).toBe('Alabama');
        expect(trigger.panelOpen).toBe(true);
        expect(closedSpy).not.toHaveBeenCalled();

        dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
        fixture.detectChanges();

        expect(stateCtrl.value).toBeFalsy();
        expect(input.value).toBe('California');
        expect(trigger.panelOpen).toBe(true);
        expect(closedSpy).not.toHaveBeenCalled();
      }),
    );

    it('should revert back to the last typed value if the user presses escape', waitForAsync(async () => {
      const {trigger, stateCtrl, closedSpy} = fixture.componentInstance;
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();
      typeInElement(input, 'al');
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));

      expect(stateCtrl.value).toBe('al');
      expect(input.value).toBe('al');
      expect(trigger.panelOpen).toBe(true);
      expect(closedSpy).not.toHaveBeenCalled();

      dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(stateCtrl.value).toBe('al');
      expect(input.value).toBe('Alabama');
      expect(trigger.panelOpen).toBe(true);
      expect(closedSpy).not.toHaveBeenCalled();

      dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
      fixture.detectChanges();

      expect(stateCtrl.value).toBe('al');
      expect(input.value).toBe('al');
      expect(trigger.panelOpen).toBe(false);
      expect(closedSpy).toHaveBeenCalledTimes(1);
    }));

    it('should emit a closed event if no option is displayed', fakeAsync(() => {
      const {openedSpy, closedSpy} = fixture.componentInstance;
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      typeInElement(input, 'Alabama'); // Valid option
      fixture.detectChanges();
      tick();

      expect(openedSpy).toHaveBeenCalledTimes(1);
      expect(closedSpy).toHaveBeenCalledTimes(0);

      typeInElement(input, '_x'); // Invalidate option to 'Alabama_x'
      fixture.detectChanges();
      tick();

      expect(openedSpy).toHaveBeenCalledTimes(1);
      expect(closedSpy).toHaveBeenCalledTimes(1);
    }));

    it(
      'should clear the input if the user presses escape while there was a pending ' +
        'auto selection and there is no previous value',
      waitForAsync(async () => {
        const {trigger, stateCtrl} = fixture.componentInstance;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        trigger.openPanel();
        fixture.detectChanges();
        await new Promise(r => setTimeout(r));
        fixture.detectChanges();

        expect(stateCtrl.value).toBeFalsy();
        expect(input.value).toBeFalsy();

        dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
        fixture.detectChanges();

        expect(stateCtrl.value).toBeFalsy();
        expect(input.value).toBe('Alabama');

        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
        fixture.detectChanges();

        expect(stateCtrl.value).toBeFalsy();
        expect(input.value).toBeFalsy();
      }),
    );

    it('should propagate the auto-selected value if the user clicks away', waitForAsync(async () => {
      const {trigger, stateCtrl} = fixture.componentInstance;
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      expect(stateCtrl.value).toBeFalsy();
      expect(input.value).toBeFalsy();

      dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(stateCtrl.value).toBeFalsy();
      expect(input.value).toBe('Alabama');

      dispatchFakeEvent(document, 'click');
      fixture.detectChanges();

      expect(stateCtrl.value).toEqual({code: 'AL', name: 'Alabama'});
      expect(input.value).toBe('Alabama');
    }));

    it('should propagate the auto-selected value if the user tabs away', waitForAsync(async () => {
      const {trigger, stateCtrl} = fixture.componentInstance;
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      expect(stateCtrl.value).toBeFalsy();
      expect(input.value).toBeFalsy();

      dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(stateCtrl.value).toBeFalsy();
      expect(input.value).toBe('Alabama');

      dispatchKeyboardEvent(input, 'keydown', TAB);
      fixture.detectChanges();

      expect(stateCtrl.value).toEqual({code: 'AL', name: 'Alabama'});
      expect(input.value).toBe('Alabama');
    }));

    it('should propagate the auto-selected value if the user presses enter on it', waitForAsync(async () => {
      const {trigger, stateCtrl} = fixture.componentInstance;
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      expect(stateCtrl.value).toBeFalsy();
      expect(input.value).toBeFalsy();

      dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(stateCtrl.value).toBeFalsy();
      expect(input.value).toBe('Alabama');

      dispatchKeyboardEvent(input, 'keydown', ENTER);
      fixture.detectChanges();

      expect(stateCtrl.value).toEqual({code: 'AL', name: 'Alabama'});
      expect(input.value).toBe('Alabama');
    }));

    it('should allow the user to click on an option different from the auto-selected one', waitForAsync(async () => {
      const {trigger, stateCtrl} = fixture.componentInstance;
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      trigger.openPanel();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      fixture.detectChanges();

      expect(stateCtrl.value).toBeFalsy();
      expect(input.value).toBeFalsy();

      dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(stateCtrl.value).toBeFalsy();
      expect(input.value).toBe('Alabama');

      const options = overlayContainerElement.querySelectorAll(
        'mat-option',
      ) as NodeListOf<HTMLElement>;
      options[2].click();
      fixture.detectChanges();

      expect(stateCtrl.value).toEqual({code: 'FL', name: 'Florida'});
      expect(input.value).toBe('Florida');
    }));
  });

  it('should have correct width when opened', () => {
    const widthFixture = createComponent(SimpleAutocomplete);
    widthFixture.componentInstance.width = 300;
    widthFixture.changeDetectorRef.markForCheck();
    widthFixture.detectChanges();

    widthFixture.componentInstance.trigger.openPanel();
    widthFixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
    // Firefox, edge return a decimal value for width, so we need to parse and round it to verify
    expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(300);

    widthFixture.componentInstance.trigger.closePanel();
    widthFixture.detectChanges();

    widthFixture.componentInstance.width = 500;
    widthFixture.changeDetectorRef.markForCheck();
    widthFixture.detectChanges();

    widthFixture.componentInstance.trigger.openPanel();
    widthFixture.detectChanges();

    // Firefox, edge return a decimal value for width, so we need to parse and round it to verify
    expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(500);
  });

  it('should update the width while the panel is open', () => {
    const widthFixture = createComponent(SimpleAutocomplete);

    widthFixture.componentInstance.width = 300;
    widthFixture.changeDetectorRef.markForCheck();
    widthFixture.detectChanges();

    widthFixture.componentInstance.trigger.openPanel();
    widthFixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
    const input = widthFixture.debugElement.query(By.css('input'))!.nativeElement;

    expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(300);

    widthFixture.componentInstance.width = 500;
    widthFixture.changeDetectorRef.markForCheck();
    widthFixture.detectChanges();

    input.focus();
    dispatchFakeEvent(input, 'input');
    widthFixture.detectChanges();

    expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(500);
  });

  it('should not reopen a closed autocomplete when returning to a blurred tab', () => {
    const fixture = createComponent(SimpleAutocomplete);
    fixture.detectChanges();

    const trigger = fixture.componentInstance.trigger;
    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;

    input.focus();
    fixture.detectChanges();

    expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);

    trigger.closePanel();
    fixture.detectChanges();

    expect(trigger.panelOpen).withContext('Expected panel to be closed.').toBe(false);

    // Simulate the user going to a different tab.
    dispatchFakeEvent(window, 'blur');
    input.blur();
    fixture.detectChanges();

    // Simulate the user coming back.
    dispatchFakeEvent(window, 'focus');
    input.focus();
    fixture.detectChanges();

    expect(trigger.panelOpen).withContext('Expected panel to remain closed.').toBe(false);
  });

  it('should update the panel width if the window is resized', fakeAsync(() => {
    const widthFixture = createComponent(SimpleAutocomplete);

    widthFixture.componentInstance.width = 300;
    widthFixture.changeDetectorRef.markForCheck();
    widthFixture.detectChanges();

    widthFixture.componentInstance.trigger.openPanel();
    widthFixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(300);

    widthFixture.componentInstance.width = 400;
    widthFixture.changeDetectorRef.markForCheck();
    widthFixture.detectChanges();

    dispatchFakeEvent(window, 'resize');
    tick(20);

    expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(400);
  }));

  it('should have panel width match host width by default', () => {
    const widthFixture = createComponent(SimpleAutocomplete);

    widthFixture.componentInstance.width = 300;
    widthFixture.changeDetectorRef.markForCheck();
    widthFixture.detectChanges();

    widthFixture.componentInstance.trigger.openPanel();
    widthFixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(300);
  });

  it('should have panel width set to string value', () => {
    const widthFixture = createComponent(SimpleAutocomplete);

    widthFixture.componentInstance.width = 300;
    widthFixture.changeDetectorRef.markForCheck();
    widthFixture.detectChanges();

    widthFixture.componentInstance.trigger.autocomplete.panelWidth = 'auto';
    widthFixture.changeDetectorRef.markForCheck();
    widthFixture.componentInstance.trigger.openPanel();
    widthFixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.width).toBe('auto');
  });

  it('should have panel width set to number value', () => {
    const widthFixture = createComponent(SimpleAutocomplete);

    widthFixture.componentInstance.width = 300;
    widthFixture.changeDetectorRef.markForCheck();
    widthFixture.detectChanges();

    widthFixture.componentInstance.trigger.autocomplete.panelWidth = 400;
    widthFixture.changeDetectorRef.markForCheck();
    widthFixture.componentInstance.trigger.openPanel();
    widthFixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(400);
  });

  it(
    'should show the panel when the options are initialized later within a component with ' +
      'OnPush change detection',
    fakeAsync(() => {
      let fixture = createComponent(AutocompleteWithOnPushDelay);

      fixture.detectChanges();
      dispatchFakeEvent(fixture.debugElement.query(By.css('input'))!.nativeElement, 'focusin');
      tick(1000);

      fixture.detectChanges();
      tick();

      Promise.resolve().then(() => {
        let panel = overlayContainerElement.querySelector(
          '.mat-mdc-autocomplete-panel',
        ) as HTMLElement;
        let visibleClass = 'mat-mdc-autocomplete-visible';

        fixture.detectChanges();
        expect(panel.classList)
          .withContext(`Expected panel to be visible.`)
          .toContain(visibleClass);
      });
    }),
  );

  it('should emit an event when an option is selected', waitForAsync(async () => {
    let fixture = createComponent(AutocompleteWithSelectEvent);

    fixture.detectChanges();
    fixture.componentInstance.trigger.openPanel();
    await new Promise(r => setTimeout(r));
    fixture.detectChanges();

    let options = overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
    let spy = fixture.componentInstance.optionSelected;

    options[1].click();
    await new Promise(r => setTimeout(r));
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);

    let event = spy.calls.mostRecent().args[0] as MatAutocompleteSelectedEvent;

    expect(event.source).toBe(fixture.componentInstance.autocomplete);
    expect(event.option.value).toBe('Washington');
  }));

  it('should refocus the input after the selection event is emitted', waitForAsync(async () => {
    const events: string[] = [];
    const fixture = createComponent(AutocompleteWithSelectEvent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');

    fixture.componentInstance.trigger.openPanel();
    await new Promise(r => setTimeout(r));
    fixture.detectChanges();

    const options = overlayContainerElement.querySelectorAll(
      'mat-option',
    ) as NodeListOf<HTMLElement>;
    spyOn(input, 'focus').and.callFake(() => events.push('focus'));
    fixture.componentInstance.optionSelected.and.callFake(() => events.push('select'));

    options[1].click();
    await new Promise(r => setTimeout(r));
    fixture.detectChanges();

    expect(events).toEqual(['select', 'focus']);
  }));

  it('should emit an event when a newly-added option is selected', fakeAsync(() => {
    let fixture = createComponent(AutocompleteWithSelectEvent);

    fixture.detectChanges();
    fixture.componentInstance.trigger.openPanel();
    tick();
    fixture.detectChanges();

    fixture.componentInstance.states.push('Puerto Rico');
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    let options = overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
    let spy = fixture.componentInstance.optionSelected;

    options[3].click();
    tick();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);

    let event = spy.calls.mostRecent().args[0] as MatAutocompleteSelectedEvent;

    expect(event.source).toBe(fixture.componentInstance.autocomplete);
    expect(event.option.value).toBe('Puerto Rico');
  }));

  it('should emit an event when an option is activated', waitForAsync(async () => {
    const fixture = createComponent(AutocompleteWithActivatedEvent);

    fixture.detectChanges();
    fixture.componentInstance.trigger.openPanel();
    await new Promise(r => setTimeout(r));
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    const spy = fixture.componentInstance.optionActivated;
    const autocomplete = fixture.componentInstance.autocomplete;
    const options = fixture.componentInstance.options.toArray();

    expect(spy).not.toHaveBeenCalled();

    dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
    fixture.detectChanges();
    expect(spy.calls.mostRecent().args[0]).toEqual({source: autocomplete, option: options[0]});

    dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
    fixture.detectChanges();
    expect(spy.calls.mostRecent().args[0]).toEqual({source: autocomplete, option: options[1]});

    dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
    fixture.detectChanges();
    expect(spy.calls.mostRecent().args[0]).toEqual({source: autocomplete, option: options[2]});
  }));

  it('should not emit the optionActivated event when the active option is reset', waitForAsync(async () => {
    const fixture = createComponent(AutocompleteWithActivatedEvent);

    fixture.detectChanges();
    fixture.componentInstance.trigger.openPanel();
    await new Promise(r => setTimeout(r));
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    const spy = fixture.componentInstance.optionActivated;

    expect(spy).not.toHaveBeenCalled();

    dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);

    dispatchKeyboardEvent(input, 'keydown', ESCAPE);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('should be able to set a custom panel connection element', waitForAsync(async () => {
    const fixture = createComponent(AutocompleteWithDifferentOrigin);

    fixture.detectChanges();
    fixture.componentInstance.connectedTo = fixture.componentInstance.alternateOrigin;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    fixture.componentInstance.trigger.openPanel();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    const overlayRect = overlayContainerElement
      .querySelector('.cdk-overlay-pane')!
      .getBoundingClientRect();
    const originRect = fixture.nativeElement.querySelector('.origin').getBoundingClientRect();

    expect(Math.floor(overlayRect.top))
      .withContext('Expected autocomplete panel to align with the bottom of the new origin.')
      .toBe(Math.floor(originRect.bottom));
  }));

  it('should be able to change the origin after the panel has been opened', waitForAsync(async () => {
    const fixture = createComponent(AutocompleteWithDifferentOrigin);

    fixture.detectChanges();
    fixture.componentInstance.trigger.openPanel();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    fixture.componentInstance.trigger.closePanel();
    fixture.detectChanges();

    fixture.componentInstance.connectedTo = fixture.componentInstance.alternateOrigin;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    fixture.componentInstance.trigger.openPanel();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    const overlayRect = overlayContainerElement
      .querySelector('.cdk-overlay-pane')!
      .getBoundingClientRect();
    const originRect = fixture.nativeElement.querySelector('.origin').getBoundingClientRect();

    expect(Math.floor(overlayRect.top))
      .withContext('Expected autocomplete panel to align with the bottom of the new origin.')
      .toBe(Math.floor(originRect.bottom));
  }));

  it('should be able to re-type the same value when it is reset while open', fakeAsync(() => {
    const fixture = createComponent(SimpleAutocomplete);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'))!.nativeElement;
    const formControl = fixture.componentInstance.stateCtrl;

    typeInElement(input, 'Cal');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(formControl.value)
      .withContext('Expected initial value to be propagated to model')
      .toBe('Cal');

    formControl.setValue('');
    fixture.detectChanges();

    expect(input.value).withContext('Expected input value to reset when model is reset').toBe('');

    typeInElement(input, 'Cal');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(formControl.value)
      .withContext('Expected new value to be propagated to model')
      .toBe('Cal');
  }));

  it('should not close when clicking inside alternate origin', waitForAsync(async () => {
    const fixture = createComponent(AutocompleteWithDifferentOrigin);
    fixture.detectChanges();
    fixture.componentInstance.connectedTo = fixture.componentInstance.alternateOrigin;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    fixture.componentInstance.trigger.openPanel();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    expect(fixture.componentInstance.trigger.panelOpen).toBe(true);

    const origin = fixture.nativeElement.querySelector('.origin');
    origin.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.trigger.panelOpen).toBe(true);
  }));

  describe('a11y', () => {
    it('should display checkmark for selection by default', () => {
      const fixture = createComponent(AutocompleteWithNgModel);
      fixture.componentInstance.selectedState = 'New York';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      dispatchFakeEvent(document.querySelector('mat-option')!, 'click');
      fixture.detectChanges();

      const selectedOption = document.querySelector('mat-option[aria-selected="true"');
      expect(selectedOption).withContext('Expected an option to be selected.').not.toBeNull();
      expect(selectedOption?.querySelector('.mat-pseudo-checkbox.mat-pseudo-checkbox-minimal'))
        .withContext(
          'Expected selection option to have a pseudo-checkbox with "minimal" appearance.',
        )
        .toBeTruthy();
    });
  });

  describe('with token to hide single selection indicator', () => {
    it('should not display checkmark', () => {
      const defaultOptions: MatAutocompleteDefaultOptions = {
        hideSingleSelectionIndicator: true,
      };
      const fixture = createComponent(AutocompleteWithNgModel, [
        {provide: MAT_AUTOCOMPLETE_DEFAULT_OPTIONS, useValue: defaultOptions},
      ]);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      dispatchFakeEvent(document.querySelector('mat-option')!, 'click');
      fixture.detectChanges();

      const selectedOption = document.querySelector('mat-option[aria-selected="true"');
      expect(selectedOption).withContext('Expected an option to be selected.').not.toBeNull();
      expect(document.querySelectorAll('.mat-pseudo-checkbox').length).toBe(0);
    });
  });

  describe('when used inside a modal', () => {
    let fixture: ComponentFixture<AutocompleteInsideAModal>;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(AutocompleteInsideAModal);
      fixture.detectChanges();
    }));

    it('should add the id of the autocomplete panel to the aria-owns of the modal', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panelId = fixture.componentInstance.autocomplete.id;
      const modalElement = fixture.componentInstance.modal.nativeElement;

      expect(modalElement.getAttribute('aria-owns')?.split(' '))
        .withContext('expecting modal to own the autocommplete panel')
        .toContain(panelId);
    }));

    it('should remove the aria-owns attribute of the modal when the autocomplete panel closes', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.componentInstance.trigger.closePanel();
      fixture.detectChanges();

      const modalElement = fixture.componentInstance.modal.nativeElement;

      expect(modalElement.getAttribute('aria-owns')).toBeFalsy();
    }));

    it('should readd the aria-owns attribute of the modal when the autocomplete panel opens again', fakeAsync(() => {
      fixture.componentInstance.trigger.openPanel();
      fixture.componentInstance.trigger.closePanel();
      fixture.componentInstance.trigger.openPanel();
      fixture.detectChanges();

      const panelId = fixture.componentInstance.autocomplete.id;
      const modalElement = fixture.componentInstance.modal.nativeElement;

      expect(modalElement.getAttribute('aria-owns')?.split(' '))
        .withContext('expecting modal to own the autocommplete panel')
        .toContain(panelId);
    }));
  });
});

const SIMPLE_AUTOCOMPLETE_TEMPLATE = `
  <mat-form-field [floatLabel]="floatLabel" [style.width.px]="width" [color]="theme">
    @if (hasLabel) {
      <mat-label>State</mat-label>
    }
    <input
      matInput
      placeholder="State"
      [matAutocomplete]="auto"
      [matAutocompletePosition]="position"
      [matAutocompleteDisabled]="autocompleteDisabled"
      [formControl]="stateCtrl">
  </mat-form-field>
  <mat-autocomplete
    #auto="matAutocomplete"
    [class]="panelClass"
    [displayWith]="displayFn"
    [disableRipple]="disableRipple"
    [requireSelection]="requireSelection"
    [aria-label]="ariaLabel"
    [aria-labelledby]="ariaLabelledby"
    (opened)="openedSpy()"
    (closed)="closedSpy()">
    @for (state of filteredStates; track state) {
      <mat-option
        [value]="state"
        [style.height.px]="state.height"
        [disabled]="state.disabled">
        <span>{{ state.code }}: {{ state.name }}</span>
      </mat-option>
    }
  </mat-autocomplete>
`;

@Component({template: SIMPLE_AUTOCOMPLETE_TEMPLATE})
class SimpleAutocomplete implements OnDestroy {
  stateCtrl = new FormControl<{name: string; code: string} | string | null>(null);
  filteredStates: any[];
  valueSub: Subscription;
  floatLabel = 'auto';
  position = 'auto';
  width: number;
  disableRipple = false;
  autocompleteDisabled = false;
  hasLabel = true;
  requireSelection = false;
  ariaLabel: string;
  ariaLabelledby: string;
  panelClass = 'class-one class-two';
  theme: string;
  openedSpy = jasmine.createSpy('autocomplete opened spy');
  closedSpy = jasmine.createSpy('autocomplete closed spy');

  @ViewChild(MatAutocompleteTrigger, {static: true}) trigger: MatAutocompleteTrigger;
  @ViewChild(MatAutocomplete) panel: MatAutocomplete;
  @ViewChild(MatFormField) formField: MatFormField;
  @ViewChildren(MatOption) options: QueryList<MatOption>;

  states: {code: string; name: string; height?: number; disabled?: boolean}[] = [
    {code: 'AL', name: 'Alabama'},
    {code: 'CA', name: 'California'},
    {code: 'FL', name: 'Florida'},
    {code: 'KS', name: 'Kansas'},
    {code: 'MA', name: 'Massachusetts'},
    {code: 'NY', name: 'New York'},
    {code: 'OR', name: 'Oregon'},
    {code: 'PA', name: 'Pennsylvania'},
    {code: 'TN', name: 'Tennessee'},
    {code: 'VA', name: 'Virginia'},
    {code: 'WY', name: 'Wyoming'},
  ];

  constructor() {
    this.filteredStates = this.states;
    this.valueSub = this.stateCtrl.valueChanges.subscribe(val => {
      this.filteredStates = val
        ? this.states.filter(s => s.name.match(new RegExp(val as string, 'gi')))
        : this.states;
    });
  }

  displayFn(value: any): string {
    return value ? value.name : value;
  }

  ngOnDestroy() {
    this.valueSub.unsubscribe();
  }
}

@Component({template: SIMPLE_AUTOCOMPLETE_TEMPLATE, encapsulation: ViewEncapsulation.ShadowDom})
class SimpleAutocompleteShadowDom extends SimpleAutocomplete {}

@Component({
  template: `
    @if (isVisible) {
<mat-form-field>
      <input matInput placeholder="Choose" [matAutocomplete]="auto" [formControl]="optionCtrl">
    </mat-form-field>
}

    <mat-autocomplete #auto="matAutocomplete">
      @for (option of filteredOptions | async; track option) {
  <mat-option [value]="option">
         {{option}}
      </mat-option>
}
    </mat-autocomplete>
  `,
})
class NgIfAutocomplete {
  optionCtrl = new FormControl('');
  filteredOptions: Observable<any>;
  isVisible = true;
  options = ['One', 'Two', 'Three'];

  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  @ViewChildren(MatOption) matOptions: QueryList<MatOption>;

  constructor() {
    this.filteredOptions = this.optionCtrl.valueChanges.pipe(
      startWith(null),
      map(val => {
        return val
          ? this.options.filter(option => new RegExp(val, 'gi').test(option))
          : this.options.slice();
      }),
    );
  }
}

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="State" [matAutocomplete]="auto"
      (input)="onInput($event.target?.value)">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete">
      @for (state of filteredStates; track state) {
        <mat-option [value]="state">
          <span> {{ state }}  </span>
        </mat-option>
      }
    </mat-autocomplete>
  `,
})
class AutocompleteWithoutForms {
  filteredStates: any[];
  states = ['Alabama', 'California', 'Florida'];

  constructor() {
    this.filteredStates = this.states.slice();
  }

  onInput(value: any) {
    this.filteredStates = this.states.filter(s => new RegExp(value, 'gi').test(s));
  }
}

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="State" [matAutocomplete]="auto" [(ngModel)]="selectedState"
      (ngModelChange)="onInput($event)">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete">
      @for (state of filteredStates; track state) {
        <mat-option [value]="state">
          <span>{{ state }}</span>
        </mat-option>
      }
    </mat-autocomplete>
  `,
})
class AutocompleteWithNgModel {
  filteredStates: any[];
  selectedState: string;
  states = ['New York', 'Washington', 'Oregon'];

  @ViewChild(MatAutocompleteTrigger, {static: true}) trigger: MatAutocompleteTrigger;

  constructor() {
    this.filteredStates = this.states.slice();
  }

  onInput(value: any) {
    this.filteredStates = this.states.filter(s => new RegExp(value, 'gi').test(s));
  }
}

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="Number" [matAutocomplete]="auto" [(ngModel)]="selectedNumber">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete">
      @for (number of numbers; track number) {
        <mat-option [value]="number">
          <span>{{ number }}</span>
        </mat-option>
      }
    </mat-autocomplete>
  `,
})
class AutocompleteWithNumbers {
  selectedNumber: number;
  numbers = [0, 1, 2];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field>
      <input type="text" matInput [matAutocomplete]="auto">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete">
      @for (option of options; track option) {
        <mat-option [value]="option">{{ option }}</mat-option>
      }
    </mat-autocomplete>
  `,
})
class AutocompleteWithOnPushDelay implements OnInit {
  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  options: string[];

  ngOnInit() {
    setTimeout(() => {
      this.options = ['One'];
    }, 1000);
  }
}

@Component({
  template: `
    <input placeholder="Choose" [matAutocomplete]="auto" [formControl]="optionCtrl">

    <mat-autocomplete #auto="matAutocomplete">
      @for (option of filteredOptions | async; track option) {
        <mat-option [value]="option">{{option}}</mat-option>
      }
    </mat-autocomplete>
  `,
})
class AutocompleteWithNativeInput {
  optionCtrl = new FormControl('');
  filteredOptions: Observable<any>;
  options = ['En', 'To', 'Tre', 'Fire', 'Fem'];

  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  @ViewChildren(MatOption) matOptions: QueryList<MatOption>;

  constructor() {
    this.filteredOptions = this.optionCtrl.valueChanges.pipe(
      startWith(null),
      map(val => {
        return val
          ? this.options.filter(option => new RegExp(val, 'gi').test(option))
          : this.options.slice();
      }),
    );
  }
}

@Component({
  template: `<input placeholder="Choose" [matAutocomplete]="auto" [formControl]="control">`,
})
class AutocompleteWithoutPanel {
  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  control = new FormControl('');
}

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="State" [matAutocomplete]="auto" [(ngModel)]="selectedState">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete">
      @for (group of stateGroups; track group) {
        <mat-optgroup [label]="group.label">
          @for (state of group.states; track state) {
            <mat-option [value]="state">
              <span>{{ state }}</span>
            </mat-option>
          }
        </mat-optgroup>
      }
    </mat-autocomplete>
  `,
})
class AutocompleteWithGroups {
  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  selectedState: string;
  stateGroups = [
    {
      title: 'One',
      states: ['Alabama', 'California', 'Florida', 'Oregon'],
    },
    {
      title: 'Two',
      states: ['Kansas', 'Massachusetts', 'New York', 'Pennsylvania'],
    },
    {
      title: 'Three',
      states: ['Tennessee', 'Virginia', 'Wyoming', 'Alaska'],
    },
  ];
}

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="State" [matAutocomplete]="auto" [(ngModel)]="selectedState">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete">
      @if (true) {
        @for (group of stateGroups; track group) {
          <mat-optgroup [label]="group.label">
            @for (state of group.states; track state) {
              <mat-option [value]="state">
                <span>{{ state }}</span>
              </mat-option>
            }
          </mat-optgroup>
        }
      }
    </mat-autocomplete>
  `,
})
class AutocompleteWithIndirectGroups extends AutocompleteWithGroups {}

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="State" [matAutocomplete]="auto" [(ngModel)]="selectedState">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete" (optionSelected)="optionSelected($event)">
      @for (state of states; track state) {
        <mat-option [value]="state">
          <span>{{ state }}</span>
        </mat-option>
      }
    </mat-autocomplete>
  `,
})
class AutocompleteWithSelectEvent {
  selectedState: string;
  states = ['New York', 'Washington', 'Oregon'];
  optionSelected = jasmine.createSpy('optionSelected callback');

  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  @ViewChild(MatAutocomplete) autocomplete: MatAutocomplete;
}

@Component({
  template: `
    <input [formControl]="formControl" [matAutocomplete]="auto"/>
    <mat-autocomplete #auto="matAutocomplete"></mat-autocomplete>
  `,
})
class PlainAutocompleteInputWithFormControl {
  formControl = new FormControl('');
}

@Component({
  template: `
    <mat-form-field>
      <input type="number" matInput [matAutocomplete]="auto" [(ngModel)]="selectedValue">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete">
      @for (value of values; track value) {
        <mat-option [value]="value">{{value}}</mat-option>
      }
    </mat-autocomplete>
  `,
})
class AutocompleteWithNumberInputAndNgModel {
  selectedValue: number;
  values = [1, 2, 3];
}

@Component({
  template: `
    <div>
      <mat-form-field>
        <input
          matInput
          [matAutocomplete]="auto"
          [matAutocompleteConnectedTo]="connectedTo"
          [(ngModel)]="selectedValue">
      </mat-form-field>
    </div>

    <div
      class="origin"
      matAutocompleteOrigin
      #origin="matAutocompleteOrigin"
      style="margin-top: 50px">
      Connection element
    </div>

    <mat-autocomplete #auto="matAutocomplete">
      @for (value of values; track value) {
        <mat-option [value]="value">{{value}}</mat-option>
      }
    </mat-autocomplete>
  `,
})
class AutocompleteWithDifferentOrigin {
  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  @ViewChild(MatAutocompleteOrigin) alternateOrigin: MatAutocompleteOrigin;
  selectedValue: string;
  values = ['one', 'two', 'three'];
  connectedTo?: MatAutocompleteOrigin;
}

@Component({
  template: `
    <input autocomplete="changed" [(ngModel)]="value" [matAutocomplete]="auto"/>
    <mat-autocomplete #auto="matAutocomplete"></mat-autocomplete>
  `,
})
class AutocompleteWithNativeAutocompleteAttribute {
  value: string;
}

@Component({
  template: '<input [matAutocomplete]="null" matAutocompleteDisabled>',
})
class InputWithoutAutocompleteAndDisabled {}

@Component({
  template: `
    <mat-form-field>
      <input matInput [matAutocomplete]="auto">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete" (optionActivated)="optionActivated($event)">
      @for (state of states; track state) {
        <mat-option [value]="state">{{ state }}</mat-option>
      }
    </mat-autocomplete>
  `,
})
class AutocompleteWithActivatedEvent {
  states = ['California', 'West Virginia', 'Florida'];
  optionActivated = jasmine.createSpy('optionActivated callback');

  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  @ViewChild(MatAutocomplete) autocomplete: MatAutocomplete;
  @ViewChildren(MatOption) options: QueryList<MatOption>;
}

@Component({
  selector: 'autocomplete-inside-a-modal',
  template: `
    <button cdkOverlayOrigin #trigger="cdkOverlayOrigin">open dialog</button>
    <ng-template cdkConnectedOverlay [cdkConnectedOverlayOpen]="true"
      [cdkConnectedOverlayOrigin]="trigger">
      <div role="dialog" [attr.aria-modal]="'true'" #modal>
        <mat-form-field>
          <mat-label>Food</mat-label>
          <input matInput [matAutocomplete]="reactiveAuto" [formControl]="formControl">
        </mat-form-field>
        <mat-autocomplete #reactiveAuto="matAutocomplete">
          @for (food of foods; track food; let index = $index) {
            <mat-option [value]="food">{{food.viewValue}}</mat-option>
          }
        </mat-autocomplete>
      </div>
    </ng-template>
  `,
})
class AutocompleteInsideAModal {
  foods = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'},
  ];

  formControl = new FormControl();

  @ViewChild(MatAutocomplete) autocomplete: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  @ViewChildren(MatOption) options: QueryList<MatOption>;
  @ViewChild('modal') modal: ElementRef;
}
