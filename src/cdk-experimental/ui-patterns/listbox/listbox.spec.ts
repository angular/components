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

type TestInputs = ListboxInputs<string>;
type TestOption = OptionPattern<string>;
type TestListbox = ListboxPattern<string>;

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

  describe('Navigation', () => {
    it('should navigate next on ArrowDown', () => {
      const {listbox} = getDefaultPatterns();
      const event = createKeyboardEvent('keydown', 40, 'ArrowDown');
      expect(listbox.inputs.activeIndex()).toBe(0);
      listbox.onKeydown(event);
      expect(listbox.inputs.activeIndex()).toBe(1);
    });

    it('should navigate prev on ArrowUp', () => {
      const event = createKeyboardEvent('keydown', 38, 'ArrowUp');
      const {listbox} = getDefaultPatterns({
        activeIndex: signal(1),
      });
      expect(listbox.inputs.activeIndex()).toBe(1);
      listbox.onKeydown(event);
      expect(listbox.inputs.activeIndex()).toBe(0);
    });

    it('should navigate next on ArrowRight (horizontal)', () => {
      const event = createKeyboardEvent('keydown', 39, 'ArrowRight');
      const {listbox} = getDefaultPatterns({
        orientation: signal('horizontal'),
      });
      expect(listbox.inputs.activeIndex()).toBe(0);
      listbox.onKeydown(event);
      expect(listbox.inputs.activeIndex()).toBe(1);
    });

    it('should navigate prev on ArrowLeft (horizontal)', () => {
      const event = createKeyboardEvent('keydown', 37, 'ArrowLeft');
      const {listbox} = getDefaultPatterns({
        activeIndex: signal(1),
        orientation: signal('horizontal'),
      });
      expect(listbox.inputs.activeIndex()).toBe(1);
      listbox.onKeydown(event);
      expect(listbox.inputs.activeIndex()).toBe(0);
    });

    it('should navigate next on ArrowLeft (horizontal & rtl)', () => {
      const event = createKeyboardEvent('keydown', 38, 'ArrowLeft');
      const {listbox} = getDefaultPatterns({
        textDirection: signal('rtl'),
        orientation: signal('horizontal'),
      });
      expect(listbox.inputs.activeIndex()).toBe(0);
      listbox.onKeydown(event);
      expect(listbox.inputs.activeIndex()).toBe(1);
    });

    it('should navigate prev on ArrowRight (horizontal & rtl)', () => {
      const event = createKeyboardEvent('keydown', 39, 'ArrowRight');
      const {listbox} = getDefaultPatterns({
        activeIndex: signal(1),
        textDirection: signal('rtl'),
        orientation: signal('horizontal'),
      });
      expect(listbox.inputs.activeIndex()).toBe(1);
      listbox.onKeydown(event);
      expect(listbox.inputs.activeIndex()).toBe(0);
    });

    it('should navigate to the first option on Home', () => {
      const event = createKeyboardEvent('keydown', 36, 'Home');
      const {listbox} = getDefaultPatterns({
        activeIndex: signal(8),
      });
      expect(listbox.inputs.activeIndex()).toBe(8);
      listbox.onKeydown(event);
      expect(listbox.inputs.activeIndex()).toBe(0);
    });

    it('should navigate to the last option on End', () => {
      const event = createKeyboardEvent('keydown', 35, 'End');
      const {listbox} = getDefaultPatterns();
      expect(listbox.inputs.activeIndex()).toBe(0);
      listbox.onKeydown(event);
      expect(listbox.inputs.activeIndex()).toBe(8);
    });
  });
});
