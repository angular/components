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
      multiselectable: signal(true),
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
        multiselectable: signal(false),
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

  describe('#selectFromAnchor', () => {
    it('should select all items from an anchor at a lower index', () => {
      const items = getItems([0, 1, 2, 3, 4]);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      selection.select(); // [0]
      nav.next();
      nav.next();
      selection.selectFromPrevSelectedItem(); // [0, 1, 2]

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
      selection.selectFromPrevSelectedItem(); // [3, 1, 2]

      // TODO(wagnermaciel): Order the values when inserting them.
      expect(selection.inputs.value()).toEqual([3, 1, 2]);
    });
  });
});
