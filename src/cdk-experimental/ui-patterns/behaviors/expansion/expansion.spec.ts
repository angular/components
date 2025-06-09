/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {WritableSignal, signal} from '@angular/core';
import {ListExpansion, ListExpansionInputs, ExpansionItem} from './expansion';

type TestItem = ExpansionItem & {
  id: WritableSignal<string>;
  disabled: WritableSignal<boolean>;
  expandable: WritableSignal<boolean>;
  expansionId: WritableSignal<string>;
};

type TestInputs = Partial<Omit<ListExpansionInputs, 'items'>> & {
  numItems?: number;
  initialExpandedIds?: string[];
  expansionDisabled?: boolean;
};

function createItems(length: number): WritableSignal<TestItem[]> {
  return signal(
    Array.from({length}).map((_, i) => {
      const itemId = `item-${i}`;
      return {
        id: signal(itemId),
        disabled: signal(false),
        expandable: signal(true),
        expansionId: signal(itemId),
      };
    }),
  );
}

function getExpansion(inputs: TestInputs = {}): {
  expansion: ListExpansion;
  items: TestItem[];
} {
  const numItems = inputs.numItems ?? 3;
  const items = createItems(numItems);

  const expansion = new ListExpansion({
    items: items,
    disabled: signal(inputs.expansionDisabled ?? false),
    multiExpandable: signal(inputs.multiExpandable?.() ?? false),
    expandedIds: signal<string[]>([]),
  });

  if (inputs.initialExpandedIds) {
    expansion.expandedIds.set(inputs.initialExpandedIds);
  }

  return {expansion, items: items()};
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

    it('should not open an item if it is disabled', () => {
      const {expansion, items} = getExpansion();
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

    it('should not close an item if it is disabled', () => {
      const {expansion, items} = getExpansion({initialExpandedIds: ['item-0']});
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

    it('should not expand items that are disabled', () => {
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

    it('should not close items that are disabled', () => {
      const {expansion, items} = getExpansion({
        multiExpandable: signal(true),
        initialExpandedIds: ['item-0', 'item-1', 'item-2'],
      });
      items[1].disabled.set(true);
      expansion.closeAll();
      expect(expansion.expandedIds()).toEqual(['item-1']);
    });
  });

  describe('#isExpandable', () => {
    it('should return true if an item is not disabled and expandable is true', () => {
      const {expansion, items} = getExpansion();
      items[0].expandable.set(true);
      items[0].disabled.set(false);
      expect(expansion.isExpandable(items[0])).toBeTrue();
    });

    it('should return false if an item is disabled', () => {
      const {expansion, items} = getExpansion();
      items[0].disabled.set(true);
      expect(expansion.isExpandable(items[0])).toBeFalse();
    });

    it('should return false if the expansion behavior is disabled', () => {
      const {expansion, items} = getExpansion({expansionDisabled: true});
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
