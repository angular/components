/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignal} from '@angular/core';
import {ListboxInputs, ListboxPattern} from './listbox';
import {OptionPattern} from './option';
import {createKeyboardEvent} from '@angular/cdk/testing/private';
import {ModifierKeys} from '@angular/cdk/testing';

type TestInputs = ListboxInputs<string>;
type TestOption = OptionPattern<string> & {
  disabled: WritableSignal<boolean>;
};
type TestListbox = ListboxPattern<string>;

const a = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 65, 'A', mods);
const up = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 38, 'ArrowUp', mods);
const down = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 40, 'ArrowDown', mods);
const left = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 37, 'ArrowLeft', mods);
const right = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 39, 'ArrowRight', mods);
const home = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 36, 'Home', mods);
const end = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 35, 'End', mods);
const space = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 32, ' ', mods);
const enter = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 13, 'Enter', mods);
const shift = () => createKeyboardEvent('keydown', 16, 'Shift', {shift: true});

describe('Listbox Pattern', () => {
  function getListbox(inputs: Partial<TestInputs> & Pick<TestInputs, 'items'>) {
    return new ListboxPattern({
      items: inputs.items,
      value: inputs.value ?? signal([]),
      activeIndex: inputs.activeIndex ?? signal(0),
      typeaheadDelay: inputs.typeaheadDelay ?? signal(0.5),
      wrap: inputs.wrap ?? signal(true),
      readonly: inputs.readonly ?? signal(false),
      disabled: inputs.disabled ?? signal(false),
      skipDisabled: inputs.skipDisabled ?? signal(true),
      multi: inputs.multi ?? signal(false),
      focusMode: inputs.focusMode ?? signal('roving'),
      textDirection: inputs.textDirection ?? signal('ltr'),
      orientation: inputs.orientation ?? signal('vertical'),
      selectionMode: inputs.selectionMode ?? signal('explicit'),
    });
  }

  function getOptions(listbox: TestListbox, values: string[]): TestOption[] {
    return values.map((value, index) => {
      const element = document.createElement('div');
      element.role = 'option';
      return new OptionPattern({
        value: signal(value),
        id: signal(`option-${index}`),
        disabled: signal(false),
        searchTerm: signal(value),
        listbox: signal(listbox),
        element: signal(element),
      });
    }) as TestOption[];
  }

  function getPatterns(values: string[], inputs: Partial<TestInputs> = {}) {
    const options = signal<TestOption[]>([]);
    const listbox = getListbox({...inputs, items: options});
    options.set(getOptions(listbox, values));
    return {listbox, options: options()};
  }

  function getDefaultPatterns(inputs: Partial<TestInputs> = {}) {
    return getPatterns(
      [
        'Apple',
        'Apricot',
        'Banana',
        'Blackberry',
        'Blueberry',
        'Cantaloupe',
        'Cherry',
        'Clementine',
        'Cranberry',
      ],
      inputs,
    );
  }

  describe('Keyboard Navigation', () => {
    it('should navigate next on ArrowDown', () => {
      const {listbox} = getDefaultPatterns();
      expect(listbox.inputs.activeIndex()).toBe(0);
      listbox.onKeydown(down());
      expect(listbox.inputs.activeIndex()).toBe(1);
    });

    it('should navigate prev on ArrowUp', () => {
      const {listbox} = getDefaultPatterns({activeIndex: signal(1)});
      expect(listbox.inputs.activeIndex()).toBe(1);
      listbox.onKeydown(up());
      expect(listbox.inputs.activeIndex()).toBe(0);
    });

    it('should navigate next on ArrowRight (horizontal)', () => {
      const {listbox} = getDefaultPatterns({orientation: signal('horizontal')});
      expect(listbox.inputs.activeIndex()).toBe(0);
      listbox.onKeydown(right());
      expect(listbox.inputs.activeIndex()).toBe(1);
    });

    it('should navigate prev on ArrowLeft (horizontal)', () => {
      const {listbox} = getDefaultPatterns({
        activeIndex: signal(1),
        orientation: signal('horizontal'),
      });
      expect(listbox.inputs.activeIndex()).toBe(1);
      listbox.onKeydown(left());
      expect(listbox.inputs.activeIndex()).toBe(0);
    });

    it('should navigate next on ArrowLeft (horizontal & rtl)', () => {
      const {listbox} = getDefaultPatterns({
        textDirection: signal('rtl'),
        orientation: signal('horizontal'),
      });
      expect(listbox.inputs.activeIndex()).toBe(0);
      listbox.onKeydown(left());
      expect(listbox.inputs.activeIndex()).toBe(1);
    });

    it('should navigate prev on ArrowRight (horizontal & rtl)', () => {
      const {listbox} = getDefaultPatterns({
        activeIndex: signal(1),
        textDirection: signal('rtl'),
        orientation: signal('horizontal'),
      });
      expect(listbox.inputs.activeIndex()).toBe(1);
      listbox.onKeydown(right());
      expect(listbox.inputs.activeIndex()).toBe(0);
    });

    it('should navigate to the first option on Home', () => {
      const {listbox} = getDefaultPatterns({
        activeIndex: signal(8),
      });
      expect(listbox.inputs.activeIndex()).toBe(8);
      listbox.onKeydown(home());
      expect(listbox.inputs.activeIndex()).toBe(0);
    });

    it('should navigate to the last option on End', () => {
      const {listbox} = getDefaultPatterns();
      expect(listbox.inputs.activeIndex()).toBe(0);
      listbox.onKeydown(end());
      expect(listbox.inputs.activeIndex()).toBe(8);
    });

    it('should be able to navigate in readonly mode', () => {
      const {listbox} = getDefaultPatterns();
      listbox.onKeydown(down());
      expect(listbox.inputs.activeIndex()).toBe(1);
      listbox.onKeydown(up());
      expect(listbox.inputs.activeIndex()).toBe(0);
      listbox.onKeydown(end());
      expect(listbox.inputs.activeIndex()).toBe(8);
      listbox.onKeydown(home());
      expect(listbox.inputs.activeIndex()).toBe(0);
    });
  });

  describe('Keyboard Selection', () => {
    describe('follows focus & single select', () => {
      it('should select an option on navigation', () => {
        const {listbox} = getDefaultPatterns({
          value: signal(['Apple']),
          multi: signal(false),
          selectionMode: signal('follow'),
        });

        expect(listbox.inputs.activeIndex()).toBe(0);
        expect(listbox.inputs.value()).toEqual(['Apple']);

        listbox.onKeydown(down());
        expect(listbox.inputs.activeIndex()).toBe(1);
        expect(listbox.inputs.value()).toEqual(['Apricot']);

        listbox.onKeydown(up());
        expect(listbox.inputs.activeIndex()).toBe(0);
        expect(listbox.inputs.value()).toEqual(['Apple']);

        listbox.onKeydown(end());
        expect(listbox.inputs.activeIndex()).toBe(8);
        expect(listbox.inputs.value()).toEqual(['Cranberry']);

        listbox.onKeydown(home());
        expect(listbox.inputs.activeIndex()).toBe(0);
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });

      it('should not be able to change selection when in readonly mode', () => {
        const {listbox} = getDefaultPatterns({
          value: signal(['Apple']),
          readonly: signal(true),
          multi: signal(false),
          selectionMode: signal('follow'),
        });

        expect(listbox.inputs.activeIndex()).toBe(0);
        expect(listbox.inputs.value()).toEqual(['Apple']);

        listbox.onKeydown(down());
        expect(listbox.inputs.activeIndex()).toBe(1);
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });
    });

    describe('explicit focus & single select', () => {
      let listbox: TestListbox;

      beforeEach(() => {
        listbox = getDefaultPatterns({
          value: signal([]),
          selectionMode: signal('explicit'),
          multi: signal(false),
        }).listbox;
      });

      it('should select an option on Space', () => {
        listbox.onKeydown(space());
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });

      it('should select an option on Enter', () => {
        listbox.onKeydown(enter());
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });

      it('should only allow one selected option', () => {
        listbox.onKeydown(enter());
        listbox.onKeydown(down());
        listbox.onKeydown(enter());
        expect(listbox.inputs.value()).toEqual(['Apricot']);
      });

      it('should not be able to change selection when in readonly mode', () => {
        const readonly = listbox.inputs.readonly as WritableSignal<boolean>;
        readonly.set(true);
        listbox.onKeydown(space());
        expect(listbox.inputs.value()).toEqual([]);

        listbox.onKeydown(down());
        listbox.onKeydown(enter());
        expect(listbox.inputs.value()).toEqual([]);
      });
    });

    describe('explicit focus & multi select', () => {
      let listbox: TestListbox;
      let options: TestOption[];

      beforeEach(() => {
        const patterns = getDefaultPatterns({
          value: signal([]),
          selectionMode: signal('explicit'),
          multi: signal(true),
        });
        listbox = patterns.listbox;
        options = patterns.options;
      });

      it('should select an option on Space', () => {
        listbox.onKeydown(space());
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });

      it('should select an option on Enter', () => {
        listbox.onKeydown(enter());
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });

      it('should allow multiple selected options', () => {
        listbox.onKeydown(enter());
        listbox.onKeydown(down());
        listbox.onKeydown(enter());
        expect(listbox.inputs.value()).toEqual(['Apple', 'Apricot']);
      });

      it('should select a range of options on Shift + ArrowDown/ArrowUp', () => {
        listbox.onKeydown(shift());
        listbox.onKeydown(down({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apple', 'Apricot']);
        listbox.onKeydown(down({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apple', 'Apricot', 'Banana']);
        listbox.onKeydown(up({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apple', 'Apricot']);
        listbox.onKeydown(up({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });

      it('should not allow wrapping while Shift is held down', () => {
        listbox.onKeydown(shift());
        listbox.onKeydown(up({shift: true}));
        expect(listbox.inputs.value()).toEqual([]);
      });

      it('should select a range of options on Shift + Space (or Enter)', () => {
        listbox.onKeydown(down());
        listbox.onKeydown(space()); // Apricot
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(shift());
        listbox.onKeydown(space({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apricot', 'Banana', 'Blackberry']);
      });

      it('should deselect options outside the range on subsequent on Shift + Space (or Enter)', () => {
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(space());
        expect(listbox.inputs.value()).toEqual(['Banana']);

        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(shift());
        listbox.onKeydown(space({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Banana', 'Blackberry', 'Blueberry']);

        listbox.onKeydown(up());
        listbox.onKeydown(up());
        listbox.onKeydown(up());
        listbox.onKeydown(up());
        listbox.onKeydown(shift());
        listbox.onKeydown(space({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Banana', 'Apricot', 'Apple']);
      });

      it('should select the focused option and all options up to the first option on Ctrl + Shift + Home', () => {
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(shift());
        listbox.onKeydown(home({control: true, shift: true}));
        expect(listbox.inputs.value()).toEqual(['Blackberry', 'Banana', 'Apricot', 'Apple']);
      });

      it('should select the focused option and all options down to the last option on Ctrl + Shift + End', () => {
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(shift());
        listbox.onKeydown(end({control: true, shift: true}));
        expect(listbox.inputs.value()).toEqual(['Cantaloupe', 'Cherry', 'Clementine', 'Cranberry']);
      });

      it('should not be able to change selection when in readonly mode', () => {
        const readonly = listbox.inputs.readonly as WritableSignal<boolean>;
        readonly.set(true);
        listbox.onKeydown(space());
        expect(listbox.inputs.value()).toEqual([]);

        listbox.onKeydown(down());
        listbox.onKeydown(enter());
        expect(listbox.inputs.value()).toEqual([]);

        listbox.onKeydown(shift());
        listbox.onKeydown(up({shift: true}));
        expect(listbox.inputs.value()).toEqual([]);

        listbox.onKeydown(down({shift: true}));
        expect(listbox.inputs.value()).toEqual([]);

        listbox.onKeydown(end({control: true, shift: true}));
        expect(listbox.inputs.value()).toEqual([]);

        listbox.onKeydown(home({control: true, shift: true}));
        expect(listbox.inputs.value()).toEqual([]);
      });

      it('should not change the selected state of disabled options on Shift + ArrowUp / ArrowDown', () => {
        (listbox.inputs.skipDisabled as WritableSignal<boolean>).set(false);
        options[1].disabled.set(true);
        listbox.onKeydown(shift());
        listbox.onKeydown(down({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apple']);
        listbox.onKeydown(down({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apple', 'Banana']);
        listbox.onKeydown(up({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apple']);
        listbox.onKeydown(up({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });

      it('should select all options on Ctrl + A', () => {
        expect(listbox.inputs.value()).toEqual([]);
        listbox.onKeydown(a({control: true}));
        expect(listbox.inputs.value()).toEqual([
          'Apple',
          'Apricot',
          'Banana',
          'Blackberry',
          'Blueberry',
          'Cantaloupe',
          'Cherry',
          'Clementine',
          'Cranberry',
        ]);
      });

      it('should deselect all options on Ctrl + A if all options are selected', () => {
        expect(listbox.inputs.value()).toEqual([]);
        listbox.onKeydown(a({control: true}));
        listbox.onKeydown(a({control: true}));
        expect(listbox.inputs.value()).toEqual([]);
      });
    });

    describe('follows focus & multi select', () => {
      let listbox: TestListbox;
      let options: TestOption[];

      beforeEach(() => {
        const patterns = getDefaultPatterns({
          value: signal(['Apple']),
          multi: signal(true),
          selectionMode: signal('follow'),
        });
        listbox = patterns.listbox;
        options = patterns.options;
      });

      it('should select an option on navigation', () => {
        expect(listbox.inputs.value()).toEqual(['Apple']);
        listbox.onKeydown(down());
        expect(listbox.inputs.value()).toEqual(['Apricot']);
        listbox.onKeydown(up());
        expect(listbox.inputs.value()).toEqual(['Apple']);
        listbox.onKeydown(end());
        expect(listbox.inputs.value()).toEqual(['Cranberry']);
        listbox.onKeydown(home());
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });

      it('should navigate without selecting an option if the Ctrl key is pressed', () => {
        expect(listbox.inputs.value()).toEqual(['Apple']);
        listbox.onKeydown(down({control: true}));
        expect(listbox.inputs.value()).toEqual(['Apple']);
        listbox.onKeydown(up({control: true}));
        expect(listbox.inputs.value()).toEqual(['Apple']);
        listbox.onKeydown(end({control: true}));
        expect(listbox.inputs.value()).toEqual(['Apple']);
        listbox.onKeydown(home({control: true}));
      });

      it('should toggle an options selection state on Ctrl + Space', () => {
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(space({control: true}));
        expect(listbox.inputs.value()).toEqual(['Apple', 'Banana']);
      });

      it('should select a range of options on Shift + ArrowDown/ArrowUp', () => {
        listbox.onKeydown(shift());
        listbox.onKeydown(down({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apple', 'Apricot']);
        listbox.onKeydown(down({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apple', 'Apricot', 'Banana']);
        listbox.onKeydown(up({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apple', 'Apricot']);
        listbox.onKeydown(up({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });

      it('should not allow wrapping while Shift is held down', () => {
        listbox.selection.deselectAll();
        listbox.onKeydown(shift());
        listbox.onKeydown(up({shift: true}));
        expect(listbox.inputs.value()).toEqual([]);
      });

      it('should select a range of options on Shift + Space (or Enter)', () => {
        listbox.onKeydown(down());
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(shift());
        listbox.onKeydown(space({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apricot', 'Banana', 'Blackberry']);
      });

      it('should deselect options outside the range on subsequent on Shift + Space (or Enter)', () => {
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        expect(listbox.inputs.value()).toEqual(['Banana']);

        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(shift());
        listbox.onKeydown(space({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Banana', 'Blackberry', 'Blueberry']);

        listbox.onKeydown(up({control: true}));
        listbox.onKeydown(up({control: true}));
        listbox.onKeydown(up({control: true}));
        listbox.onKeydown(up({control: true}));
        listbox.onKeydown(shift());
        listbox.onKeydown(space({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Banana', 'Apricot', 'Apple']);
      });

      it('should select the focused option and all options up to the first option on Ctrl + Shift + Home', () => {
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down());
        listbox.onKeydown(shift());
        listbox.onKeydown(home({control: true, shift: true}));
        expect(listbox.inputs.value()).toEqual(['Blackberry', 'Banana', 'Apricot', 'Apple']);
      });

      it('should select the focused option and all options down to the last option on Ctrl + Shift + End', () => {
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down());
        listbox.onKeydown(shift());
        listbox.onKeydown(end({control: true, shift: true}));
        expect(listbox.inputs.value()).toEqual(['Cantaloupe', 'Cherry', 'Clementine', 'Cranberry']);
      });

      it('should not be able to change selection when in readonly mode', () => {
        const readonly = listbox.inputs.readonly as WritableSignal<boolean>;
        readonly.set(true);
        listbox.onKeydown(down());
        expect(listbox.inputs.value()).toEqual(['Apple']);

        listbox.onKeydown(up());
        expect(listbox.inputs.value()).toEqual(['Apple']);

        listbox.onKeydown(space({control: true}));
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });

      it('should not select disabled options', () => {
        options[2].disabled.set(true);
        (listbox.inputs.skipDisabled as WritableSignal<boolean>).set(false);
        expect(listbox.inputs.value()).toEqual(['Apple']);
        listbox.onKeydown(down());
        expect(listbox.inputs.value()).toEqual(['Apricot']);
        listbox.onKeydown(down());
        expect(listbox.inputs.value()).toEqual([]);
        listbox.onKeydown(down());
        expect(listbox.inputs.value()).toEqual(['Blackberry']);
      });

      it('should deselect all except one option on Ctrl + A if all options are selected', () => {
        listbox.onKeydown(a({control: true}));
        listbox.onKeydown(a({control: true}));
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });
    });
  });

  describe('Pointer Events', () => {
    function click(options: TestOption[], index: number, mods?: ModifierKeys) {
      return {
        target: options[index].element(),
        shiftKey: mods?.shift,
        ctrlKey: mods?.control,
      } as unknown as PointerEvent;
    }

    describe('follows focus & single select', () => {
      it('should select a single option on click', () => {
        const {listbox, options} = getDefaultPatterns({
          multi: signal(false),
          selectionMode: signal('follow'),
        });
        listbox.onPointerdown(click(options, 0));
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });
    });

    describe('explicit focus & single select', () => {
      it('should select an unselected option on click', () => {
        const {listbox, options} = getDefaultPatterns({
          multi: signal(false),
          selectionMode: signal('explicit'),
        });
        listbox.onPointerdown(click(options, 0));
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });

      it('should deselect a selected option on click', () => {
        const {listbox, options} = getDefaultPatterns({
          multi: signal(false),
          value: signal(['Apple']),
          selectionMode: signal('explicit'),
        });
        listbox.onPointerdown(click(options, 0));
        expect(listbox.inputs.value()).toEqual([]);
      });
    });

    describe('explicit focus & multi select', () => {
      it('should select an unselected option on click', () => {
        const {listbox, options} = getDefaultPatterns({
          multi: signal(true),
          selectionMode: signal('explicit'),
        });
        listbox.onPointerdown(click(options, 0));
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });

      it('should deselect a selected option on click', () => {
        const {listbox, options} = getDefaultPatterns({
          multi: signal(true),
          value: signal(['Apple']),
          selectionMode: signal('explicit'),
        });
        listbox.onPointerdown(click(options, 0));
        expect(listbox.inputs.value()).toEqual([]);
      });

      it('should select options from anchor on shift + click', () => {
        const {listbox, options} = getDefaultPatterns({
          multi: signal(true),
          selectionMode: signal('explicit'),
        });
        listbox.onPointerdown(click(options, 2));
        listbox.onKeydown(shift());
        listbox.onPointerdown(click(options, 5, {shift: true}));
        expect(listbox.inputs.value()).toEqual(['Banana', 'Blackberry', 'Blueberry', 'Cantaloupe']);
      });

      it('should deselect options outside the range on subsequent shift + clicks', () => {
        const {listbox, options} = getDefaultPatterns({
          multi: signal(true),
          selectionMode: signal('explicit'),
        });
        listbox.onPointerdown(click(options, 2));
        listbox.onKeydown(shift());
        listbox.onPointerdown(click(options, 5, {shift: true}));
        expect(listbox.inputs.value()).toEqual(['Banana', 'Blackberry', 'Blueberry', 'Cantaloupe']);
        listbox.onPointerdown(click(options, 0, {shift: true}));
        expect(listbox.inputs.value()).toEqual(['Banana', 'Apricot', 'Apple']);
      });
    });

    describe('follows focus & multi select', () => {
      it('should select a single option on click', () => {
        const {listbox, options} = getDefaultPatterns({
          multi: signal(true),
          selectionMode: signal('follow'),
        });
        listbox.onPointerdown(click(options, 0));
        expect(listbox.inputs.value()).toEqual(['Apple']);
        listbox.onPointerdown(click(options, 1));
        expect(listbox.inputs.value()).toEqual(['Apricot']);
        listbox.onPointerdown(click(options, 2));
        expect(listbox.inputs.value()).toEqual(['Banana']);
      });

      it('should select an unselected option on ctrl + click', () => {
        const {listbox, options} = getDefaultPatterns({
          multi: signal(true),
          selectionMode: signal('follow'),
        });
        listbox.onPointerdown(click(options, 0));
        expect(listbox.inputs.value()).toEqual(['Apple']);
        listbox.onPointerdown(click(options, 1, {control: true}));
        expect(listbox.inputs.value()).toEqual(['Apple', 'Apricot']);
        listbox.onPointerdown(click(options, 2, {control: true}));
        expect(listbox.inputs.value()).toEqual(['Apple', 'Apricot', 'Banana']);
      });

      it('should deselect a selected option on ctrl + click', () => {
        const {listbox, options} = getDefaultPatterns({
          multi: signal(true),
          selectionMode: signal('follow'),
        });
        listbox.onPointerdown(click(options, 0));
        expect(listbox.inputs.value()).toEqual(['Apple']);
        listbox.onPointerdown(click(options, 0, {control: true}));
        expect(listbox.inputs.value()).toEqual([]);
      });

      it('should select a range of options on shift + click', () => {
        const {listbox, options} = getDefaultPatterns({
          multi: signal(true),
          selectionMode: signal('follow'),
        });
        listbox.onPointerdown(click(options, 2));
        listbox.onKeydown(shift());
        listbox.onPointerdown(click(options, 5, {shift: true}));
        expect(listbox.inputs.value()).toEqual(['Banana', 'Blackberry', 'Blueberry', 'Cantaloupe']);
      });

      it('should deselect options outside the range on subsequent shift + clicks', () => {
        const {listbox, options} = getDefaultPatterns({
          multi: signal(true),
          selectionMode: signal('follow'),
        });
        listbox.onPointerdown(click(options, 2));
        listbox.onKeydown(shift());
        listbox.onPointerdown(click(options, 5, {shift: true}));
        expect(listbox.inputs.value()).toEqual(['Banana', 'Blackberry', 'Blueberry', 'Cantaloupe']);
        listbox.onPointerdown(click(options, 0, {shift: true}));
        expect(listbox.inputs.value()).toEqual(['Banana', 'Apricot', 'Apple']);
      });

      it('should select a range up to but not including a disabled option on shift + click', () => {
        const {listbox, options} = getDefaultPatterns({
          multi: signal(true),
          skipDisabled: signal(false),
          selectionMode: signal('follow'),
        });
        options[2].disabled.set(true);
        listbox.onPointerdown(click(options, 0));
        expect(listbox.inputs.value()).toEqual(['Apple']);

        listbox.onKeydown(shift());
        listbox.onPointerdown(click(options, 2, {shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apple', 'Apricot']);
        expect(listbox.inputs.activeIndex()).toEqual(2);
      });

      it('should do nothing on click if the option is disabled', () => {
        const {listbox, options} = getDefaultPatterns({
          multi: signal(true),
          skipDisabled: signal(true),
          selectionMode: signal('follow'),
        });
        options[2].disabled.set(true);
        listbox.onPointerdown(click(options, 0));
        expect(listbox.inputs.value()).toEqual(['Apple']);
        listbox.onKeydown(down({control: true}));
        expect(listbox.inputs.value()).toEqual(['Apple']);
        listbox.onPointerdown(click(options, 2));
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });
    });

    it('should only navigate when readonly', () => {
      const {listbox, options} = getDefaultPatterns({
        readonly: signal(true),
        selectionMode: signal('follow'),
      });
      listbox.onPointerdown(click(options, 0));
      expect(listbox.inputs.value()).toEqual([]);
      listbox.onPointerdown(click(options, 1));
      expect(listbox.inputs.value()).toEqual([]);
      listbox.onPointerdown(click(options, 2));
      expect(listbox.inputs.value()).toEqual([]);
    });

    it('should maintain the range selection between pointer and keyboard', () => {
      const {listbox, options} = getDefaultPatterns({
        multi: signal(true),
        selectionMode: signal('follow'),
      });
      listbox.onPointerdown(click(options, 2));
      listbox.onKeydown(down({control: true}));
      listbox.onKeydown(down({control: true}));

      listbox.onKeydown(shift());
      listbox.onKeydown(space({shift: true}));
      expect(listbox.inputs.value()).toEqual(['Banana', 'Blackberry', 'Blueberry']);
      listbox.onPointerdown(click(options, 0, {shift: true}));
      expect(listbox.inputs.value()).toEqual(['Banana', 'Apricot', 'Apple']);
    });

    it('should select a range from the currently focused option', () => {
      const {listbox, options} = getDefaultPatterns({
        multi: signal(true),
        selectionMode: signal('follow'),
      });
      listbox.onPointerdown(click(options, 0));
      expect(listbox.inputs.value()).toEqual(['Apple']);
      listbox.onKeydown(down({control: true}));
      listbox.onKeydown(down({control: true}));
      listbox.onKeydown(shift());
      listbox.onPointerdown(click(options, 4, {shift: true}));
      expect(listbox.inputs.value()).toEqual(['Apple', 'Banana', 'Blackberry', 'Blueberry']);
    });
  });

  describe('#setDefaultState', () => {
    it('should set the active index to the first option', () => {
      const {listbox} = getDefaultPatterns();
      listbox.setDefaultState();
      expect(listbox.inputs.activeIndex()).toBe(0);
    });

    it('should set the active index to the first focusable option', () => {
      const {listbox, options} = getDefaultPatterns({
        skipDisabled: signal(true),
      });
      options[0].disabled.set(true);
      listbox.setDefaultState();
      expect(listbox.inputs.activeIndex()).toBe(1);
    });

    it('should set the active index to the first selected option', () => {
      const {listbox} = getDefaultPatterns({
        value: signal(['Banana']),
        skipDisabled: signal(true),
      });
      listbox.setDefaultState();
      expect(listbox.inputs.activeIndex()).toBe(2);
    });

    it('should set the active index to the first focusable selected option', () => {
      const {listbox, options} = getDefaultPatterns({
        value: signal(['Banana', 'Blackberry']),
        skipDisabled: signal(true),
      });
      options[2].disabled.set(true);
      listbox.setDefaultState();
      expect(listbox.inputs.activeIndex()).toBe(3);
    });

    it('should set the active index to the first option if no selected option is focusable', () => {
      const {listbox, options} = getDefaultPatterns({
        value: signal(['Banana']),
        skipDisabled: signal(true),
      });
      options[2].disabled.set(true);
      listbox.setDefaultState();
      expect(listbox.inputs.activeIndex()).toBe(0);
    });
  });
});
