/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignal} from '@angular/core';
import {List, ListItem, ListInputs} from './list';
import {fakeAsync, tick} from '@angular/core/testing';

type TestItem<V> = ListItem<V> & {
  disabled: WritableSignal<boolean>;
  searchTerm: WritableSignal<string>;
  value: WritableSignal<V>;
};

type TestInputs<V> = ListInputs<TestItem<V>, V>;
type TestList<V> = List<TestItem<V>, V>;

describe('List Behavior', () => {
  function getList<V>(inputs: Partial<TestInputs<V>> & Pick<TestInputs<V>, 'items'>): TestList<V> {
    return new List({
      value: inputs.value ?? signal([]),
      activeItem: signal(undefined),
      typeaheadDelay: inputs.typeaheadDelay ?? signal(0.5),
      wrap: inputs.wrap ?? signal(true),
      disabled: inputs.disabled ?? signal(false),
      multi: inputs.multi ?? signal(false),
      textDirection: inputs.textDirection ?? signal('ltr'),
      orientation: inputs.orientation ?? signal('vertical'),
      focusMode: inputs.focusMode ?? signal('roving'),
      skipDisabled: inputs.skipDisabled ?? signal(true),
      selectionMode: signal('explicit'),
      ...inputs,
    });
  }

  function getItems<V>(values: V[]): TestItem<V>[] {
    return values.map((value, index) => ({
      value: signal(value),
      id: signal(`item-${index}`),
      element: signal(document.createElement('div')),
      disabled: signal(false),
      searchTerm: signal(String(value)),
      index: signal(index),
    }));
  }

  function getListAndItems<V>(values: V[], inputs: Partial<TestInputs<V>> = {}) {
    const items = signal<TestItem<V>[]>([]);
    const list = getList<V>({...inputs, items});
    items.set(getItems(values));
    list.inputs.activeItem.set(list.inputs.items()[0]);
    return {list, items: items()};
  }

  function getDefaultPatterns(inputs: Partial<TestInputs<string>> = {}) {
    return getListAndItems(
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

  describe('with focusMode: "activedescendant"', () => {
    it('should set the list tabindex to 0', () => {
      const {list} = getDefaultPatterns({focusMode: signal('activedescendant')});
      expect(list.tabindex()).toBe(0);
    });

    it('should set the active descendant to the active item id', () => {
      const {list} = getDefaultPatterns({focusMode: signal('activedescendant')});
      expect(list.activedescendant()).toBe('item-0');
      list.next();
      expect(list.activedescendant()).toBe('item-1');
    });

    it('should set item tabindex to -1', () => {
      const {list, items} = getDefaultPatterns({focusMode: signal('activedescendant')});
      expect(list.getItemTabindex(items[0])).toBe(-1);
    });
  });

  describe('with focusMode: "roving"', () => {
    it('should set the list tabindex to -1', () => {
      const {list} = getDefaultPatterns({focusMode: signal('roving')});
      expect(list.tabindex()).toBe(-1);
    });

    it('should not set the active descendant', () => {
      const {list} = getDefaultPatterns({focusMode: signal('roving')});
      expect(list.activedescendant()).toBeUndefined();
    });

    it('should set the active item tabindex to 0 and others to -1', () => {
      const {list, items} = getDefaultPatterns({focusMode: signal('roving')});
      expect(list.getItemTabindex(items[0])).toBe(0);
      expect(list.getItemTabindex(items[1])).toBe(-1);
      list.next();
      expect(list.getItemTabindex(items[0])).toBe(-1);
      expect(list.getItemTabindex(items[1])).toBe(0);
    });
  });

  describe('with disabled: true', () => {
    let list: TestList<string>;

    beforeEach(() => {
      const patterns = getDefaultPatterns({disabled: signal(true)});
      list = patterns.list;
    });

    it('should report disabled state', () => {
      expect(list.disabled()).toBe(true);
    });

    it('should not change active index on navigation', () => {
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
      list.next();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
      list.last();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
    });

    it('should not select items', () => {
      list.next({selectOne: true});
      expect(list.inputs.value()).toEqual([]);
    });

    it('should have a tabindex of 0', () => {
      expect(list.tabindex()).toBe(0);
    });
  });

  describe('Navigation', () => {
    it('should navigate to the next item with next()', () => {
      const {list} = getDefaultPatterns();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
      list.next();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[1]);
    });

    it('should navigate to the previous item with prev()', () => {
      const {list, items} = getDefaultPatterns();
      list.inputs.activeItem.set(items[1]);
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[1]);
      list.prev();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
    });

    it('should navigate to the first item with first()', () => {
      const {list, items} = getDefaultPatterns();
      list.inputs.activeItem.set(items[8]);
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[8]);
      list.first();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
    });

    it('should navigate to the last item with last()', () => {
      const {list} = getDefaultPatterns();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
      list.last();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[8]);
    });

    it('should skip disabled items when navigating', () => {
      const {list, items} = getDefaultPatterns();
      items[1].disabled.set(true); // Disable second item
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
      list.next();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[2]); // Should skip to 'Banana'
      list.prev();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]); // Should skip back to 'Apple'
    });

    it('should not skip disabled items when skipDisabled is false', () => {
      const {list, items} = getDefaultPatterns({skipDisabled: signal(false)});
      items[1].disabled.set(true); // Disable second item
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
      list.next();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[1]); // Should land on second item even though it's disabled
    });

    it('should not wrap with wrap: false', () => {
      const {list} = getDefaultPatterns({wrap: signal(false)});
      list.last();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[8]);
      list.next();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[8]); // Stays at the end
      list.first();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
      list.prev();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]); // Stays at the beginning
    });

    // The navigation behavior itself doesn't change for horizontal, but we test it for completeness.
    it('should navigate with orientation: "horizontal"', () => {
      const {list} = getDefaultPatterns({orientation: signal('horizontal')});
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
      list.next();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[1]);
      list.prev();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
    });
  });

  describe('Selection', () => {
    describe('single select', () => {
      let list: TestList<string>;
      let items: TestItem<string>[];

      beforeEach(() => {
        const patterns = getDefaultPatterns({
          value: signal([]),
          multi: signal(false),
        });
        list = patterns.list;
        items = patterns.items;
      });

      it('should not select when navigating', () => {
        list.next();
        expect(list.inputs.value()).toEqual([]);
      });

      it('should select an item when navigating with selectOne:true', () => {
        list.next({selectOne: true});
        expect(list.inputs.value()).toEqual(['Apricot']);
      });

      it('should toggle an item when navigating with toggle:true', () => {
        list.goto(items[1], {selectOne: true});
        expect(list.inputs.value()).toEqual(['Apricot']);

        list.goto(items[1], {toggle: true});
        expect(list.inputs.value()).toEqual([]);
      });

      it('should only allow one selected item', () => {
        list.next({selectOne: true});
        expect(list.inputs.value()).toEqual(['Apricot']);
        list.next({selectOne: true});
        expect(list.inputs.value()).toEqual(['Banana']);
      });
    });

    describe('multi select', () => {
      let list: TestList<string>;
      let items: TestItem<string>[];

      beforeEach(() => {
        const patterns = getDefaultPatterns({
          value: signal([]),
          multi: signal(true),
        });
        list = patterns.list;
        items = patterns.items;
      });

      it('should not select when navigating', () => {
        list.next();
        expect(list.inputs.value()).toEqual([]);
      });

      it('should select an item with toggle:true', () => {
        list.next({toggle: true});
        expect(list.inputs.value()).toEqual(['Apricot']);
      });

      it('should allow multiple selected items', () => {
        list.next({toggle: true});
        list.next({toggle: true});
        expect(list.inputs.value()).toEqual(['Apricot', 'Banana']);
      });

      it('should select a range of items with selectRange:true', () => {
        list.anchor(0);
        list.next({selectRange: true});
        expect(list.inputs.value()).toEqual(['Apple', 'Apricot']);
        list.next({selectRange: true});
        expect(list.inputs.value()).toEqual(['Apple', 'Apricot', 'Banana']);
        list.prev({selectRange: true});
        expect(list.inputs.value()).toEqual(['Apple', 'Apricot']);
        list.prev({selectRange: true});
        expect(list.inputs.value()).toEqual(['Apple']);
      });

      it('should not wrap when range selecting', () => {
        list.anchor(0);
        list.prev({selectRange: true});
        expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
        expect(list.inputs.value()).toEqual([]);
      });

      it('should not select disabled items in a range', () => {
        items[1].disabled.set(true);
        list.anchor(0);
        list.goto(items[3], {selectRange: true});
        expect(list.inputs.value()).toEqual(['Apple', 'Banana', 'Blackberry']);
      });
    });
  });

  describe('Typeahead', () => {
    it('should navigate to an item via typeahead', fakeAsync(() => {
      const {list} = getDefaultPatterns();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
      list.search('b');
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[2]); // Banana
      list.search('l');
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[3]); // Blackberry
      list.search('u');
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[4]); // Blueberry

      tick(500); // Default delay

      list.search('c');
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[5]); // Cantaloupe
    }));

    it('should respect typeaheadDelay', fakeAsync(() => {
      const {list} = getDefaultPatterns({typeaheadDelay: signal(0.1)});
      list.search('b');
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[2]); // Banana
      tick(50); // Less than delay
      list.search('l');
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[3]); // Blackberry
      tick(101); // More than delay
      list.search('c');
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[5]); // Cantaloupe
    }));

    it('should select an item via typeahead', () => {
      const {list} = getDefaultPatterns({multi: signal(false)});
      list.search('b', {selectOne: true});
      expect(list.inputs.value()).toEqual(['Banana']);
    });
  });
});
