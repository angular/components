/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignal} from '@angular/core';
import {ToolbarInputs, ToolbarPattern, ToolbarWidgetPattern} from './toolbar';
import {RadioButtonPattern} from '../radio-group/radio-button';
import {RadioGroupInputs, RadioGroupPattern} from '../radio-group/radio-group';
import {createKeyboardEvent} from '@angular/cdk/testing/private';
import {ModifierKeys} from '@angular/cdk/testing';

type TestToolbarInputs = ToolbarInputs<string>;
type TestRadioGroupInputs = RadioGroupInputs<string>;
type TestRadio = RadioButtonPattern<string> & {
  disabled: WritableSignal<boolean>;
  element: WritableSignal<HTMLElement>;
};
type TestRadioGroup = RadioGroupPattern<string>;
type TestToolbar = ToolbarPattern<string>;
type TestWidget = ToolbarWidgetPattern & {
  disabled: WritableSignal<boolean>;
  element: WritableSignal<HTMLElement>;
};
type TestItem = TestRadio | TestWidget;

const up = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 38, 'ArrowUp', mods);
const down = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 40, 'ArrowDown', mods);
const left = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 37, 'ArrowLeft', mods);
const right = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 39, 'ArrowRight', mods);
const home = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 36, 'Home', mods);
const end = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 35, 'End', mods);
const space = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 32, ' ', mods);
const enter = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 13, 'Enter', mods);

