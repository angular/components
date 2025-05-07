/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal, WritableSignal, signal} from '@angular/core';
import {Expansion, ExpansionInputs, ExpansionItem} from './expansion';
import {ListFocus, ListFocusInputs, ListFocusItem} from '../list-focus/list-focus';
import {getListFocus as getListFocusManager} from '../list-focus/list-focus.spec';

type TestItem = ListFocusItem &
  ExpansionItem & {
    id: WritableSignal<string>;
    disabled: WritableSignal<boolean>;
    element: WritableSignal<HTMLElement>;
    expandable: WritableSignal<boolean>;
    expansionId: WritableSignal<string>;
  };

type TestInputs = Partial<Omit<ExpansionInputs<TestItem>, 'items' | 'focusManager'>> &
  Partial<
    Pick<ListFocusInputs<TestItem>, 'focusMode' | 'disabled' | 'activeIndex' | 'skipDisabled'>
  > & {
    numItems?: number;
    initialExpandedIds?: string[];
  };

function createItems(length: number): WritableSignal<TestItem[]> {
  return signal(
    Array.from({length}).map((_, i) => {
      const itemId = `item-${i}`;
      return {
        id: signal(itemId),
        element: signal(document.createElement('div') as HTMLElement),
        disabled: signal(false),
        expandable: signal(true),
        expansionId: signal(itemId),
      };
    }),
  );
}

function getExpansion(inputs: TestInputs = {}): {
  expansion: Expansion<TestItem>;
  items: TestItem[];
  focusManager: ListFocus<TestItem>;
} {
  const numItems = inputs.numItems ?? 3;
  const items = createItems(numItems);

  const listFocusManagerInputs: Partial<ListFocusInputs<TestItem>> & {items: Signal<TestItem[]>} = {
    items: items,
    activeIndex: inputs.activeIndex ?? signal(0),
    disabled: inputs.disabled ?? signal(false),
    skipDisabled: inputs.skipDisabled ?? signal(true),
    focusMode: inputs.focusMode ?? signal('roving'),
  };

  const focusManager = getListFocusManager(listFocusManagerInputs as any) as ListFocus<TestItem>;

  const expansion = new Expansion<TestItem>({
    items: items,
    activeIndex: focusManager.inputs.activeIndex,
    disabled: focusManager.inputs.disabled,
    skipDisabled: focusManager.inputs.skipDisabled,
    focusMode: focusManager.inputs.focusMode,
    multiExpandable: inputs.multiExpandable ?? signal(false),
    focusManager,
  });

  if (inputs.initialExpandedIds) {
    expansion.expandedIds.set(inputs.initialExpandedIds);
  }

  return {expansion, items: items(), focusManager};
}

