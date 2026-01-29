/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DisclosureInputs, DisclosurePattern} from './disclosure';
import {signal, SignalLike, WritableSignalLike} from '../behaviors/signal-like/signal-like';
import {createKeyboardEvent} from '@angular/cdk/testing/private';

// Converts the SignalLike type to WritableSignalLike type for controlling test inputs.
type WritableSignalOverrides<O> = {
  [K in keyof O as O[K] extends SignalLike<any> ? K : never]: O[K] extends SignalLike<infer T>
    ? WritableSignalLike<T>
    : never;
};

type TestDisclosureInputs = DisclosureInputs & WritableSignalOverrides<DisclosureInputs>;

// Keyboard event helpers
const space = () => createKeyboardEvent('keydown', 32, ' ');
const enter = () => createKeyboardEvent('keydown', 13, 'Enter');
const escape = () => createKeyboardEvent('keydown', 27, 'Escape');
const tab = () => createKeyboardEvent('keydown', 9, 'Tab');

function createTriggerElement(): HTMLElement {
  const element = document.createElement('button');
  element.setAttribute('role', 'button');
  return element;
}

function createPointerEvent(): PointerEvent {
  return {button: 0} as PointerEvent;
}

/**
 * Tests organized according to POUR principles:
 * @see https://www.w3.org/WAI/fundamentals/accessibility-principles/
 *
 * - Operable: Keyboard, pointer interactions, and programmatic API
 * - Understandable: Predictable behavior and state management
 * - Robust: Validation and error handling
 *
 * Note: Perceivable is not tested here because this is a framework-agnostic pattern class
 * that handles logic and state management only. DOM attributes (hidden, aria-expanded, etc.)
 * are tested in the public Angular directive tests: src/aria/disclosure/disclosure.spec.ts
 */