describe('Toolbar Pattern', () => {
  function getRadioGroup(
    inputs: Partial<TestRadioGroupInputs> & Pick<TestRadioGroupInputs, 'items'>,
  ) {
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

  function getWidgets(toolbar: TestToolbar, values: string[]): TestWidget[] {
    return values.map((value, index) => {
      const element = document.createElement('button');
      element.role = 'button';

      return new ToolbarWidgetPattern({
        id: signal(`button-${index}`),
        disabled: signal(false),
        parentToolbar: signal(toolbar as any),
        element: signal(element),
      });
    }) as TestWidget[];
  }

  function getToolbar(inputs: Partial<TestToolbarInputs> & Pick<TestToolbarInputs, 'items'>) {
    return new ToolbarPattern({
      items: inputs.items,
      activeItem: inputs.activeItem ?? signal(undefined),
      disabled: inputs.disabled ?? signal(false),
      skipDisabled: inputs.skipDisabled ?? signal(true),
      focusMode: inputs.focusMode ?? signal('roving'),
      textDirection: inputs.textDirection ?? signal('ltr'),
      orientation: inputs.orientation ?? signal('horizontal'),
      wrap: inputs.wrap ?? signal(false),
    });
  }

  function getRadioPatterns(values: string[], inputs: Partial<TestRadioGroupInputs> = {}) {
    const radioButtons = signal<TestRadio[]>([]);
    const radioGroup = getRadioGroup({...inputs, items: radioButtons});
    radioButtons.set(getRadios(radioGroup, values));
    radioGroup.inputs.activeItem.set(radioButtons()[0]);
    return {radioGroup, radioButtons};
  }

  function getToolbarPatterns(
    widgetValues: string[],
    inputs: Partial<TestToolbarInputs>,
    radioInputs: Partial<TestRadioGroupInputs> = {},
  ) {
    const {radioGroup, radioButtons} = getRadioPatterns(['Apple', 'Banana', 'Cherry'], radioInputs);
    const widgets = signal<TestWidget[]>([]);
    const children = signal<(TestWidget | TestRadio)[]>([]);

    // Make the radio group and toolbar share an active item
    inputs.activeItem = radioGroup.inputs.activeItem;

    const toolbar = getToolbar({
      ...inputs,
      items: children,
    });
    widgets.set(getWidgets(toolbar, widgetValues));
    children.set([...radioButtons(), ...widgets()]);
    radioGroup.inputs.toolbar = signal(toolbar);
    toolbar.inputs.activeItem.set(children()[0]);

    return {toolbar, widgets: children(), radioGroup};
  }

  function getDefaultPatterns(
    inputs: Partial<TestToolbarInputs> = {},
    radioInputs: Partial<TestRadioGroupInputs> = {},
  ) {
    return getToolbarPatterns(['Pear', 'Peach', 'Plum'], inputs, radioInputs);
  }

  describe('Keyboard Navigation', () => {
    it('should navigate next on ArrowRight (horizontal)', () => {
      const {toolbar, widgets} = getDefaultPatterns();
      expect(toolbar.inputs.activeItem()).toBe(widgets[0]);
      toolbar.onKeydown(right());
      expect(toolbar.inputs.activeItem()).toBe(widgets[1]);
    });

    it('should navigate prev on ArrowLeft (horizontal)', () => {
      const {toolbar, widgets} = getDefaultPatterns();
      toolbar.inputs.activeItem.set(widgets[1]);
      toolbar.onKeydown(left());
      expect(toolbar.inputs.activeItem()).toBe(widgets[0]);
    });

    it('should navigate next on ArrowDown (vertical)', () => {
      const {toolbar, widgets} = getDefaultPatterns({orientation: signal('vertical')});
      expect(toolbar.inputs.activeItem()).toBe(widgets[0]);
      toolbar.onKeydown(down());
      expect(toolbar.inputs.activeItem()).toBe(widgets[1]);
    });

    it('should navigate prev on ArrowUp (vertical)', () => {
      const {toolbar, widgets} = getDefaultPatterns({orientation: signal('vertical')});
      toolbar.inputs.activeItem.set(widgets[1]);
      expect(toolbar.inputs.activeItem()).toBe(widgets[1]);
      toolbar.onKeydown(up());
      expect(toolbar.inputs.activeItem()).toBe(widgets[0]);
    });

    it('should navigate next on ArrowLeft (rtl)', () => {
      const {toolbar, widgets} = getDefaultPatterns({
        textDirection: signal('rtl'),
      });
      expect(toolbar.inputs.activeItem()).toBe(widgets[0]);
      toolbar.onKeydown(left());
      expect(toolbar.inputs.activeItem()).toBe(widgets[1]);
    });

    it('should navigate prev on ArrowRight (rtl)', () => {
      const {toolbar, widgets} = getDefaultPatterns({
        textDirection: signal('rtl'),
      });
      toolbar.inputs.activeItem.set(widgets[1]);
      expect(toolbar.inputs.activeItem()).toBe(widgets[1]);
      toolbar.onKeydown(right());
      expect(toolbar.inputs.activeItem()).toBe(widgets[0]);
    });

    it('should navigate to the first item on Home', () => {
      const {toolbar, widgets} = getDefaultPatterns();
      toolbar.inputs.activeItem.set(widgets[5]);

      expect(toolbar.inputs.activeItem()).toBe(widgets[5]);
      toolbar.onKeydown(home());
      expect(toolbar.inputs.activeItem()).toBe(widgets[0]);
    });

    it('should navigate to the last item on End', () => {
      const {toolbar, widgets} = getDefaultPatterns();
      expect(toolbar.inputs.activeItem()).toBe(widgets[0]);
      toolbar.onKeydown(end());
      expect(toolbar.inputs.activeItem()).toBe(widgets[5]);
    });
    it('should navigate between a radio button and toolbar widget', () => {
      const {toolbar, widgets} = getDefaultPatterns();
      toolbar.inputs.activeItem.set(widgets[2]);
      toolbar.onKeydown(right());
      expect(toolbar.inputs.activeItem()).toBe(widgets[3]);
      toolbar.onKeydown(left());
      expect(toolbar.inputs.activeItem()).toBe(widgets[2]);
    });

    it('should skip a disabled radio button when skipDisabled is true', () => {
      const {toolbar, widgets} = getDefaultPatterns({skipDisabled: signal(true)});
      widgets[1].disabled.set(true);
      toolbar.onKeydown(right());
      expect(toolbar.inputs.activeItem()).toBe(widgets[2]);
    });

    it('should skip a disabled toolbar widget when skipDisabled is true', () => {
      const {toolbar, widgets} = getDefaultPatterns({skipDisabled: signal(true)});
      toolbar.inputs.activeItem.set(widgets[3]);
      widgets[4].disabled.set(true);
      toolbar.onKeydown(right());
      expect(toolbar.inputs.activeItem()).toBe(widgets[5]);
    });

    it('should not skip disabled items when skipDisabled is false', () => {
      const {toolbar, widgets} = getDefaultPatterns({skipDisabled: signal(false)});
      toolbar.inputs.activeItem.set(widgets[3]);
      widgets[4].disabled.set(true);
      toolbar.onKeydown(right());
      expect(toolbar.inputs.activeItem()).toBe(widgets[4]);
    });

    it('should be able to navigate when inner radio group in readonly mode', () => {
      const {toolbar, widgets} = getDefaultPatterns({}, {readonly: signal(true)});
      expect(toolbar.inputs.activeItem()).toBe(widgets[0]);
      toolbar.onKeydown(right());
      expect(toolbar.inputs.activeItem()).toBe(widgets[1]);
    });

    it('should wrap back to the first item when wrap is true', () => {
      const {toolbar, widgets} = getDefaultPatterns({wrap: signal(true)});
      toolbar.inputs.activeItem.set(widgets[5]);
      toolbar.onKeydown(right());
      expect(toolbar.inputs.activeItem()).toBe(widgets[0]);
      toolbar.onKeydown(left());
      expect(toolbar.inputs.activeItem()).toBe(widgets[5]);
    });

    it('should not wrap when wrap is false', () => {
      const {toolbar, widgets} = getDefaultPatterns({wrap: signal(false)});
      toolbar.inputs.activeItem.set(widgets[5]);
      toolbar.onKeydown(right());
      expect(toolbar.inputs.activeItem()).toBe(widgets[5]);
    });

    it('should wrap within the radio group when alternate right key is pressed', () => {
      const {toolbar, widgets} = getDefaultPatterns({wrap: signal(false)});
      toolbar.inputs.activeItem.set(widgets[2]);
      toolbar.onKeydown(down());
      expect(toolbar.inputs.activeItem()).toBe(widgets[0]);
    });
    it('should wrap within the radio group when alternate left key is pressed', () => {
      const {toolbar, widgets} = getDefaultPatterns({wrap: signal(false)});
      toolbar.inputs.activeItem.set(widgets[0]);
      toolbar.onKeydown(up());
      expect(toolbar.inputs.activeItem()).toBe(widgets[2]);
    });
  });

  describe('Keyboard Selection', () => {
    let toolbar: TestToolbar;
    let widgets: TestItem[];
    let radioGroup: TestRadioGroup;

    beforeEach(() => {
      let patterns = getDefaultPatterns({}, {value: signal([])});
      toolbar = patterns.toolbar;
      widgets = patterns.widgets;
      radioGroup = patterns.radioGroup;
    });

    it('should select a radio on Space', () => {
      toolbar.onKeydown(space());
      expect(radioGroup.inputs.value()).toEqual(['Apple']);
    });

    it('should select a radio on Enter', () => {
      toolbar.onKeydown(enter());
      expect(radioGroup.inputs.value()).toEqual(['Apple']);
    });

    it('should not be able to change selection when in readonly mode', () => {
      const readonly = radioGroup.inputs.readonly as WritableSignal<boolean>;
      readonly.set(true);

      toolbar.onKeydown(space());
      expect(radioGroup.inputs.value()).toEqual([]);

      toolbar.onKeydown(enter());
      expect(radioGroup.inputs.value()).toEqual([]);
    });

    it('should not select a disabled radio via keyboard', () => {
      const skipDisabled = toolbar.inputs.skipDisabled as WritableSignal<boolean>;
      skipDisabled.set(false);
      widgets[1].disabled.set(true);

      toolbar.onKeydown(right());
      expect(radioGroup.inputs.value()).toEqual([]);

      toolbar.onKeydown(space());
      expect(radioGroup.inputs.value()).toEqual([]);

      toolbar.onKeydown(enter());
    });
  });

  describe('Pointer Events', () => {
    function click(widgets: TestItem[], index: number) {
      return {
        target: widgets[index].element(),
      } as unknown as PointerEvent;
    }

    it('should select a radio on click', () => {
      const {toolbar, widgets, radioGroup} = getDefaultPatterns();
      toolbar.onPointerdown(click(widgets, 0));
      expect(radioGroup.inputs.value()).toEqual(['Apple']);
    });

    it('should not select a disabled radio on click', () => {
      const {toolbar, widgets, radioGroup} = getDefaultPatterns();
      widgets[0].disabled.set(true);
      toolbar.onPointerdown(click(widgets, 0));
      expect(radioGroup.inputs.value()).toEqual([]);
    });

    it('should only update active index if the inner radio group is readonly', () => {
      const {toolbar, widgets, radioGroup} = getDefaultPatterns({}, {readonly: signal(true)});
      toolbar.onPointerdown(click(widgets, 0));
      expect(toolbar.inputs.activeItem()).toBe(widgets[0]);
      expect(radioGroup.inputs.value()).toEqual([]);
    });
  });

  describe('#setDefaultState', () => {
    it('should set the active index to the first widget', () => {
      const {toolbar, widgets} = getDefaultPatterns();
      toolbar.setDefaultState();
      expect(toolbar.inputs.activeItem()).toBe(widgets[0]);
    });

    it('should set the active index to the first focusable widget (radio button)', () => {
      const {toolbar, widgets} = getDefaultPatterns();
      widgets[0].disabled.set(true);
      widgets[1].disabled.set(true);

      toolbar.setDefaultState();
      expect(toolbar.inputs.activeItem()).toBe(widgets[2]);
    });
    it('should set the active index to the first focusable widget (toolbar widget', () => {
      const {toolbar, widgets} = getDefaultPatterns();
      widgets[0].disabled.set(true);
      widgets[1].disabled.set(true);
      widgets[2].disabled.set(true);
      widgets[3].disabled.set(true);
      toolbar.setDefaultState();
      expect(toolbar.inputs.activeItem()).toBe(widgets[4]);
    });

    it('should set the active index to the selected radio if applicable', () => {
      const {toolbar, widgets} = getDefaultPatterns({}, {value: signal(['Banana'])});
      toolbar.setDefaultState();
      expect(toolbar.inputs.activeItem()).toBe(widgets[1]);
    });

    it('should set the active index to the first focusable widget if selected radio is disabled', () => {
      const {toolbar, widgets} = getDefaultPatterns({}, {value: signal(['Banana'])});
      widgets[1].disabled.set(true);
      toolbar.setDefaultState();
      expect(toolbar.inputs.activeItem()).toBe(widgets[0]);
    });
  });

  describe('validate', () => {
    it('should report a violation if the selected item is disabled and skipDisabled is true', () => {
      const {toolbar, widgets, radioGroup} = getDefaultPatterns({skipDisabled: signal(true)});
      toolbar.inputs.activeItem.set(widgets[1]);
      radioGroup.inputs.value.set(['Banana']);
      widgets[1].disabled.set(true);
      expect(toolbar.validate()).toEqual([
        "Accessibility Violation: A selected radio button inside the toolbar is disabled while 'skipDisabled' is true, making the selection unreachable via keyboard.",
      ]);
    });
  });
});
