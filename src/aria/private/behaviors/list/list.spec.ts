/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignalLike} from '../signal-like/signal-like';
import {List, ListItem, ListInputs} from './list';

type TestItem<V> = ListItem<V> & {
  disabled: WritableSignalLike<boolean>;
  selectable: WritableSignalLike<boolean>;
  searchTerm: WritableSignalLike<string>;
  value: WritableSignalLike<V>;
};

type TestInputs<V> = ListInputs<TestItem<V>, V>;
type TestList<V> = List<TestItem<V>, V>;

describe('List Behavior', () => {
  function getList<V>(inputs: Partial<TestInputs<V>> & Pick<TestInputs<V>, 'items'>): TestList<V> {
    return new List({
      values: inputs.values ?? signal([]),
      activeItem: signal(undefined),
      typeaheadDelay: inputs.typeaheadDelay ?? signal(500),
      wrap: inputs.wrap ?? signal(true),
      disabled: inputs.disabled ?? signal(false),
      multi: inputs.multi ?? signal(false),
      textDirection: inputs.textDirection ?? signal('ltr'),
      orientation: inputs.orientation ?? signal('vertical'),
      element: signal({focus: () => {}} as HTMLElement),
      focusMode: inputs.focusMode ?? signal('roving'),
      softDisabled: inputs.softDisabled ?? signal(true),
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
      selectable: signal(true),
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
    it('should set the list tab index to 0', () => {
      const {list} = getDefaultPatterns({focusMode: signal('activedescendant')});
      expect(list.tabIndex()).toBe(0);
    });

    it('should set the active descendant to the active item id', () => {
      const {list} = getDefaultPatterns({focusMode: signal('activedescendant')});
      expect(list.activeDescendant()).toBe('item-0');
      list.next();
      expect(list.activeDescendant()).toBe('item-1');
    });

    it('should set item tab index to -1', () => {
      const {list, items} = getDefaultPatterns({focusMode: signal('activedescendant')});
      expect(list.getItemTabindex(items[0])).toBe(-1);
    });
  });

  describe('with focusMode: "roving"', () => {
    it('should set the list tab index to -1', () => {
      const {list} = getDefaultPatterns({focusMode: signal('roving')});
      expect(list.tabIndex()).toBe(-1);
    });

    it('should not set the active descendant', () => {
      const {list} = getDefaultPatterns({focusMode: signal('roving')});
      expect(list.activeDescendant()).toBeUndefined();
    });

    it('should set the active item tab index to 0 and others to -1', () => {
      const {list, items} = getDefaultPatterns({focusMode: signal('roving')});
      expect(list.getItemTabindex(items[0])).toBe(0);
      expect(list.getItemTabindex(items[1])).toBe(-1);
      list.next();
      expect(list.getItemTabindex(items[0])).toBe(-1);
      expect(list.getItemTabindex(items[1])).toBe(0);
    });
  });

  describe('with disabled: true and softDisabled is false', () => {
    let list: TestList<string>;

    beforeEach(() => {
      const patterns = getDefaultPatterns({disabled: signal(true), softDisabled: signal(false)});
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
      expect(list.inputs.values()).toEqual([]);
    });

    it('should have a tab index of 0', () => {
      expect(list.tabIndex()).toBe(0);
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
      expect(list.inputs.values()).toEqual([]);
    });

    it('should have a tab index of 0', () => {
      expect(list.tabIndex()).toBe(0);
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

    it('should skip disabled items when softDisabled is false', () => {
      const {list, items} = getDefaultPatterns({softDisabled: signal(false)});
      items[1].disabled.set(true); // Disable second item
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
      list.next();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[2]); // Should skip to 'Banana'
      list.prev();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]); // Should skip back to 'Apple'
    });

    it('should not skip disabled items when navigating', () => {
      const {list, items} = getDefaultPatterns();
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
          values: signal([]),
          multi: signal(false),
        });
        list = patterns.list;
        items = patterns.items;
      });

      it('should not select when navigating', () => {
        list.next();
        expect(list.inputs.values()).toEqual([]);
      });

      it('should select an item when navigating with selectOne:true', () => {
        list.next({selectOne: true});
        expect(list.inputs.values()).toEqual(['Apricot']);
      });

      it('should not select a non-selectable item when navigating with selectOne:true', () => {
        items[1].selectable.set(false);
        list.next({selectOne: true});
        expect(list.inputs.values()).toEqual([]);
      });

      it('should toggle an item when navigating with toggle:true', () => {
        list.goto(items[1], {selectOne: true});
        expect(list.inputs.values()).toEqual(['Apricot']);

        list.goto(items[1], {toggle: true});
        expect(list.inputs.values()).toEqual([]);
      });

      it('should not toggle a non-selectable item when navigating with toggle:true', () => {
        items[1].selectable.set(false);
        list.goto(items[1], {toggle: true});
        expect(list.inputs.values()).toEqual([]);
      });

      it('should only allow one selected item', () => {
        list.next({selectOne: true});
        expect(list.inputs.values()).toEqual(['Apricot']);
        list.next({selectOne: true});
        expect(list.inputs.values()).toEqual(['Banana']);
      });
    });

    describe('multi select', () => {
      let list: TestList<string>;
      let items: TestItem<string>[];

      beforeEach(() => {
        const patterns = getDefaultPatterns({
          values: signal([]),
          multi: signal(true),
        });
        list = patterns.list;
        items = patterns.items;
      });

      it('should not select when navigating', () => {
        list.next();
        expect(list.inputs.values()).toEqual([]);
      });

      it('should select an item with toggle:true', () => {
        list.next({toggle: true});
        expect(list.inputs.values()).toEqual(['Apricot']);
      });

      it('should not select a non-selectable item with toggle:true', () => {
        items[1].selectable.set(false);
        list.next({toggle: true});
        expect(list.inputs.values()).toEqual([]);
      });

      it('should allow multiple selected items', () => {
        list.next({toggle: true});
        list.next({toggle: true});
        expect(list.inputs.values()).toEqual(['Apricot', 'Banana']);
      });

      it('should select a range of items with selectRange:true', () => {
        list.anchor(0);
        list.next({selectRange: true});
        expect(list.inputs.values()).toEqual(['Apple', 'Apricot']);
        list.next({selectRange: true});
        expect(list.inputs.values()).toEqual(['Apple', 'Apricot', 'Banana']);
        list.prev({selectRange: true});
        expect(list.inputs.values()).toEqual(['Apple', 'Apricot']);
        list.prev({selectRange: true});
        expect(list.inputs.values()).toEqual(['Apple']);
      });

      it('should not wrap when range selecting', () => {
        list.anchor(0);
        list.prev({selectRange: true});
        expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
        expect(list.inputs.values()).toEqual([]);
      });

      it('should not select disabled items in a range', () => {
        items[1].disabled.set(true);
        list.anchor(0);
        list.goto(items[3], {selectRange: true});
        expect(list.inputs.values()).toEqual(['Apple', 'Banana', 'Blackberry']);
      });

      it('should not select non-selectable items in a range', () => {
        items[1].selectable.set(false);
        list.anchor(0);
        list.goto(items[3], {selectRange: true});
        expect(list.inputs.values()).toEqual(['Apple', 'Banana', 'Blackberry']);
      });
    });
  });

  describe('Typeahead', () => {
    function delay(amount: number) {
      return new Promise(resolve => setTimeout(resolve, amount));
    }

    it('should navigate to an item via typeahead', async () => {
      const {list} = getDefaultPatterns();
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[0]);
      list.search('b');
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[2]); // Banana
      list.search('l');
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[3]); // Blackberry
      list.search('u');
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[4]); // Blueberry
      await delay(500);

      list.search('c');
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[5]); // Cantaloupe
    });

    it('should respect typeaheadDelay', async () => {
      const {list} = getDefaultPatterns({typeaheadDelay: signal(100)});
      list.search('b');
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[2]); // Banana
      await delay(50); // Less than delay
      list.search('l');
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[3]); // Blackberry
      await delay(101); // More than delay
      list.search('c');
      expect(list.inputs.activeItem()).toBe(list.inputs.items()[5]); // Cantaloupe
    });

    it('should select an item via typeahead', () => {
      const {list} = getDefaultPatterns({multi: signal(false)});
      list.search('b', {selectOne: true});
      expect(list.inputs.values()).toEqual(['Banana']);
    });

    it('should not select a non-selectable item via typeahead', () => {
      const {list, items} = getDefaultPatterns({multi: signal(false)});
      items[2].selectable.set(false); // 'Banana'
      list.search('b', {selectOne: true});
      expect(list.inputs.values()).toEqual([]);
    });
  });
});
