/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {SignalLike, WritableSignalLike} from '../signal-like/signal-like';
import {ListSelectionItem, ListSelection, ListSelectionInputs} from './list-selection';
import {ListNavigation, ListNavigationInputs} from '../list-navigation/list-navigation';

describe('List Selection', () => {
  interface TestItem<V> extends ListSelectionItem<V> {
    disabled: WritableSignalLike<boolean>;
  }

  function getItems<V>(values: V[]): SignalLike<TestItem<V>[]> {
    return signal(
      values.map((value, i) => ({
        index: signal(i),
        value: signal(value),
        disabled: signal(false),
        isAnchor: signal(false),
      })),
    );
  }

  function getNavigation<T extends TestItem<V>, V>(
    items: SignalLike<T[]>,
    args: Partial<ListNavigationInputs<T>> = {},
  ): ListNavigation<T> {
    return new ListNavigation({
      items,
      wrap: signal(false),
      activeIndex: signal(0),
      skipDisabled: signal(false),
      textDirection: signal('ltr'),
      orientation: signal('vertical'),
      ...args,
    });
  }

  function getSelection<T extends TestItem<V>, V>(
    items: SignalLike<T[]>,
    navigation: ListNavigation<T>,
    args: Partial<ListSelectionInputs<T, V>> = {},
  ): ListSelection<T, V> {
    return new ListSelection({
      items,
      navigation,
      value: signal<V[]>([]),
      multi: signal(true),
      selectionMode: signal('explicit'),
      ...args,
    });
  }

  describe('#select', () => {
    it('should select an item', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      selection.select(); // [0]
      expect(selection.inputs.value()).toEqual([0]);
    });

    it('should select multiple options', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      selection.select(); // [0]
      nav.next();
      selection.select(); // [0, 1]

      expect(selection.inputs.value()).toEqual([0, 1]);
    });

    it('should not select multiple options', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav, {
        multi: signal(false),
      });

      selection.select(); // [0]
      nav.next();
      selection.select(); // [1]

      expect(selection.inputs.value()).toEqual([1]);
    });

    it('should not select disabled items', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      items()[0].disabled.set(true);

      selection.select(); // []
      expect(selection.inputs.value()).toEqual([]);
    });

    it('should do nothing to already selected items', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      selection.select(); // [0]
      selection.select(); // [0]

      expect(selection.inputs.value()).toEqual([0]);
    });
  });

  describe('#deselect', () => {
    it('should deselect an item', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      selection.deselect(); // []
      expect(selection.inputs.value().length).toBe(0);
    });

    it('should not deselect disabled items', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      selection.select(); // [0]
      items()[0].disabled.set(true);
      selection.deselect(); // [0]

      expect(selection.inputs.value()).toEqual([0]);
    });
  });

  describe('#toggle', () => {
    it('should select an unselected item', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      selection.toggle(); // [0]
      expect(selection.inputs.value()).toEqual([0]);
    });

    it('should deselect a selected item', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      selection.select(); // [0]
      selection.toggle(); // []
      expect(selection.inputs.value().length).toBe(0);
    });
  });

  describe('#toggleOne', () => {
    it('should select an unselected item', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      selection.toggleOne(); // [0]
      expect(selection.inputs.value()).toEqual([0]);
    });

    it('should deselect a selected item', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      selection.select(); // [0]
      selection.toggleOne(); // []
      expect(selection.inputs.value().length).toBe(0);
    });

    it('should only leave one item selected', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      selection.select(); // [0]
      nav.next();
      selection.toggleOne(); // [1]
      expect(selection.inputs.value()).toEqual([1]);
    });
  });

  describe('#selectAll', () => {
    it('should select all items', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      selection.selectAll();
      expect(selection.inputs.value()).toEqual([0, 1, 2, 3, 4]);
    });

    it('should do nothing if a list is not multiselectable', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      selection.selectAll();
      expect(selection.inputs.value()).toEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('#deselectAll', () => {
    it('should deselect all items', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      selection.deselectAll(); // []
      expect(selection.inputs.value().length).toBe(0);
    });
  });

  describe('#toggleAll', () => {
    it('should select all items', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      selection.toggleAll();
      expect(selection.inputs.value()).toEqual([0, 1, 2, 3, 4]);
    });

    it('should deselect all if all items are selected', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      selection.selectAll();
      selection.toggleAll();
      expect(selection.inputs.value()).toEqual([]);
    });

    it('should ignore disabled items when determining if all items are selected', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      items()[0].disabled.set(true);
      selection.toggleAll();
      expect(selection.inputs.value()).toEqual([1, 2, 3, 4]);
      selection.toggleAll();
      expect(selection.inputs.value()).toEqual([]);
    });
  });

  describe('#selectOne', () => {
    it('should select a single item', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      selection.selectOne(); // [0]
      nav.next();
      selection.selectOne(); // [1]
      expect(selection.inputs.value()).toEqual([1]);
    });

    it('should not select disabled items', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      items()[0].disabled.set(true);

      selection.select(); // []
      expect(selection.inputs.value()).toEqual([]);
    });

    it('should do nothing to already selected items', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      selection.selectOne(); // [0]
      selection.selectOne(); // [0]

      expect(selection.inputs.value()).toEqual([0]);
    });
  });

  describe('#selectRange', () => {
    it('should select all items from an anchor at a lower index', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      selection.select(); // [0]
      nav.next();
      nav.next();
      selection.selectRange(); // [0, 1, 2]

      expect(selection.inputs.value()).toEqual([0, 1, 2]);
    });

    it('should select all items from an anchor at a higher index', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items, {
        activeIndex: signal(3),
      });
      const selection = getSelection(items, nav);

      selection.select(); // [3]
      nav.prev();
      nav.prev();
      selection.selectRange(); // [3, 2, 1]

      expect(selection.inputs.value()).toEqual([3, 2, 1]);
    });

    it('should deselect items within the range when the range is changed', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      nav.next();
      nav.next();
      selection.select(); // [2]
      expect(selection.inputs.value()).toEqual([2]);

      nav.next();
      nav.next();
      selection.selectRange(); // [2, 3, 4]
      expect(selection.inputs.value()).toEqual([2, 3, 4]);

      nav.first();
      selection.selectRange(); // [2, 1, 0]
      expect(selection.inputs.value()).toEqual([2, 1, 0]);
    });

    it('should not select a disabled item', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      items()[1].disabled.set(true);

      selection.select(); // [0]
      expect(selection.inputs.value()).toEqual([0]);

      nav.next();
      selection.selectRange(); // [0]
      expect(selection.inputs.value()).toEqual([0]);

      nav.next();
      selection.selectRange(); // [0, 2]
      expect(selection.inputs.value()).toEqual([0, 2]);
    });

    it('should not deselect a disabled item', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      selection.select(items()[1]);
      items()[1].disabled.set(true);

      selection.select(); // [0]
      expect(selection.inputs.value()).toEqual([1, 0]);

      nav.next();
      nav.next();
      selection.selectRange(); // [0, 1, 2]
      expect(selection.inputs.value()).toEqual([1, 0, 2]);

      nav.prev();
      nav.prev();
      selection.selectRange(); // [0]
      expect(selection.inputs.value()).toEqual([1, 0]);
    });
  });

  describe('#beginRangeSelection', () => {
    it('should set where a range is starting from', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      nav.next();
      nav.next();
      selection.beginRangeSelection();
      expect(selection.inputs.value()).toEqual([]);
      nav.next();
      nav.next();
      selection.selectRange(); // [2, 3, 4]
      expect(selection.inputs.value()).toEqual([2, 3, 4]);
    });

    it('should be able to select a range starting on a disabled item', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      items()[0].disabled.set(true);
      selection.beginRangeSelection(0);
      nav.next();
      nav.next();
      selection.selectRange();
      expect(selection.inputs.value()).toEqual([1, 2]);
    });
  });
});