describe('Expansion', () => {
  describe('#open', () => {
    it('should open only one item at a time when multiExpandable is false', () => {
      const {expansion, items} = getExpansion({
        multiExpandable: signal(false),
      });

      expansion.open(items[0]);
      expect(expansion.expandedIds()).toEqual(['item-0']);

      expansion.open(items[1]);
      expect(expansion.expandedIds()).toEqual(['item-1']);
    });

    it('should open multiple items when multiExpandable is true', () => {
      const {expansion, items} = getExpansion({
        multiExpandable: signal(true),
      });

      expansion.open(items[0]);
      expect(expansion.expandedIds()).toEqual(['item-0']);

      expansion.open(items[1]);
      expect(expansion.expandedIds()).toEqual(['item-0', 'item-1']);
    });

    it('should not open an item if it is not expandable (expandable is false)', () => {
      const {expansion, items} = getExpansion();
      items[1].expandable.set(false);
      expansion.open(items[1]);
      expect(expansion.expandedIds()).toEqual([]);
    });

    it('should not open an item if it is not focusable (disabled and skipDisabled is true)', () => {
      const {expansion, items} = getExpansion({skipDisabled: signal(true)});
      items[1].disabled.set(true);
      expansion.open(items[1]);
      expect(expansion.expandedIds()).toEqual([]);
    });
  });

  describe('#close', () => {
    it('should close the specified item', () => {
      const {expansion, items} = getExpansion({initialExpandedIds: ['item-0', 'item-1']});
      expansion.close(items[0]);
      expect(expansion.expandedIds()).toEqual(['item-1']);
    });

    it('should not close an item if it is not expandable', () => {
      const {expansion, items} = getExpansion({initialExpandedIds: ['item-0']});
      items[0].expandable.set(false);
      expansion.close(items[0]);
      expect(expansion.expandedIds()).toEqual(['item-0']);
    });

    it('should not close an item if it is not focusable (disabled and skipDisabled is true)', () => {
      const {expansion, items} = getExpansion({
        initialExpandedIds: ['item-0'],
        skipDisabled: signal(true),
      });
      items[0].disabled.set(true);
      expansion.close(items[0]);
      expect(expansion.expandedIds()).toEqual(['item-0']);
    });
  });

  describe('#toggle', () => {
    it('should open a closed item', () => {
      const {expansion, items} = getExpansion();
      expansion.toggle(items[0]);
      expect(expansion.expandedIds()).toEqual(['item-0']);
    });

    it('should close an opened item', () => {
      const {expansion, items} = getExpansion({
        initialExpandedIds: ['item-0'],
      });
      expansion.toggle(items[0]);
      expect(expansion.expandedIds()).toEqual([]);
    });
  });

  describe('#openAll', () => {
    it('should open all focusable and expandable items when multiExpandable is true', () => {
      const {expansion} = getExpansion({
        numItems: 3,
        multiExpandable: signal(true),
      });
      expansion.openAll();
      expect(expansion.expandedIds()).toEqual(['item-0', 'item-1', 'item-2']);
    });

    it('should not expand items that are not expandable', () => {
      const {expansion, items} = getExpansion({
        numItems: 3,
        multiExpandable: signal(true),
      });
      items[1].expandable.set(false);
      expansion.openAll();
      expect(expansion.expandedIds()).toEqual(['item-0', 'item-2']);
    });

    it('should not expand items that are not focusable (disabled and skipDisabled is true)', () => {
      const {expansion, items} = getExpansion({
        numItems: 3,
        multiExpandable: signal(true),
      });
      items[1].disabled.set(true);
      expansion.openAll();
      expect(expansion.expandedIds()).toEqual(['item-0', 'item-2']);
    });

    it('should do nothing when multiExpandable is false', () => {
      const {expansion} = getExpansion({
        numItems: 3,
        multiExpandable: signal(false),
      });
      expansion.openAll();
      expect(expansion.expandedIds()).toEqual([]);
    });
  });

  describe('#closeAll', () => {
    it('should close all expanded items', () => {
      const {expansion, items} = getExpansion({
        multiExpandable: signal(true),
        initialExpandedIds: ['item-0', 'item-2'],
      });
      items[1].expandable.set(false);
      expansion.closeAll();
      expect(expansion.expandedIds()).toEqual([]);
    });

    it('should not close items that are not expandable', () => {
      const {expansion, items} = getExpansion({
        multiExpandable: signal(true),
        initialExpandedIds: ['item-0', 'item-1', 'item-2'],
      });
      items[1].expandable.set(false);
      expansion.closeAll();
      expect(expansion.expandedIds()).toEqual(['item-1']);
    });

    it('should not close items that are not focusable (disabled and skipDisabled is true)', () => {
      const {expansion, items} = getExpansion({
        skipDisabled: signal(true),
        multiExpandable: signal(true),
        initialExpandedIds: ['item-0', 'item-1', 'item-2'],
      });
      items[1].disabled.set(true);
      expansion.closeAll();
      expect(expansion.expandedIds()).toEqual(['item-1']);
    });
  });

  describe('#isExpandable', () => {
    it('should return true if an item is focusable and expandable is true', () => {
      const {expansion, items} = getExpansion();
      items[0].expandable.set(true);
      items[0].disabled.set(false);
      expect(expansion.isExpandable(items[0])).toBeTrue();
    });

    it('should return true if an item is disabled and skipDisabled is false', () => {
      const {expansion, items} = getExpansion({skipDisabled: signal(false)});
      items[0].disabled.set(true);
      expect(expansion.isExpandable(items[0])).toBeTrue();
    });

    it('should return false if an item is disabled and skipDisabled is true', () => {
      const {expansion, items} = getExpansion({skipDisabled: signal(true)});
      items[0].disabled.set(true);
      expect(expansion.isExpandable(items[0])).toBeFalse();
    });

    it('should return false if expandable is false', () => {
      const {expansion, items} = getExpansion();
      items[0].expandable.set(false);
      expect(expansion.isExpandable(items[0])).toBeFalse();
    });
  });

  describe('#isExpanded', () => {
    it('should return true if item ID is in expandedIds', () => {
      const {expansion, items} = getExpansion({initialExpandedIds: ['item-0']});
      expect(expansion.isExpanded(items[0])).toBeTrue();
    });

    it('should return false if item ID is not in expandedIds', () => {
      const {expansion, items} = getExpansion();
      expect(expansion.isExpanded(items[0])).toBeFalse();
    });
  });
});
