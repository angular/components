/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {ListboxInputs, ListboxPattern} from './listbox';
import {OptionPattern} from './option';
import {createKeyboardEvent} from '@angular/cdk/testing/private';
import {ModifierKeys} from '@angular/cdk/testing';

type TestInputs = ListboxInputs<string>;
type TestOption = OptionPattern<string>;
type TestListbox = ListboxPattern<string>;

const up = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 38, 'ArrowUp', mods);
const down = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 40, 'ArrowDown', mods);
const left = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 37, 'ArrowLeft', mods);
const right = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 39, 'ArrowRight', mods);
const home = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 36, 'Home', mods);
const end = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 35, 'End', mods);
const space = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 32, ' ', mods);
const enter = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 13, 'Enter', mods);

describe('Listbox Pattern', () => {
  function getListbox(inputs: Partial<TestInputs> & Pick<TestInputs, 'items'>) {
    return new ListboxPattern({
      items: inputs.items,
      value: inputs.value ?? signal([]),
      activeIndex: inputs.activeIndex ?? signal(0),
      typeaheadDelay: inputs.typeaheadDelay ?? signal(0.5),
      wrap: inputs.wrap ?? signal(true),
      disabled: inputs.disabled ?? signal(false),
      skipDisabled: inputs.skipDisabled ?? signal(true),
      multiselectable: inputs.multiselectable ?? signal(false),
      focusMode: inputs.focusMode ?? signal('roving'),
      textDirection: inputs.textDirection ?? signal('ltr'),
      orientation: inputs.orientation ?? signal('vertical'),
      selectionMode: inputs.selectionMode ?? signal('explicit'),
    });
  }

  function getOptions(listbox: TestListbox, values: string[]): TestOption[] {
    return values.map((value, index) => {
      return new OptionPattern({
        value: signal(value),
        id: signal(`option-${index}`),
        disabled: signal(false),
        searchTerm: signal(value),
        listbox: signal(listbox),
        element: signal({focus: () => {}} as HTMLElement),
      });
    });
  }

  function getPatterns(values: string[], inputs: Partial<TestInputs> = {}) {
    const options = signal<TestOption[]>([]);
    const listbox = getListbox({...inputs, items: options});
    options.set(getOptions(listbox, values));
    return {listbox, options};
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
  });

  describe('Keyboard Selection', () => {
    describe('follows focus & single select', () => {
      it('should select an option on navigation', () => {
        const {listbox} = getDefaultPatterns({
          value: signal(['Apple']),
          multiselectable: signal(false),
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
    });

    describe('explicit focus & single select', () => {
      let listbox: TestListbox;

      beforeEach(() => {
        listbox = getDefaultPatterns({
          value: signal([]),
          selectionMode: signal('explicit'),
          multiselectable: signal(false),
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
    });

    describe('explicit focus & multi select', () => {
      let listbox: TestListbox;

      beforeEach(() => {
        listbox = getDefaultPatterns({
          value: signal([]),
          selectionMode: signal('explicit'),
          multiselectable: signal(true),
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

      it('should allow multiple selected options', () => {
        listbox.onKeydown(enter());
        listbox.onKeydown(down());
        listbox.onKeydown(enter());
        expect(listbox.inputs.value()).toEqual(['Apple', 'Apricot']);
      });

      it('should toggle the selected state of the next option on Shift + ArrowDown', () => {
        listbox.onKeydown(down({shift: true}));
        listbox.onKeydown(down({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apricot', 'Banana']);
      });

      it('should toggle the selected state of the next option on Shift + ArrowUp', () => {
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(up({shift: true}));
        listbox.onKeydown(up({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apricot', 'Apple']);
      });

      it('should select contiguous items from the most recently selected item to the focused item on Shift + Space (or Enter)', () => {
        listbox.onKeydown(down());
        listbox.onKeydown(space()); // Apricot
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(space({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apricot', 'Banana', 'Blackberry']);
      });

      it('should select the focused option and all options up to the first option on Ctrl + Shift + Home', () => {
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(home({control: true, shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apple', 'Apricot', 'Banana', 'Blackberry']);
      });

      it('should select the focused option and all options down to the last option on Ctrl + Shift + End', () => {
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(end({control: true, shift: true}));
        expect(listbox.inputs.value()).toEqual(['Cantaloupe', 'Cherry', 'Clementine', 'Cranberry']);
      });
    });

    describe('follows focus & multi select', () => {
      let listbox: TestListbox;

      beforeEach(() => {
        listbox = getDefaultPatterns({
          value: signal(['Apple']),
          multiselectable: signal(true),
          selectionMode: signal('follow'),
        }).listbox;
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

      it('should toggle the selected state of the next option on Shift + ArrowDown', () => {
        listbox.onKeydown(down({shift: true}));
        listbox.onKeydown(down({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Apple', 'Apricot', 'Banana']);
      });

      it('should toggle the selected state of the next option on Shift + ArrowUp', () => {
        listbox.onKeydown(down());
        listbox.onKeydown(down());
        listbox.onKeydown(up({shift: true}));
        listbox.onKeydown(up({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Banana', 'Apricot', 'Apple']);
      });

      it('should select contiguous items from the most recently selected item to the focused item on Shift + Space (or Enter)', () => {
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down()); // Blackberry
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(space({shift: true}));
        expect(listbox.inputs.value()).toEqual(['Blackberry', 'Blueberry', 'Cantaloupe']);
      });

      it('should select the focused option and all options up to the first option on Ctrl + Shift + Home', () => {
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down());
        listbox.onKeydown(home({control: true, shift: true}));
        expect(listbox.inputs.value()).toEqual(['Blackberry', 'Apple', 'Apricot', 'Banana']);
      });

      it('should select the focused option and all options down to the last option on Ctrl + Shift + End', () => {
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down({control: true}));
        listbox.onKeydown(down());
        listbox.onKeydown(end({control: true, shift: true}));
        expect(listbox.inputs.value()).toEqual(['Cantaloupe', 'Cherry', 'Clementine', 'Cranberry']);
      });
    });
  });
});
