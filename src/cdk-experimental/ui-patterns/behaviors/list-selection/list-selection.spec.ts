/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal, signal, WritableSignal} from '@angular/core';
import {ListSelectionItem, ListSelection, ListSelectionInputs} from './list-selection';
import {ListNavigation, ListNavigationInputs} from '../list-navigation/list-navigation';

describe('List Selection', () => {
  interface TestItem extends ListSelectionItem {
    disabled: WritableSignal<boolean>;
  }

  function getItems(length: number): Signal<TestItem[]> {
    return signal(
      Array.from({length}).map((_, i) => ({
        index: signal(i),
        id: signal(`${i}`),
        disabled: signal(false),
        isAnchor: signal(false),
      })),
    );
  }

  function getNavigation<T extends TestItem>(
    items: Signal<T[]>,
    args: Partial<ListNavigationInputs<T>> = {},
  ): ListNavigation<T> {
    return new ListNavigation({
      items,
      wrap: signal(false),
      activeIndex: signal(0),
      skipDisabled: signal(false),
      directionality: signal('ltr'),
      orientation: signal('vertical'),
      ...args,
    });
  }

  function getSelection<T extends TestItem>(
    items: Signal<T[]>,
    navigation: ListNavigation<T>,
    args: Partial<ListSelectionInputs<T>> = {},
  ): ListSelection<T> {
    return new ListSelection({
      items,
      navigation,
      selectedIds: signal([]),
      multiselectable: signal(true),
      selectionMode: signal('explicit'),
      ...args,
    });
  }

  describe('#select', () => {
    it('should select an item', async () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      await selection.select(); // [0]
      expect(selection.inputs.selectedIds()).toEqual(['0']);
    });

    it('should select multiple options', async () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      await selection.select(); // [0]
      await nav.next();
      await selection.select(); // [0, 1]

      expect(selection.inputs.selectedIds()).toEqual(['0', '1']);
    });

    it('should not select multiple options', async () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav, {
        multiselectable: signal(false),
      });

      await selection.select(); // [0]
      await nav.next();
      await selection.select(); // [1]

      expect(selection.inputs.selectedIds()).toEqual(['1']);
    });

    it('should not select disabled items', async () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      items()[0].disabled.set(true);

      await selection.select(); // []
      expect(selection.inputs.selectedIds()).toEqual([]);
    });

    it('should do nothing to already selected items', async () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      await selection.select(); // [0]
      await selection.select(); // [0]

      expect(selection.inputs.selectedIds()).toEqual(['0']);
    });
  });

  describe('#deselect', () => {
    it('should deselect an item', async () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      await selection.deselect(); // []
      expect(selection.inputs.selectedIds().length).toBe(0);
    });

    it('should not deselect disabled items', async () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      await selection.select(); // [0]
      items()[0].disabled.set(true);
      await selection.deselect(); // [0]

      expect(selection.inputs.selectedIds()).toEqual(['0']);
    });
  });

  describe('#toggle', () => {
    it('should select an unselected item', async () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      await selection.toggle(); // [0]
      expect(selection.inputs.selectedIds()).toEqual(['0']);
    });

    it('should deselect a selected item', async () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      await selection.select(); // [0]
      await selection.toggle(); // []
      expect(selection.inputs.selectedIds().length).toBe(0);
    });
  });

  describe('#selectAll', () => {
    it('should select all items', async () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      await selection.selectAll();
      expect(selection.inputs.selectedIds()).toEqual(['0', '1', '2', '3', '4']);
    });

    it('should do nothing if a list is not multiselectable', async () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      await selection.selectAll();
      expect(selection.inputs.selectedIds()).toEqual(['0', '1', '2', '3', '4']);
    });
  });

  describe('#deselectAll', () => {
    it('should deselect all items', async () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);
      await selection.deselectAll(); // []
      expect(selection.inputs.selectedIds().length).toBe(0);
    });
  });

  describe('#selectFromAnchor', () => {
    it('should select all items from an anchor at a lower index', async () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const selection = getSelection(items, nav);

      await selection.select(); // [0]
      await nav.next();
      await nav.next();
      await selection.selectFromAnchor(); // [0, 1, 2]

      expect(selection.inputs.selectedIds()).toEqual(['0', '1', '2']);
    });

    it('should select all items from an anchor at a higher index', async () => {
      const items = getItems(5);
      const nav = getNavigation(items, {
        activeIndex: signal(3),
      });
      const selection = getSelection(items, nav);

      await selection.select(); // [3]
      await nav.prev();
      await nav.prev();
      await selection.selectFromAnchor(); // [3, 1, 2]

      expect(selection.inputs.selectedIds()).toEqual(['3', '1', '2']);
    });
  });
});