describe('Disclosure Pattern', () => {
  let inputs: TestDisclosureInputs;
  let pattern: DisclosurePattern;

  beforeEach(() => {
    inputs = {
      id: signal('disclosure-trigger'),
      element: signal(createTriggerElement()),
      expanded: signal(false),
      disabled: signal(false),
      alwaysExpanded: signal(false),
      controls: signal('disclosure-content'),
    };
    pattern = new DisclosurePattern(inputs);
  });

  /**
   * OPERABLE
   * Keyboard interaction, Pointer interaction, Programmatic API, Focus management
   *
   * User interface components and navigation must be operable.
   *
   * @see https://www.w3.org/WAI/fundamentals/accessibility-principles/#operable
   */
  describe('Operable', () => {
    describe('Keyboard interaction', () => {
      it('should toggle expansion on Space key.', () => {
        expect(pattern.expanded()).toBeFalse();
        pattern.onKeydown(space());
        expect(pattern.expanded()).toBeTrue();
        pattern.onKeydown(space());
        expect(pattern.expanded()).toBeFalse();
      });

      it('should toggle expansion on Enter key.', () => {
        expect(pattern.expanded()).toBeFalse();
        pattern.onKeydown(enter());
        expect(pattern.expanded()).toBeTrue();
        pattern.onKeydown(enter());
        expect(pattern.expanded()).toBeFalse();
      });

      it('should not toggle expansion on other keys.', () => {
        expect(pattern.expanded()).toBeFalse();
        pattern.onKeydown(escape());
        expect(pattern.expanded()).toBeFalse();
        pattern.onKeydown(tab());
        expect(pattern.expanded()).toBeFalse();
      });

      it('should not toggle expansion on Space key when disabled.', () => {
        inputs.disabled.set(true);
        pattern.onKeydown(space());
        expect(pattern.expanded()).toBeFalse();
      });

      it('should not toggle expansion on Enter key when disabled.', () => {
        inputs.disabled.set(true);
        pattern.onKeydown(enter());
        expect(pattern.expanded()).toBeFalse();
      });
    });

    describe('Pointer interaction', () => {
      it('should toggle expansion on pointer click.', () => {
        expect(pattern.expanded()).toBeFalse();
        pattern.onPointerdown(createPointerEvent());
        expect(pattern.expanded()).toBeTrue();
        pattern.onPointerdown(createPointerEvent());
        expect(pattern.expanded()).toBeFalse();
      });

      it('should not toggle expansion on pointer click when disabled.', () => {
        inputs.disabled.set(true);
        pattern.onPointerdown(createPointerEvent());
        expect(pattern.expanded()).toBeFalse();
      });
    });

    describe('Programmatic API (open, close, toggle)', () => {
      it('should be collapsed by default.', () => {
        expect(pattern.expanded()).toBeFalse();
      });

      it('should expand when open() is called.', () => {
        pattern.open();
        expect(pattern.expanded()).toBeTrue();
      });

      it('should collapse when close() is called.', () => {
        inputs.expanded.set(true);
        expect(pattern.expanded()).toBeTrue();
        pattern.close();
        expect(pattern.expanded()).toBeFalse();
      });

      it('should toggle expansion state when toggle() is called.', () => {
        expect(pattern.expanded()).toBeFalse();
        pattern.toggle();
        expect(pattern.expanded()).toBeTrue();
        pattern.toggle();
        expect(pattern.expanded()).toBeFalse();
      });

      it('should remain expanded when open() is called while already expanded.', () => {
        inputs.expanded.set(true);
        pattern.open();
        expect(pattern.expanded()).toBeTrue();
      });

      it('should remain collapsed when close(i) is called while already collapsed.', () => {
        pattern.close();
        expect(pattern.expanded()).toBeFalse();
      });
    });

    describe('Focus management (tabIndex)', () => {
      it('should return 0 when not disabled.', () => {
        expect(pattern.tabIndex()).toBe(0);
      });

      it('should return -1 when disabled.', () => {
        inputs.disabled.set(true);
        expect(pattern.tabIndex()).toBe(-1);
      });
    });
  });

  /**
   * UNDERSTANDABLE
   * Default state, Disabled state, Always expanded behavior
   *
   * Information and the operation of the user interface must be understandable.
   *
   * @see https://www.w3.org/WAI/fundamentals/accessibility-principles/#understandable
   */
  describe('Understandable', () => {
    describe('Default state initialization', () => {
      it('should set expanded to true when alwaysExpanded is true and expanded is false.', () => {
        inputs.alwaysExpanded.set(true);
        inputs.expanded.set(false);
        pattern.setDefaultState();
        expect(pattern.expanded()).toBeTrue();
      });

      it('should not change expanded when alwaysExpanded is false.', () => {
        inputs.alwaysExpanded.set(false);
        inputs.expanded.set(false);
        pattern.setDefaultState();
        expect(pattern.expanded()).toBeFalse();
      });

      it('should keep expanded true when alwaysExpanded and expanded are both true.', () => {
        inputs.alwaysExpanded.set(true);
        inputs.expanded.set(true);
        pattern.setDefaultState();
        expect(pattern.expanded()).toBeTrue();
      });
    });

    describe('Consistent behavior (alwaysExpanded)', () => {
      beforeEach(() => {
        inputs.alwaysExpanded.set(true);
        inputs.expanded.set(true);
      });

      it('should not collapse when close() is called.', () => {
        pattern.close();
        expect(pattern.expanded()).toBeTrue();
      });

      it('should not collapse when toggle() is called while expanded.', () => {
        pattern.toggle();
        expect(pattern.expanded()).toBeTrue();
      });

      it('should expand when open() is called.', () => {
        inputs.expanded.set(false);
        pattern.open();
        expect(pattern.expanded()).toBeTrue();
      });

      it('should not collapse on Space key.', () => {
        pattern.onKeydown(space());
        expect(pattern.expanded()).toBeTrue();
      });

      it('should not collapse on Enter key.', () => {
        pattern.onKeydown(enter());
        expect(pattern.expanded()).toBeTrue();
      });

      it('should not collapse on pointer click.', () => {
        pattern.onPointerdown(createPointerEvent());
        expect(pattern.expanded()).toBeTrue();
      });
    });

    describe('Disabled state behavior', () => {
      beforeEach(() => {
        inputs.disabled.set(true);
      });

      it('should report disabled state.', () => {
        expect(pattern.disabled()).toBeTrue();
      });

      it('should not expand when open() is called.', () => {
        pattern.open();
        expect(pattern.expanded()).toBeFalse();
      });

      it('should not collapse when close() is called.', () => {
        inputs.expanded.set(true);
        inputs.disabled.set(true);
        pattern.close();
        expect(pattern.expanded()).toBeTrue();
      });

      it('should not toggle when toggle() is called.', () => {
        pattern.toggle();
        expect(pattern.expanded()).toBeFalse();
        inputs.expanded.set(true);
        pattern.toggle();
        expect(pattern.expanded()).toBeTrue();
      });
    });
  });

  /**
   * ROBUST
   * Validation and error handling
   *
   * Content must be robust enough to be interpreted reliably by a wide variety
   * of user agents, including assistive technologies.
   *
   * @see https://www.w3.org/WAI/fundamentals/accessibility-principles/#robust
   */
  describe('Robust', () => {
    describe('Validation', () => {
      it('should return no errors for valid collapsed state.', () => {
        expect(pattern.validate()).toEqual([]);
      });

      it('should return no errors for valid expanded state.', () => {
        inputs.expanded.set(true);
        expect(pattern.validate()).toEqual([]);
      });

      it('should return no errors when alwaysExpanded and expanded are both true.', () => {
        inputs.alwaysExpanded.set(true);
        inputs.expanded.set(true);
        expect(pattern.validate()).toEqual([]);
      });

      it('should return error when alwaysExpanded is true but expanded is false.', () => {
        inputs.alwaysExpanded.set(true);
        inputs.expanded.set(false);
        const errors = pattern.validate();
        expect(errors.length).toBe(1);
        expect(errors[0]).toContain('Disclosure: alwaysExpanded is true but expanded is false.');
      });
    });
  });
});
