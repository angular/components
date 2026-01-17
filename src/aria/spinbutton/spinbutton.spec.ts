import {Component, DebugElement, signal} from '@angular/core';
import {SpinButton} from './spinbutton';
import {SpinButtonGroup} from './spinbutton-group';
import {SpinButtonIncrement} from './spinbutton-increment';
import {SpinButtonDecrement} from './spinbutton-decrement';
import {SpinButtonInput} from './spinbutton-input';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {runAccessibilityChecks} from '@angular/cdk/testing/private';

describe('SpinButton', () => {
  let fixture: ComponentFixture<SpinButtonExample>;
  let spinButtonDebugElement: DebugElement;
  let spinButtonInstance: SpinButton;
  let spinButtonElement: HTMLElement;
  let incrementElement: HTMLElement;
  let decrementElement: HTMLElement;

  const keydown = (key: string) => {
    spinButtonElement.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
      }),
    );
    fixture.detectChanges();
  };

  const up = () => keydown('ArrowUp');
  const down = () => keydown('ArrowDown');
  const home = () => keydown('Home');
  const end = () => keydown('End');
  const pageUp = () => keydown('PageUp');
  const pageDown = () => keydown('PageDown');

  const clickIncrement = () => {
    incrementElement.click();
    fixture.detectChanges();
  };

  const clickDecrement = () => {
    decrementElement.click();
    fixture.detectChanges();
  };

  function setupSpinButton(opts?: {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    pageStep?: number;
    disabled?: boolean;
    readonly?: boolean;
    wrap?: boolean;
  }) {
    fixture = TestBed.createComponent(SpinButtonExample);
    const testComponent = fixture.componentInstance;

    if (opts?.value !== undefined) testComponent.value.set(opts.value);
    if (opts?.min !== undefined) testComponent.min = opts.min;
    if (opts?.max !== undefined) testComponent.max = opts.max;
    if (opts?.step !== undefined) testComponent.step = opts.step;
    if (opts?.pageStep !== undefined) testComponent.pageStep = opts.pageStep;
    if (opts?.disabled !== undefined) testComponent.disabled = opts.disabled;
    if (opts?.readonly !== undefined) testComponent.readonly = opts.readonly;
    if (opts?.wrap !== undefined) testComponent.wrap = opts.wrap;

    fixture.detectChanges();
    defineTestVariables(fixture);
  }

  function defineTestVariables(fixture: ComponentFixture<unknown>) {
    spinButtonDebugElement = fixture.debugElement.query(By.directive(SpinButton));
    spinButtonInstance = spinButtonDebugElement.injector.get<SpinButton>(SpinButton);
    spinButtonElement = spinButtonDebugElement.nativeElement;
    incrementElement = fixture.debugElement.query(By.directive(SpinButtonIncrement)).nativeElement;
    decrementElement = fixture.debugElement.query(By.directive(SpinButtonDecrement)).nativeElement;
  }

  afterEach(async () => await runAccessibilityChecks(spinButtonElement));

  describe('ARIA attributes and roles', () => {
    beforeEach(() => setupSpinButton({value: 5, min: 1, max: 10}));

    it('should set role="spinbutton" on the spinbutton element', () => {
      expect(spinButtonElement.getAttribute('role')).toBe('spinbutton');
    });

    it('should set role="group" on the group element', () => {
      const groupElement = fixture.debugElement.query(By.directive(SpinButtonGroup)).nativeElement;
      expect(groupElement.getAttribute('role')).toBe('group');
    });

    it('should set aria-valuenow to the current value', () => {
      expect(spinButtonElement.getAttribute('aria-valuenow')).toBe('5');
    });

    it('should set aria-valuemin to the minimum value', () => {
      expect(spinButtonElement.getAttribute('aria-valuemin')).toBe('1');
    });

    it('should set aria-valuemax to the maximum value', () => {
      expect(spinButtonElement.getAttribute('aria-valuemax')).toBe('10');
    });

    it('should set aria-controls on increment button', () => {
      const spinButtonId = spinButtonElement.getAttribute('id');
      expect(incrementElement.getAttribute('aria-controls')).toBe(spinButtonId);
    });

    it('should set aria-controls on decrement button', () => {
      const spinButtonId = spinButtonElement.getAttribute('id');
      expect(decrementElement.getAttribute('aria-controls')).toBe(spinButtonId);
    });

    it('should set tabindex="-1" on increment button', () => {
      expect(incrementElement.getAttribute('tabindex')).toBe('-1');
    });

    it('should set tabindex="-1" on decrement button', () => {
      expect(decrementElement.getAttribute('tabindex')).toBe('-1');
    });

    it('should set tabindex="0" on spinbutton when not disabled', () => {
      expect(spinButtonElement.getAttribute('tabindex')).toBe('0');
    });
  });

  describe('keyboard navigation', () => {
    beforeEach(() => setupSpinButton({value: 5, min: 1, max: 10}));

    it('should increment on ArrowUp', () => {
      up();
      expect(spinButtonInstance.value()).toBe(6);
    });

    it('should decrement on ArrowDown', () => {
      down();
      expect(spinButtonInstance.value()).toBe(4);
    });

    it('should go to min on Home', () => {
      home();
      expect(spinButtonInstance.value()).toBe(1);
    });

    it('should go to max on End', () => {
      end();
      expect(spinButtonInstance.value()).toBe(10);
    });

    it('should increment by page step on PageUp', () => {
      setupSpinButton({value: 5, min: 1, max: 100, pageStep: 10});
      pageUp();
      expect(spinButtonInstance.value()).toBe(15);
    });

    it('should decrement by page step on PageDown', () => {
      setupSpinButton({value: 50, min: 1, max: 100, pageStep: 10});
      pageDown();
      expect(spinButtonInstance.value()).toBe(40);
    });

    it('should use step * 10 as default page step', () => {
      setupSpinButton({value: 50, min: 1, max: 100, step: 2});
      pageUp();
      expect(spinButtonInstance.value()).toBe(70); // 50 + (2 * 10)
    });
  });

  describe('increment/decrement buttons', () => {
    beforeEach(() => setupSpinButton({value: 5, min: 1, max: 10}));

    it('should increment on button click', () => {
      clickIncrement();
      expect(spinButtonInstance.value()).toBe(6);
    });

    it('should decrement on button click', () => {
      clickDecrement();
      expect(spinButtonInstance.value()).toBe(4);
    });
  });

  describe('boundary behavior (APG rules)', () => {
    it('should not increment when at max', () => {
      setupSpinButton({value: 10, min: 1, max: 10});
      up();
      expect(spinButtonInstance.value()).toBe(10);
    });

    it('should not decrement when at min', () => {
      setupSpinButton({value: 1, min: 1, max: 10});
      down();
      expect(spinButtonInstance.value()).toBe(1);
    });

    it('should snap to min when below min and incrementing', () => {
      setupSpinButton({value: -5, min: 1, max: 10});
      up();
      expect(spinButtonInstance.value()).toBe(1);
    });

    it('should snap to max when above max and decrementing', () => {
      setupSpinButton({value: 15, min: 1, max: 10});
      down();
      expect(spinButtonInstance.value()).toBe(10);
    });

    it('should do nothing when below min and decrementing', () => {
      setupSpinButton({value: -5, min: 1, max: 10});
      down();
      expect(spinButtonInstance.value()).toBe(-5);
    });

    it('should do nothing when above max and incrementing', () => {
      setupSpinButton({value: 15, min: 1, max: 10});
      up();
      expect(spinButtonInstance.value()).toBe(15);
    });

    it('should set aria-invalid when value is below min', () => {
      setupSpinButton({value: -5, min: 1, max: 10});
      expect(spinButtonElement.getAttribute('aria-invalid')).toBe('true');
    });

    it('should set aria-invalid when value is above max', () => {
      setupSpinButton({value: 15, min: 1, max: 10});
      expect(spinButtonElement.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not set aria-invalid when value is within range', () => {
      setupSpinButton({value: 5, min: 1, max: 10});
      expect(spinButtonElement.getAttribute('aria-invalid')).toBeNull();
    });
  });

  describe('button disabled state', () => {
    it('should disable increment button at max', () => {
      setupSpinButton({value: 10, min: 1, max: 10});
      expect(incrementElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should disable decrement button at min', () => {
      setupSpinButton({value: 1, min: 1, max: 10});
      expect(decrementElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not disable increment button below max', () => {
      setupSpinButton({value: 5, min: 1, max: 10});
      expect(incrementElement.getAttribute('aria-disabled')).toBeNull();
    });

    it('should not disable decrement button above min', () => {
      setupSpinButton({value: 5, min: 1, max: 10});
      expect(decrementElement.getAttribute('aria-disabled')).toBeNull();
    });

    it('should enable increment button when below min (will snap to min)', () => {
      setupSpinButton({value: -5, min: 1, max: 10});
      expect(incrementElement.getAttribute('aria-disabled')).toBeNull();
    });

    it('should enable decrement button when above max (will snap to max)', () => {
      setupSpinButton({value: 15, min: 1, max: 10});
      expect(decrementElement.getAttribute('aria-disabled')).toBeNull();
    });
  });

  describe('wrap mode', () => {
    it('should wrap to min when incrementing at max', () => {
      setupSpinButton({value: 10, min: 1, max: 10, wrap: true});
      up();
      expect(spinButtonInstance.value()).toBe(1);
    });

    it('should wrap to max when decrementing at min', () => {
      setupSpinButton({value: 1, min: 1, max: 10, wrap: true});
      down();
      expect(spinButtonInstance.value()).toBe(10);
    });

    it('should not disable buttons when wrap is enabled', () => {
      setupSpinButton({value: 10, min: 1, max: 10, wrap: true});
      expect(incrementElement.getAttribute('aria-disabled')).toBeNull();
      expect(decrementElement.getAttribute('aria-disabled')).toBeNull();
    });
  });

  describe('disabled state', () => {
    beforeEach(() => setupSpinButton({value: 5, min: 1, max: 10, disabled: true}));

    it('should set aria-disabled on spinbutton', () => {
      expect(spinButtonElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should set tabindex="-1" when disabled', () => {
      expect(spinButtonElement.getAttribute('tabindex')).toBe('-1');
    });

    it('should not increment on ArrowUp when disabled', () => {
      up();
      expect(spinButtonInstance.value()).toBe(5);
    });

    it('should not decrement on ArrowDown when disabled', () => {
      down();
      expect(spinButtonInstance.value()).toBe(5);
    });

    it('should not respond to button clicks when disabled', () => {
      clickIncrement();
      expect(spinButtonInstance.value()).toBe(5);
    });
  });

  describe('readonly state', () => {
    beforeEach(() => setupSpinButton({value: 5, min: 1, max: 10, readonly: true}));

    it('should set aria-readonly on spinbutton', () => {
      expect(spinButtonElement.getAttribute('aria-readonly')).toBe('true');
    });

    it('should remain focusable when readonly', () => {
      expect(spinButtonElement.getAttribute('tabindex')).toBe('0');
    });

    it('should not increment on ArrowUp when readonly', () => {
      up();
      expect(spinButtonInstance.value()).toBe(5);
    });

    it('should not decrement on ArrowDown when readonly', () => {
      down();
      expect(spinButtonInstance.value()).toBe(5);
    });
  });

  describe('step configuration', () => {
    it('should increment by custom step', () => {
      setupSpinButton({value: 5, min: 1, max: 100, step: 5});
      up();
      expect(spinButtonInstance.value()).toBe(10);
    });

    it('should decrement by custom step', () => {
      setupSpinButton({value: 10, min: 1, max: 100, step: 5});
      down();
      expect(spinButtonInstance.value()).toBe(5);
    });

    it('should clamp to max when step would exceed max', () => {
      setupSpinButton({value: 8, min: 1, max: 10, step: 5});
      up();
      expect(spinButtonInstance.value()).toBe(10);
    });

    it('should clamp to min when step would go below min', () => {
      setupSpinButton({value: 3, min: 1, max: 10, step: 5});
      down();
      expect(spinButtonInstance.value()).toBe(1);
    });
  });

  describe('undefined value handling', () => {
    it('should initialize to min on increment when value is undefined', () => {
      setupSpinButton({min: 1, max: 10});
      fixture.componentInstance.value.set(undefined);
      fixture.detectChanges();
      up();
      expect(spinButtonInstance.value()).toBe(1);
    });

    it('should initialize to max on decrement when value is undefined', () => {
      setupSpinButton({min: 1, max: 10});
      fixture.componentInstance.value.set(undefined);
      fixture.detectChanges();
      down();
      expect(spinButtonInstance.value()).toBe(10);
    });

    it('should initialize to 0 on increment when no min is set', () => {
      setupSpinButton({max: 10});
      fixture.componentInstance.value.set(undefined);
      fixture.detectChanges();
      up();
      expect(spinButtonInstance.value()).toBe(0);
    });
  });

  describe('native input value display', () => {
    it('should display the value in the input element', () => {
      setupSpinButton({value: 5, min: 1, max: 10});
      expect((spinButtonElement as HTMLInputElement).value).toBe('5');
    });

    it('should update the displayed value on increment', () => {
      setupSpinButton({value: 5, min: 1, max: 10});
      up();
      expect((spinButtonElement as HTMLInputElement).value).toBe('6');
    });

    it('should update the displayed value on decrement', () => {
      setupSpinButton({value: 5, min: 1, max: 10});
      down();
      expect((spinButtonElement as HTMLInputElement).value).toBe('4');
    });

    it('should display empty string when value is undefined', () => {
      setupSpinButton({min: 1, max: 10});
      fixture.componentInstance.value.set(undefined);
      fixture.detectChanges();
      expect((spinButtonElement as HTMLInputElement).value).toBe('');
    });

    it('should update displayed value on button click', () => {
      setupSpinButton({value: 5, min: 1, max: 10});
      clickIncrement();
      expect((spinButtonElement as HTMLInputElement).value).toBe('6');
      clickDecrement();
      expect((spinButtonElement as HTMLInputElement).value).toBe('5');
    });
  });
});

@Component({
  template: `
    <div ngSpinButtonGroup>
      <button ngSpinButtonDecrement type="button">−</button>
      <input
        ngSpinButton
        ngSpinButtonInput
        type="text"
        aria-label="Quantity"
        [(value)]="value"
        [min]="min"
        [max]="max"
        [step]="step"
        [pageStep]="pageStep"
        [disabled]="disabled"
        [readonly]="readonly"
        [wrap]="wrap" />
      <button ngSpinButtonIncrement type="button">+</button>
    </div>
  `,
  imports: [SpinButtonGroup, SpinButton, SpinButtonInput, SpinButtonIncrement, SpinButtonDecrement],
})
class SpinButtonExample {
  value = signal<number | undefined>(5);
  min: number | undefined;
  max: number | undefined;
  step = 1;
  pageStep: number | undefined;
  disabled = false;
  readonly = false;
  wrap = false;
}
