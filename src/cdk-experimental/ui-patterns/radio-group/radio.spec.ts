/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignal} from '@angular/core';
import {RadioGroupInputs, RadioGroupPattern, ToolbarLike} from './radio-group';
import {RadioButtonPattern} from './radio-button';
import {createKeyboardEvent} from '@angular/cdk/testing/private';
import {ModifierKeys} from '@angular/cdk/testing';

type TestInputs = RadioGroupInputs<string>;
type TestRadio = RadioButtonPattern<string> & {
  disabled: WritableSignal<boolean>;
};
type TestRadioGroup = RadioGroupPattern<string>;

const up = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 38, 'ArrowUp', mods);
const down = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 40, 'ArrowDown', mods);
const left = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 37, 'ArrowLeft', mods);
const right = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 39, 'ArrowRight', mods);
const home = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 36, 'Home', mods);
const end = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 35, 'End', mods);
const space = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 32, ' ', mods);
const enter = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 13, 'Enter', mods);

describe('RadioGroup Pattern', () => {
  function getRadioGroup(inputs: Partial<TestInputs> & Pick<TestInputs, 'items'>) {
    return new RadioGroupPattern({
      items: inputs.items,
      value: inputs.value ?? signal([]),
      activeItem: signal(undefined),
      readonly: inputs.readonly ?? signal(false),
      disabled: inputs.disabled ?? signal(false),
      skipDisabled: inputs.skipDisabled ?? signal(true),
      focusMode: inputs.focusMode ?? signal('roving'),
      textDirection: inputs.textDirection ?? signal('ltr'),
      orientation: inputs.orientation ?? signal('vertical'),
      toolbar: inputs.toolbar ?? signal(undefined),
    });
  }

  function getRadios(radioGroup: TestRadioGroup, values: string[]): TestRadio[] {
    return values.map((value, index) => {
      const element = document.createElement('div');
      element.role = 'radio';
      return new RadioButtonPattern({
        value: signal(value),
        id: signal(`radio-${index}`),
        disabled: signal(false),
        group: signal(radioGroup),
        element: signal(element),
      });
    }) as TestRadio[];
  }

  function getPatterns(values: string[], inputs: Partial<TestInputs> = {}) {
    const radioButtons = signal<TestRadio[]>([]);
    const radioGroup = getRadioGroup({...inputs, items: radioButtons});
    radioButtons.set(getRadios(radioGroup, values));
    radioGroup.inputs.activeItem.set(radioButtons()[0]);
    return {radioGroup, radioButtons: radioButtons()};
  }

  function getDefaultPatterns(inputs: Partial<TestInputs> = {}) {
    return getPatterns(['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'], inputs);
  }

  describe('Keyboard Navigation', () => {
    it('should navigate next on ArrowDown', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns();
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
      radioGroup.onKeydown(down());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[1]);
    });

    it('should navigate prev on ArrowUp', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns();
      radioGroup.inputs.activeItem.set(radioButtons[1]);
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[1]);
      radioGroup.onKeydown(up());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
    });

    it('should navigate next on ArrowRight (horizontal)', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns({orientation: signal('horizontal')});
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
      radioGroup.onKeydown(right());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[1]);
    });

    it('should navigate prev on ArrowLeft (horizontal)', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns({orientation: signal('horizontal')});
      radioGroup.inputs.activeItem.set(radioButtons[1]);
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[1]);
      radioGroup.onKeydown(left());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
    });

    it('should navigate next on ArrowLeft (horizontal & rtl)', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns({
        textDirection: signal('rtl'),
        orientation: signal('horizontal'),
      });
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
      radioGroup.onKeydown(left());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[1]);
    });

    it('should navigate prev on ArrowRight (horizontal & rtl)', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns({
        textDirection: signal('rtl'),
        orientation: signal('horizontal'),
      });
      radioGroup.inputs.activeItem.set(radioButtons[1]);
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[1]);
      radioGroup.onKeydown(right());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
    });

    it('should navigate to the first radio on Home', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns();
      radioGroup.inputs.activeItem.set(radioButtons[4]);

      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[4]);
      radioGroup.onKeydown(home());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
    });

    it('should navigate to the last radio on End', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns();
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
      radioGroup.onKeydown(end());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[4]);
    });

    it('should skip disabled radios when skipDisabled is true', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns({skipDisabled: signal(true)});
      radioButtons[1].disabled.set(true);
      radioGroup.onKeydown(down());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[2]);
      radioGroup.onKeydown(up());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
    });

    it('should not skip disabled radios when skipDisabled is false', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns({skipDisabled: signal(false)});
      radioButtons[1].disabled.set(true);
      radioGroup.onKeydown(down());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[1]);
      radioGroup.onKeydown(up());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
    });

    it('should be able to navigate in readonly mode', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns({readonly: signal(true)});
      radioGroup.onKeydown(down());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[1]);
      radioGroup.onKeydown(up());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
      radioGroup.onKeydown(end());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[4]);
      radioGroup.onKeydown(home());
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
    });
  });

  describe('Keyboard Selection', () => {
    let radioGroup: TestRadioGroup;

    beforeEach(() => {
      radioGroup = getDefaultPatterns({value: signal([])}).radioGroup;
    });

    it('should select a radio on Space', () => {
      radioGroup.onKeydown(space());
      expect(radioGroup.inputs.value()).toEqual(['Apple']);
    });

    it('should select a radio on Enter', () => {
      radioGroup.onKeydown(enter());
      expect(radioGroup.inputs.value()).toEqual(['Apple']);
    });

    it('should select the focused radio on navigation (implicit selection)', () => {
      radioGroup.onKeydown(down());
      expect(radioGroup.inputs.value()).toEqual(['Banana']);
      radioGroup.onKeydown(up());
      expect(radioGroup.inputs.value()).toEqual(['Apple']);
      radioGroup.onKeydown(end());
      expect(radioGroup.inputs.value()).toEqual(['Elderberry']);
      radioGroup.onKeydown(home());
      expect(radioGroup.inputs.value()).toEqual(['Apple']);
    });

    it('should not be able to change selection when in readonly mode', () => {
      const readonly = radioGroup.inputs.readonly as WritableSignal<boolean>;
      readonly.set(true);
      radioGroup.onKeydown(space());
      expect(radioGroup.inputs.value()).toEqual([]);

      radioGroup.onKeydown(down()); // Navigation still works
      expect(radioGroup.inputs.activeItem()).toBe(radioGroup.inputs.items()[1]);
      expect(radioGroup.inputs.value()).toEqual([]); // Selection doesn't change

      radioGroup.onKeydown(enter());
      expect(radioGroup.inputs.value()).toEqual([]);
    });

    it('should not select a disabled radio via keyboard', () => {
      const {radioGroup, radioButtons} = getPatterns(['A', 'B', 'C'], {
        skipDisabled: signal(false),
      });
      radioButtons[1].disabled.set(true);

      radioGroup.onKeydown(down()); // Focus B (disabled)
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[1]);
      expect(radioGroup.inputs.value()).toEqual([]); // Should not select B

      radioGroup.onKeydown(space()); // Try selecting B with space
      expect(radioGroup.inputs.value()).toEqual([]);

      radioGroup.onKeydown(enter()); // Try selecting B with enter
      expect(radioGroup.inputs.value()).toEqual([]);

      radioGroup.onKeydown(down()); // Focus C
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[2]);
      expect(radioGroup.inputs.value()).toEqual(['C']); // Selects C on navigation
    });
  });

  describe('Pointer Events', () => {
    function click(radios: TestRadio[], index: number) {
      return {
        target: radios[index].element(),
      } as unknown as PointerEvent;
    }

    it('should select a radio on click', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns();
      radioGroup.onPointerdown(click(radioButtons, 1));
      expect(radioGroup.inputs.value()).toEqual(['Banana']);
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[1]);
    });

    it('should not select a disabled radio on click', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns();
      radioButtons[1].disabled.set(true);
      radioGroup.onPointerdown(click(radioButtons, 1));
      expect(radioGroup.inputs.value()).toEqual([]);
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]); // Active index shouldn't change
    });

    it('should only update active index when readonly', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns({readonly: signal(true)});
      radioGroup.onPointerdown(click(radioButtons, 1));
      expect(radioGroup.inputs.value()).toEqual([]);
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[1]); // Active index should update
    });
  });

  describe('#setDefaultState', () => {
    it('should set the active index to the first radio', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns();
      radioGroup.setDefaultState();
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
    });

    it('should set the active index to the first focusable radio', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns({skipDisabled: signal(true)});
      radioButtons[0].disabled.set(true);
      radioGroup.setDefaultState();
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[1]);
    });

    it('should set the active index to the selected radio', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns({value: signal(['Cherry'])});
      radioGroup.setDefaultState();
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[2]);
    });

    it('should set the active index to the first focusable radio if selected is disabled', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns({
        value: signal(['Cherry']),
        skipDisabled: signal(true),
      });
      radioButtons[2].disabled.set(true); // Disable Cherry
      radioGroup.setDefaultState();
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]); // Defaults to first focusable
    });
  });

  describe('validate', () => {
    it('should report a violation if the selected item is disabled and skipDisabled is true', () => {
      const {radioGroup, radioButtons} = getDefaultPatterns({
        value: signal(['Banana']),
        skipDisabled: signal(true),
      });
      radioButtons[1].disabled.set(true); // Disable the selected item.
      const violations = radioGroup.validate();
      expect(violations.length).toBe(1);
    });
  });

  describe('toolbar', () => {
    let radioGroup: TestRadioGroup;
    let radioButtons: TestRadio[];
    let toolbar: ToolbarLike<string>;

    beforeEach(() => {
      const patterns = getDefaultPatterns();
      radioGroup = patterns.radioGroup;
      radioButtons = patterns.radioButtons;
      toolbar = {
        listBehavior: radioGroup.listBehavior,
        orientation: radioGroup.orientation,
        disabled: radioGroup.disabled,
      };
      radioGroup.inputs.toolbar = signal(toolbar);
    });

    it('should ignore keyboard navigation when within a toolbar', () => {
      const initialActive = radioGroup.inputs.activeItem();
      radioGroup.onKeydown(down());
      expect(radioGroup.inputs.activeItem()).toBe(initialActive);
    });

    it('should ignore keyboard selection when within a toolbar', () => {
      expect(radioGroup.inputs.value()).toEqual([]);
      radioGroup.onKeydown(space());
      expect(radioGroup.inputs.value()).toEqual([]);
      radioGroup.onKeydown(enter());
      expect(radioGroup.inputs.value()).toEqual([]);
    });

    it('should ignore pointer events when within a toolbar', () => {
      const initialActive = radioGroup.inputs.activeItem();
      expect(radioGroup.inputs.value()).toEqual([]);

      const clickEvent = {
        target: radioButtons[1].element(),
      } as unknown as PointerEvent;
      radioGroup.onPointerdown(clickEvent);

      expect(radioGroup.inputs.activeItem()).toBe(initialActive);
      expect(radioGroup.inputs.value()).toEqual([]);
    });
  });
});
