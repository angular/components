import {Component, DebugElement, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideFakeDirectionality, runAccessibilityChecks} from '@angular/cdk/testing/private';
import {SpinButton} from './spinbutton';
import {SpinButtonInput} from './spinbutton-input';
import {SpinButtonIncrement} from './spinbutton-increment';
import {SpinButtonDecrement} from './spinbutton-decrement';

interface ModifierKeys {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

describe('SpinButton', () => {
  let fixture: ComponentFixture<SpinButtonExample | DefaultSpinButtonExample>;
  let spinButtonDebugElement: DebugElement;
  let spinButtonInputDebugElement: DebugElement;
  let spinButtonInstance: SpinButton;
  let spinButtonElement: HTMLElement;
  let inputElement: HTMLElement;
  let incrementButton: HTMLElement;
  let decrementButton: HTMLElement;

  const keydown = (key: string, modifierKeys: ModifierKeys = {}) => {
    inputElement.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ...modifierKeys,
      }),
    );
    fixture.detectChanges();
  };

  const clickIncrement = () => {
    incrementButton.click();
    fixture.detectChanges();
  };

  const clickDecrement = () => {
    decrementButton.click();
    fixture.detectChanges();
  };

  const up = (modifierKeys?: ModifierKeys) => keydown('ArrowUp', modifierKeys);
  const down = (modifierKeys?: ModifierKeys) => keydown('ArrowDown', modifierKeys);
  const home = (modifierKeys?: ModifierKeys) => keydown('Home', modifierKeys);
  const end = (modifierKeys?: ModifierKeys) => keydown('End', modifierKeys);
  const pageUp = (modifierKeys?: ModifierKeys) => keydown('PageUp', modifierKeys);
  const pageDown = (modifierKeys?: ModifierKeys) => keydown('PageDown', modifierKeys);

  function setupSpinButton(opts?: {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    pageStep?: number;
    disabled?: boolean;
    readonly?: boolean;
    wrap?: boolean;
    valueText?: string;
  }) {
    TestBed.configureTestingModule({
      providers: [provideFakeDirectionality('ltr')],
    });

    fixture = TestBed.createComponent(SpinButtonExample);
    const testComponent = fixture.componentInstance as SpinButtonExample;

    if (opts?.value !== undefined) testComponent.value.set(opts.value);
    if (opts?.min !== undefined) testComponent.min = opts.min;
    if (opts?.max !== undefined) testComponent.max = opts.max;
    if (opts?.step !== undefined) testComponent.step = opts.step;
    if (opts?.pageStep !== undefined) testComponent.pageStep = opts.pageStep;
    if (opts?.disabled !== undefined) testComponent.disabled = opts.disabled;
    if (opts?.readonly !== undefined) testComponent.readonly = opts.readonly;
    if (opts?.wrap !== undefined) testComponent.wrap = opts.wrap;
    if (opts?.valueText !== undefined) testComponent.valueText = opts.valueText;

    fixture.detectChanges();
    defineTestVariables(fixture);
  }

  function setupDefaultSpinButton() {
    TestBed.configureTestingModule({
      providers: [provideFakeDirectionality('ltr')],
    });

    fixture = TestBed.createComponent(DefaultSpinButtonExample);
    fixture.detectChanges();
    defineTestVariables(fixture);
  }

  function defineTestVariables(testFixture: ComponentFixture<unknown>) {
    spinButtonDebugElement = testFixture.debugElement.query(By.directive(SpinButton));
    spinButtonInputDebugElement = testFixture.debugElement.query(By.directive(SpinButtonInput));
    spinButtonInstance = spinButtonDebugElement.injector.get<SpinButton>(SpinButton);
    spinButtonElement = spinButtonDebugElement.nativeElement;
    inputElement = spinButtonInputDebugElement.nativeElement;
    incrementButton = testFixture.debugElement.query(
      By.directive(SpinButtonIncrement),
    ).nativeElement;
    decrementButton = testFixture.debugElement.query(
      By.directive(SpinButtonDecrement),
    ).nativeElement;
  }

  afterEach(async () => await runAccessibilityChecks(spinButtonElement));

  describe('ARIA attributes and roles', () => {
    describe('default configuration', () => {
      beforeEach(() => setupDefaultSpinButton());

      it('should correctly set the role attribute to "spinbutton" on the input element', () => {
        expect(inputElement.getAttribute('role')).toBe('spinbutton');
      });

      it('should set aria-valuenow to the current value', () => {
        expect(inputElement.getAttribute('aria-valuenow')).toBe('0');
      });

      it('should not set aria-disabled when not disabled', () => {
        expect(inputElement.getAttribute('aria-disabled')).toBeNull();
      });

      it('should not set aria-readonly when not readonly', () => {
        expect(inputElement.getAttribute('aria-readonly')).toBeNull();
      });

      it('should set tabindex="0" on the input element', () => {
        expect(inputElement.getAttribute('tabindex')).toBe('0');
      });
    });

    describe('custom configuration', () => {
      it('should set aria-valuemin when min is provided', () => {
        setupSpinButton({min: 0});
        expect(inputElement.getAttribute('aria-valuemin')).toBe('0');
      });

      it('should set aria-valuemax when max is provided', () => {
        setupSpinButton({max: 100});
        expect(inputElement.getAttribute('aria-valuemax')).toBe('100');
      });

      it('should set aria-valuetext when valueText is provided', () => {
        setupSpinButton({valueText: 'Five items'});
        expect(inputElement.getAttribute('aria-valuetext')).toBe('Five items');
      });

      it('should set aria-disabled to "true" when disabled', () => {
        setupSpinButton({disabled: true});
        expect(inputElement.getAttribute('aria-disabled')).toBe('true');
      });

      it('should set aria-readonly to "true" when readonly', () => {
        setupSpinButton({readonly: true});
        expect(inputElement.getAttribute('aria-readonly')).toBe('true');
      });

      it('should set tabindex="-1" when disabled', () => {
        setupSpinButton({disabled: true});
        expect(inputElement.getAttribute('tabindex')).toBe('-1');
      });
    });

    describe('button aria-controls', () => {
      beforeEach(() => setupDefaultSpinButton());

      it('should set aria-controls on increment button to reference input id', () => {
        const inputId = inputElement.getAttribute('id');
        expect(incrementButton.getAttribute('aria-controls')).toBe(inputId);
      });

      it('should set aria-controls on decrement button to reference input id', () => {
        const inputId = inputElement.getAttribute('id');
        expect(decrementButton.getAttribute('aria-controls')).toBe(inputId);
      });
    });
  });

  describe('keyboard navigation', () => {
    it('should increment value on ArrowUp', () => {
      setupSpinButton({value: 5});
      up();
      expect(spinButtonInstance.value()).toBe(6);
    });

    it('should decrement value on ArrowDown', () => {
      setupSpinButton({value: 5});
      down();
      expect(spinButtonInstance.value()).toBe(4);
    });

    it('should increment by step amount', () => {
      setupSpinButton({value: 5, step: 5});
      up();
      expect(spinButtonInstance.value()).toBe(10);
    });

    it('should decrement by step amount', () => {
      setupSpinButton({value: 10, step: 5});
      down();
      expect(spinButtonInstance.value()).toBe(5);
    });

    it('should go to minimum value on Home', () => {
      setupSpinButton({value: 50, min: 0, max: 100});
      home();
      expect(spinButtonInstance.value()).toBe(0);
    });

    it('should go to maximum value on End', () => {
      setupSpinButton({value: 50, min: 0, max: 100});
      end();
      expect(spinButtonInstance.value()).toBe(100);
    });

    it('should increment by page step on PageUp', () => {
      setupSpinButton({value: 5, step: 1, pageStep: 10});
      pageUp();
      expect(spinButtonInstance.value()).toBe(15);
    });

    it('should decrement by page step on PageDown', () => {
      setupSpinButton({value: 15, step: 1, pageStep: 10});
      pageDown();
      expect(spinButtonInstance.value()).toBe(5);
    });

    it('should use step * 10 as default page step', () => {
      setupSpinButton({value: 5, step: 2});
      pageUp();
      expect(spinButtonInstance.value()).toBe(25); // 5 + 2*10
    });

    it('should not respond to keyboard when disabled', () => {
      setupSpinButton({value: 5, disabled: true});
      up();
      expect(spinButtonInstance.value()).toBe(5);
    });

    it('should not respond to keyboard when readonly', () => {
      setupSpinButton({value: 5, readonly: true});
      up();
      expect(spinButtonInstance.value()).toBe(5);
    });
  });

  describe('value boundaries', () => {
    it('should not exceed maximum value (clamping)', () => {
      setupSpinButton({value: 10, max: 10});
      up();
      expect(spinButtonInstance.value()).toBe(10);
    });

    it('should not go below minimum value (clamping)', () => {
      setupSpinButton({value: 0, min: 0});
      down();
      expect(spinButtonInstance.value()).toBe(0);
    });

    it('should set aria-invalid when value exceeds max', () => {
      setupSpinButton({value: 15, max: 10});
      expect(inputElement.getAttribute('aria-invalid')).toBe('true');
    });

    it('should set aria-invalid when value is below min', () => {
      setupSpinButton({value: -5, min: 0});
      expect(inputElement.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not set aria-invalid when value is within bounds', () => {
      setupSpinButton({value: 5, min: 0, max: 10});
      expect(inputElement.getAttribute('aria-invalid')).toBeNull();
    });
  });

  describe('wrap behavior', () => {
    it('should wrap from max to min on ArrowUp when wrap is enabled', () => {
      setupSpinButton({value: 12, min: 1, max: 12, wrap: true});
      up();
      expect(spinButtonInstance.value()).toBe(1);
    });

    it('should wrap from min to max on ArrowDown when wrap is enabled', () => {
      setupSpinButton({value: 1, min: 1, max: 12, wrap: true});
      down();
      expect(spinButtonInstance.value()).toBe(12);
    });

    it('should not wrap when wrap is disabled', () => {
      setupSpinButton({value: 12, min: 1, max: 12, wrap: false});
      up();
      expect(spinButtonInstance.value()).toBe(12);
    });
  });

  describe('increment/decrement buttons', () => {
    it('should increment value when increment button is clicked', () => {
      setupSpinButton({value: 5});
      clickIncrement();
      expect(spinButtonInstance.value()).toBe(6);
    });

    it('should decrement value when decrement button is clicked', () => {
      setupSpinButton({value: 5});
      clickDecrement();
      expect(spinButtonInstance.value()).toBe(4);
    });

    it('should disable increment button when at max (without wrap)', () => {
      setupSpinButton({value: 10, max: 10, wrap: false});
      expect(incrementButton.getAttribute('aria-disabled')).toBe('true');
    });

    it('should disable decrement button when at min (without wrap)', () => {
      setupSpinButton({value: 0, min: 0, wrap: false});
      expect(decrementButton.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not disable increment button when at max with wrap enabled', () => {
      setupSpinButton({value: 10, max: 10, wrap: true});
      expect(incrementButton.getAttribute('aria-disabled')).toBeNull();
    });

    it('should not disable decrement button when at min with wrap enabled', () => {
      setupSpinButton({value: 0, min: 0, wrap: true});
      expect(decrementButton.getAttribute('aria-disabled')).toBeNull();
    });

    it('should disable both buttons when spinbutton is disabled', () => {
      setupSpinButton({value: 5, disabled: true});
      expect(incrementButton.getAttribute('aria-disabled')).toBe('true');
      expect(decrementButton.getAttribute('aria-disabled')).toBe('true');
    });

    it('should disable both buttons when spinbutton is readonly', () => {
      setupSpinButton({value: 5, readonly: true});
      expect(incrementButton.getAttribute('aria-disabled')).toBe('true');
      expect(decrementButton.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not increment when increment button is disabled', () => {
      setupSpinButton({value: 10, max: 10, wrap: false});
      clickIncrement();
      expect(spinButtonInstance.value()).toBe(10);
    });

    it('should not decrement when decrement button is disabled', () => {
      setupSpinButton({value: 0, min: 0, wrap: false});
      clickDecrement();
      expect(spinButtonInstance.value()).toBe(0);
    });
  });

  describe('two-way binding', () => {
    it('should update value model on keyboard navigation', () => {
      setupSpinButton({value: 5});
      up();
      expect(spinButtonInstance.value()).toBe(6);
      down();
      down();
      expect(spinButtonInstance.value()).toBe(4);
    });

    it('should update value model on button clicks', () => {
      setupSpinButton({value: 5});
      clickIncrement();
      expect(spinButtonInstance.value()).toBe(6);
      clickDecrement();
      expect(spinButtonInstance.value()).toBe(5);
    });

    it('should reflect value changes in aria-valuenow', () => {
      setupSpinButton({value: 5});
      expect(inputElement.getAttribute('aria-valuenow')).toBe('5');
      up();
      expect(inputElement.getAttribute('aria-valuenow')).toBe('6');
    });
  });

  describe('native input element', () => {
    it('should set autocomplete="off" on native input', () => {
      setupDefaultSpinButton();
      expect(inputElement.getAttribute('autocomplete')).toBe('off');
    });

    it('should set autocorrect="off" on native input', () => {
      setupDefaultSpinButton();
      expect(inputElement.getAttribute('autocorrect')).toBe('off');
    });

    it('should set spellcheck="false" on native input', () => {
      setupDefaultSpinButton();
      expect(inputElement.getAttribute('spellcheck')).toBe('false');
    });

    it('should set inputmode="numeric" by default on native input', () => {
      setupDefaultSpinButton();
      expect(inputElement.getAttribute('inputmode')).toBe('numeric');
    });

    it('should filter non-numeric characters from input', () => {
      setupSpinButton({value: 5});
      const input = inputElement as HTMLInputElement;
      input.value = '1a2b3';
      input.dispatchEvent(new Event('input', {bubbles: true}));
      fixture.detectChanges();
      expect(input.value).toBe('123');
    });

    it('should update value model on change event with valid number', () => {
      setupSpinButton({value: 5});
      const input = inputElement as HTMLInputElement;
      input.value = '42';
      input.dispatchEvent(new Event('change', {bubbles: true}));
      fixture.detectChanges();
      expect(spinButtonInstance.value()).toBe(42);
    });

    it('should revert input to current value on invalid input', () => {
      setupSpinButton({value: 5});
      const input = inputElement as HTMLInputElement;
      input.value = 'invalid';
      input.dispatchEvent(new Event('change', {bubbles: true}));
      fixture.detectChanges();
      expect(input.value).toBe('5');
      expect(spinButtonInstance.value()).toBe(5);
    });

    it('should sync input value when model changes externally', async () => {
      setupSpinButton({value: 5});
      const input = inputElement as HTMLInputElement;
      spinButtonInstance.value.set(10);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(input.value).toBe('10');
    });

    it('should allow negative numbers', () => {
      setupSpinButton({value: 0, min: -10});
      const input = inputElement as HTMLInputElement;
      input.value = '-5';
      input.dispatchEvent(new Event('change', {bubbles: true}));
      fixture.detectChanges();
      expect(spinButtonInstance.value()).toBe(-5);
    });
  });

  describe('span-based spinbutton', () => {
    let spanFixture: ComponentFixture<SpanSpinButtonExample>;
    let spanInputElement: HTMLElement;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideFakeDirectionality('ltr')],
      });
      spanFixture = TestBed.createComponent(SpanSpinButtonExample);
      spanFixture.detectChanges();
      spanInputElement = spanFixture.debugElement.query(
        By.directive(SpinButtonInput),
      ).nativeElement;
      spinButtonElement = spanFixture.debugElement.query(By.directive(SpinButton)).nativeElement;
    });

    it('should work on span elements', () => {
      expect(spanInputElement.getAttribute('role')).toBe('spinbutton');
    });

    it('should not set autocomplete on span elements', () => {
      expect(spanInputElement.getAttribute('autocomplete')).toBeNull();
    });

    it('should not set inputmode on span elements', () => {
      expect(spanInputElement.getAttribute('inputmode')).toBeNull();
    });
  });

  describe('RTL support', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideFakeDirectionality('rtl')],
      });
      fixture = TestBed.createComponent(SpinButtonExample);
      const testComponent = fixture.componentInstance as SpinButtonExample;
      testComponent.value.set(5);
      testComponent.min = 0;
      testComponent.max = 10;
      fixture.detectChanges();
      defineTestVariables(fixture);
    });

    it('should increment value on ArrowUp in RTL', () => {
      up();
      expect(spinButtonInstance.value()).toBe(6);
    });

    it('should decrement value on ArrowDown in RTL', () => {
      down();
      expect(spinButtonInstance.value()).toBe(4);
    });

    it('should go to minimum on Home in RTL', () => {
      home();
      expect(spinButtonInstance.value()).toBe(0);
    });

    it('should go to maximum on End in RTL', () => {
      end();
      expect(spinButtonInstance.value()).toBe(10);
    });
  });
});

