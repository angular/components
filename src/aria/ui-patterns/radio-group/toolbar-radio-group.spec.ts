/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignal} from '@angular/core';
import {ToolbarRadioGroupInputs, ToolbarRadioGroupPattern} from './toolbar-radio-group';
import {RadioButtonPattern} from './radio-button';
import {ToolbarPattern} from './../toolbar/toolbar';
import {createKeyboardEvent} from '@angular/cdk/testing/private';
import {ModifierKeys} from '@angular/cdk/testing';

type TestInputs = ToolbarRadioGroupInputs<string>;
type TestRadio = RadioButtonPattern<string> & {
  disabled: WritableSignal<boolean>;
};
type TestRadioGroup = ToolbarRadioGroupPattern<string>;

const down = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 40, 'ArrowDown', mods);
const space = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 32, ' ', mods);
const enter = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 13, 'Enter', mods);

describe('ToolbarRadioGroup Pattern', () => {
  function getToolbarRadioGroup(inputs: Partial<TestInputs> & Pick<TestInputs, 'items'>) {
    return new ToolbarRadioGroupPattern({
      items: inputs.items,
      value: inputs.value ?? signal([]),
      activeItem: signal(undefined),
      element: signal(document.createElement('div')),
      readonly: inputs.readonly ?? signal(false),
      disabled: inputs.disabled ?? signal(false),
      skipDisabled: inputs.skipDisabled ?? signal(true),
      focusMode: inputs.focusMode ?? signal('roving'),
      textDirection: inputs.textDirection ?? signal('ltr'),
      orientation: inputs.orientation ?? signal('vertical'),
      toolbar: inputs.toolbar ?? signal(undefined),
      getItem: e => inputs.items().find(i => i.element() === e.target),
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
    const radioGroup = getToolbarRadioGroup({...inputs, items: radioButtons});
    radioButtons.set(getRadios(radioGroup, values));
    radioGroup.inputs.activeItem.set(radioButtons()[0]);
    return {radioGroup, radioButtons: radioButtons()};
  }

  function getDefaultPatterns(inputs: Partial<TestInputs> = {}) {
    return getPatterns(['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'], inputs);
  }

  let radioGroup: TestRadioGroup;
  let radioButtons: TestRadio[];
  let toolbar: ToolbarPattern<string>;

  beforeEach(() => {
    toolbar = new ToolbarPattern<string>({
      items: signal([]),
      activeItem: signal(undefined),
      element: signal(document.createElement('div')),
      orientation: signal('horizontal'),
      textDirection: signal('ltr'),
      disabled: signal(false),
      skipDisabled: signal(true),
      wrap: signal(false),
      getItem: (e: Element) => undefined,
    });
    const patterns = getDefaultPatterns({
      toolbar: signal(toolbar),
    });
    radioButtons = patterns.radioButtons;
    radioGroup = patterns.radioGroup;
  });

  it('should ignore keyboard navigation when within a toolbar', () => {
    radioGroup.inputs.activeItem.set(radioButtons[0]);
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
    radioGroup.inputs.activeItem.set(radioButtons[0]);
    const initialActive = radioGroup.inputs.activeItem();
    expect(radioGroup.inputs.value()).toEqual([]);

    const clickEvent = {
      target: radioButtons[1].element(),
    } as unknown as PointerEvent;
    radioGroup.onPointerdown(clickEvent);

    expect(radioGroup.inputs.activeItem()).toBe(initialActive);
    expect(radioGroup.inputs.value()).toEqual([]);
  });

  describe('Toolbar Widget Group controls', () => {
    beforeEach(() => {
      radioGroup.inputs.activeItem.set(radioButtons[0]);
    });

    it('should correctly report when on the first item', () => {
      radioGroup.inputs.activeItem.set(radioButtons[0]);
      expect(radioGroup.isOnFirstItem()).toBe(true);
      radioGroup.inputs.activeItem.set(radioButtons[1]);
      expect(radioGroup.isOnFirstItem()).toBe(false);
    });

    it('should correctly report when on the last item', () => {
      radioGroup.inputs.activeItem.set(radioButtons[4]);
      expect(radioGroup.isOnLastItem()).toBe(true);
      radioGroup.inputs.activeItem.set(radioButtons[3]);
      expect(radioGroup.isOnLastItem()).toBe(false);
    });

    it('should handle "next" control', () => {
      radioGroup.next(false);
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[1]);
    });

    it('should handle "prev" control', () => {
      radioGroup.inputs.activeItem.set(radioButtons[1]);
      radioGroup.prev(false);
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
    });

    it('should handle "first" control', () => {
      radioGroup.first();
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
    });

    it('should handle "last" control', () => {
      radioGroup.last();
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[4]);
    });

    it('should handle "unfocus" control by clearing active item', () => {
      radioGroup.unfocus();
      expect(radioGroup.inputs.activeItem()).toBe(undefined);
    });

    it('should handle "trigger" control to select an item', () => {
      expect(radioGroup.inputs.value()).toEqual([]);
      radioGroup.trigger();
      expect(radioGroup.inputs.value()).toEqual(['Apple']);
    });

    it('should not "trigger" selection when readonly', () => {
      (radioGroup.inputs.readonly as WritableSignal<boolean>).set(true);
      expect(radioGroup.inputs.value()).toEqual([]);
      radioGroup.trigger();
      expect(radioGroup.inputs.value()).toEqual([]);
    });

    it('should handle "goto" control', () => {
      const event = {target: radioButtons[2].element()} as unknown as PointerEvent;
      radioGroup.goto(event);
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[2]);
      expect(radioGroup.inputs.value()).toEqual(['Cherry']);
    });

    it('should handle "goto" control in readonly mode (no selection)', () => {
      (radioGroup.inputs.readonly as WritableSignal<boolean>).set(true);
      const event = {target: radioButtons[2].element()} as unknown as PointerEvent;
      radioGroup.goto(event);
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[2]);
      expect(radioGroup.inputs.value()).toEqual([]);
    });

    it('should handle "setDefaultState" control', () => {
      radioGroup.inputs.activeItem.set(undefined);
      radioGroup.setDefaultState();
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
    });

    it('should wrap on "next" with wrap', () => {
      radioGroup.inputs.activeItem.set(radioButtons[4]);
      radioGroup.next(true);
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[0]);
    });

    it('should wrap on "prev" with wrap', () => {
      radioGroup.prev(true);
      expect(radioGroup.inputs.activeItem()).toBe(radioButtons[4]);
    });
  });
});