@Component({
  template: `
    <div ngSpinButton
         [(value)]="value"
         [min]="min"
         [max]="max"
         [step]="step"
         [pageStep]="pageStep"
         [disabled]="disabled"
         [readonly]="readonly"
         [wrap]="wrap"
         [valueText]="valueText">
      <button ngSpinButtonDecrement type="button">-</button>
      <input ngSpinButtonInput type="text" aria-label="Test Spinbutton" />
      <button ngSpinButtonIncrement type="button">+</button>
    </div>
  `,
  imports: [SpinButton, SpinButtonInput, SpinButtonIncrement, SpinButtonDecrement],
})
class SpinButtonExample {
  value = signal(0);
  min: number | undefined;
  max: number | undefined;
  step = 1;
  pageStep: number | undefined;
  disabled = false;
  readonly = false;
  wrap = false;
  valueText: string | undefined;
}

@Component({
  template: `
    <div ngSpinButton>
      <button ngSpinButtonDecrement type="button">-</button>
      <input ngSpinButtonInput type="text" aria-label="Test Spinbutton" />
      <button ngSpinButtonIncrement type="button">+</button>
    </div>
  `,
  imports: [SpinButton, SpinButtonInput, SpinButtonIncrement, SpinButtonDecrement],
})
class DefaultSpinButtonExample {}

@Component({
  template: `
    <div ngSpinButton [(value)]="value">
      <span ngSpinButtonInput aria-label="Test Spinbutton">{{ value() }}</span>
    </div>
  `,
  imports: [SpinButton, SpinButtonInput],
})
class SpanSpinButtonExample {
  value = signal(5);
}
