/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignalLike} from '../signal-like/signal-like';
import {Tree, TreeInputs, TreeItem} from './tree';

interface TestItem<V = number> extends TreeItem<V, TestItem<V>> {
  value: WritableSignalLike<V>;
  id: WritableSignalLike<string>;
  disabled: WritableSignalLike<boolean>;
  selectable: WritableSignalLike<boolean>;
  searchTerm: WritableSignalLike<string>;
  index: WritableSignalLike<number>;
  children: WritableSignalLike<TestItem<V>[]>;
  parent: WritableSignalLike<TestItem<V> | undefined>;
  visible: WritableSignalLike<boolean>;
  expanded: WritableSignalLike<boolean>;
  expandable: WritableSignalLike<boolean>;
  focusable: WritableSignalLike<boolean>;
}

type TestInputs<V> = Partial<TreeInputs<TestItem<V>, V>> & {
  numItems?: number;
};

describe('Tree Behavior', () => {
  function getTree<V = number>(inputs: TestInputs<V> = {}): Tree<TestItem<V>, V> {
    const items = inputs.items || signal([]);
    const focusInputs = {
      activeItem: signal<TestItem<V> | undefined>(undefined),
      disabled: signal(false),
      softDisabled: signal(true),
      focusMode: signal('roving' as const),
      element: signal({focus: () => {}} as HTMLElement),
      ...inputs,
      items,
    };

    return new Tree<TestItem<V>, V>({
      ...focusInputs,
      values: signal([]),
      multi: signal(false),
      multiExpandable: signal(true),
      selectionMode: signal('follow'),
      wrap: signal(true),
      orientation: signal('vertical'),
      textDirection: signal('ltr'),
      typeaheadDelay: signal(200),
      ...inputs,
    });
  }

  function getItems<V>(values: V[]): TestItem<V>[] {
    const items = values.map(
      (value, index) =>
        ({
          value: signal(value),
          id: signal(`item-${index}`),
          element: signal(document.createElement('div')),
          disabled: signal(false),
          selectable: signal(true),
          searchTerm: signal(String(value)),
          index: signal(index),
          children: signal<TestItem<V>[]>([]),
          parent: signal<TestItem<V> | undefined>(undefined),
          visible: signal(true),
          expanded: signal(false),
          expandable: signal(true),
          focusable: signal(true),
        }) as TestItem<V>,
    );

    return items;
  }

  function buildHierarchy<V>(items: TestItem<V>[], hierarchy: {[key: number]: number[]}) {
    Object.entries(hierarchy).forEach(([parentIdx, childIndices]) => {
      const parent = items[Number(parentIdx)];
      const children = childIndices.map(i => items[i]);
      parent.children.set(children);
      children.forEach(child => child.parent.set(parent));
    });
  }

  function getTreeAndItems<V>(values: V[], inputs: Partial<TestInputs<V>> = {}) {
    const items = signal<TestItem<V>[]>([]);
    const tree = getTree({...inputs, items});
    items.set(getItems(values));
    tree.inputs.activeItem.set(tree.inputs.items()[0]);
    return {tree, items: items()};
  }

  function getDefaultPatterns(inputs: Partial<TestInputs<number>> = {}) {
    return getTreeAndItems([0, 1, 2, 3, 4, 5, 6, 7, 8], inputs);
  }

  describe('with focusMode: "activedescendant"', () => {
    it('should set the list tab index to 0', () => {
      const {tree} = getDefaultPatterns({focusMode: signal('activedescendant')});
      expect(tree.tabIndex()).toBe(0);
    });

    it('should set the active descendant to the active item id', () => {
      const {tree} = getDefaultPatterns({focusMode: signal('activedescendant')});
      expect(tree.activeDescendant()).toBe('item-0');
      tree.next();
      expect(tree.activeDescendant()).toBe('item-1');
    });

    it('should set item tab index to -1', () => {
      const {tree, items} = getDefaultPatterns({focusMode: signal('activedescendant')});
      expect(tree.getItemTabindex(items[0])).toBe(-1);
    });
  });

  describe('with focusMode: "roving"', () => {
    it('should set the list tab index to -1', () => {
      const {tree} = getDefaultPatterns({focusMode: signal('roving')});
      expect(tree.tabIndex()).toBe(-1);
    });

    it('should not set the active descendant', () => {
      const {tree} = getDefaultPatterns({focusMode: signal('roving')});
      expect(tree.activeDescendant()).toBeUndefined();
    });

    it('should set the active item tab index to 0 and others to -1', () => {
      const {tree, items} = getDefaultPatterns({focusMode: signal('roving')});
      expect(tree.getItemTabindex(items[0])).toBe(0);
      expect(tree.getItemTabindex(items[1])).toBe(-1);
      tree.next();
      expect(tree.getItemTabindex(items[0])).toBe(-1);
      expect(tree.getItemTabindex(items[1])).toBe(0);
    });
  });

  describe('with disabled: true and softDisabled is false', () => {
    it('should report disabled state', () => {
      const {tree} = getDefaultPatterns({disabled: signal(true), softDisabled: signal(false)});
      expect(tree.disabled()).toBe(true);
    });

    it('should not change active index on navigation', () => {
      const {tree} = getDefaultPatterns({disabled: signal(true), softDisabled: signal(false)});
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
      tree.next();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
      tree.last();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
    });

    it('should not select items', () => {
      const {tree} = getDefaultPatterns({disabled: signal(true), softDisabled: signal(false)});
      tree.next({selectOne: true});
      expect(tree.inputs.values()).toEqual([]);
    });

    it('should have a tab index of 0', () => {
      const {tree} = getDefaultPatterns({disabled: signal(true), softDisabled: signal(false)});
      expect(tree.tabIndex()).toBe(0);
    });
  });

  describe('with disabled: true', () => {
    it('should report disabled state', () => {
      const {tree} = getDefaultPatterns({disabled: signal(true)});
      expect(tree.disabled()).toBe(true);
    });

    it('should not change active index on navigation', () => {
      const {tree} = getDefaultPatterns({disabled: signal(true)});
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
      tree.next();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
      tree.last();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
    });

    it('should not select items', () => {
      const {tree} = getDefaultPatterns({disabled: signal(true)});
      tree.next({selectOne: true});
      expect(tree.inputs.values()).toEqual([]);
    });

    it('should have a tab index of 0', () => {
      const {tree} = getDefaultPatterns({disabled: signal(true)});
      expect(tree.tabIndex()).toBe(0);
    });
  });

  describe('Navigation', () => {
    it('should navigate to the next item with next()', () => {
      const {tree} = getDefaultPatterns();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
      tree.next();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[1]);
    });

    it('should navigate to the previous item with prev()', () => {
      const {tree, items} = getDefaultPatterns();
      tree.inputs.activeItem.set(items[1]);
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[1]);
      tree.prev();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
    });

    it('should navigate to the first item with first()', () => {
      const {tree, items} = getDefaultPatterns();
      tree.inputs.activeItem.set(items[8]);
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[8]);
      tree.first();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
    });

    it('should navigate to the last item with last()', () => {
      const {tree} = getDefaultPatterns();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
      tree.last();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[8]);
    });

    it('should skip disabled items when softDisabled is false', () => {
      const {tree, items} = getDefaultPatterns({softDisabled: signal(false)});
      items[1].disabled.set(true); // Disable second item
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
      tree.next();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[2]); // Should skip to '2'
      tree.prev();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]); // Should skip back to '0'
    });

    it('should not skip disabled items when navigating', () => {
      const {tree, items} = getDefaultPatterns();
      items[1].disabled.set(true); // Disable second item
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
      tree.next();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[1]); // Should land on second item even though it's disabled
    });

    it('should not wrap with wrap: false', () => {
      const {tree} = getDefaultPatterns({wrap: signal(false)});
      tree.last();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[8]);
      tree.next();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[8]); // Stays at the end
      tree.first();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
      tree.prev();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]); // Stays at the beginning
    });

    it('should navigate with orientation: "horizontal"', () => {
      const {tree} = getDefaultPatterns({orientation: signal('horizontal')});
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
      tree.next();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[1]);
      tree.prev();
      expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
    });

    describe('with items subset', () => {
      it('should navigate next/prev within subset', () => {
        const {tree, items} = getDefaultPatterns();
        const subset = [items[0], items[2], items[4]];

        // Start at 0
        expect(tree.inputs.activeItem()).toBe(items[0]);

        // next(subset) -> 2 (skip 1)
        tree.next({items: subset});
        expect(tree.inputs.activeItem()).toBe(items[2]);

        // next(subset) -> 4 (skip 3)
        tree.next({items: subset});
        expect(tree.inputs.activeItem()).toBe(items[4]);

        // prev(subset) -> 2 (skip 3)
        tree.prev({items: subset});
        expect(tree.inputs.activeItem()).toBe(items[2]);
      });

      it('should verify first/last within subset', () => {
        const {tree, items} = getDefaultPatterns();
        const subset = [items[1], items[2], items[3]];

        tree.first({items: subset});
        expect(tree.inputs.activeItem()).toBe(items[1]);

        tree.last({items: subset});
        expect(tree.inputs.activeItem()).toBe(items[3]);
      });
    });

    describe('Tree hierarchy', () => {
      it('should navigate to first child', () => {
        const {tree, items} = getDefaultPatterns();
        // 0 -> [1, 2]
        buildHierarchy(items, {0: [1, 2]});

        tree.goto(items[0]);
        tree.firstChild();
        expect(tree.inputs.activeItem()).toBe(items[1]);
      });

      it('should navigate to last child', () => {
        const {tree, items} = getDefaultPatterns();
        // 0 -> [1, 2]
        buildHierarchy(items, {0: [1, 2]});

        tree.goto(items[0]);
        tree.lastChild();
        expect(tree.inputs.activeItem()).toBe(items[2]);
      });

      it('should navigate to next sibling', () => {
        const {tree, items} = getDefaultPatterns();
        // 0 -> [1, 2, 3]
        buildHierarchy(items, {0: [1, 2, 3]});

        tree.goto(items[1]);
        tree.nextSibling();
        expect(tree.inputs.activeItem()).toBe(items[2]);

        tree.nextSibling();
        expect(tree.inputs.activeItem()).toBe(items[3]);
      });

      it('should navigate to previous sibling', () => {
        const {tree, items} = getDefaultPatterns();
        // 0 -> [1, 2, 3]
        buildHierarchy(items, {0: [1, 2, 3]});

        tree.goto(items[3]);
        tree.prevSibling();
        expect(tree.inputs.activeItem()).toBe(items[2]);

        tree.prevSibling();
        expect(tree.inputs.activeItem()).toBe(items[1]);
      });

      it('should navigate to parent', () => {
        const {tree, items} = getDefaultPatterns();
        // 0 -> [1]
        buildHierarchy(items, {0: [1]});

        tree.goto(items[1]);
        tree.parent();
        expect(tree.inputs.activeItem()).toBe(items[0]);
      });

      it('should not navigate to first child if no children', () => {
        const {tree, items} = getDefaultPatterns();
        tree.goto(items[0]);
        tree.firstChild();
        expect(tree.inputs.activeItem()).toBe(items[0]); // Stays same
      });

      it('should skipping invisible items (subset navigation)', () => {
        const {tree, items} = getDefaultPatterns();
        // 0 -> p
        // 1 -> c (invisible)
        // 2 -> c
        buildHierarchy(items, {0: [1, 2]});
        items[1].visible.set(false);

        tree.goto(items[0]);
        // firstChild should skip 1 and go to 2
        tree.firstChild();
        expect(tree.inputs.activeItem()).toBe(items[2]);
      });
    });
  });

  describe('Selection', () => {
    describe('single select', () => {
      it('should not select when navigating', () => {
        const {tree} = getDefaultPatterns({values: signal([]), multi: signal(false)});
        tree.next();
        expect(tree.inputs.values()).toEqual([]);
      });

      it('should select an item when navigating with selectOne:true', () => {
        const {tree} = getTreeAndItems([0, 1], {values: signal([]), multi: signal(false)});

        tree.next({selectOne: true});
        expect(tree.inputs.values()).toEqual([1]);
      });

      it('should not select a non-selectable item when navigating with selectOne:true', () => {
        const {tree, items} = getDefaultPatterns({values: signal([]), multi: signal(false)});
        items[1].selectable.set(false);
        tree.next({selectOne: true});
        expect(tree.inputs.values()).toEqual([]);
      });

      it('should toggle an item when navigating with toggle:true', () => {
        const {tree, items} = getDefaultPatterns({values: signal([]), multi: signal(false)});
        tree.goto(items[1], {selectOne: true});
        expect(tree.inputs.values()).toEqual([1]);

        tree.goto(items[1], {toggle: true});
        expect(tree.inputs.values()).toEqual([]);
      });

      it('should not toggle a non-selectable item when navigating with toggle:true', () => {
        const {tree, items} = getDefaultPatterns({values: signal([]), multi: signal(false)});
        items[1].selectable.set(false);
        tree.goto(items[1], {toggle: true});
        expect(tree.inputs.values()).toEqual([]);
      });

      it('should only allow one selected item', () => {
        const {tree} = getDefaultPatterns({values: signal([]), multi: signal(false)});
        tree.next({selectOne: true});
        expect(tree.inputs.values()).toEqual([1]);
        tree.next({selectOne: true});
        expect(tree.inputs.values()).toEqual([2]);
      });
    });

    describe('multi select', () => {
      it('should not select when navigating', () => {
        const {tree} = getDefaultPatterns({values: signal([]), multi: signal(true)});
        tree.next();
        expect(tree.inputs.values()).toEqual([]);
      });

      it('should select an item with toggle:true', () => {
        const {tree} = getDefaultPatterns({values: signal([]), multi: signal(true)});
        tree.next({toggle: true});
        expect(tree.inputs.values()).toEqual([1]);
      });

      it('should not select a non-selectable item with toggle:true', () => {
        const {tree, items} = getDefaultPatterns({values: signal([]), multi: signal(true)});
        items[1].selectable.set(false);
        tree.next({toggle: true});
        expect(tree.inputs.values()).toEqual([]);
      });

      it('should allow multiple selected items', () => {
        const {tree} = getDefaultPatterns({values: signal([]), multi: signal(true)});
        tree.next({toggle: true});
        tree.next({toggle: true});
        expect(tree.inputs.values()).toEqual([1, 2]);
      });

      it('should select a range of items with selectRange:true', () => {
        const {tree} = getDefaultPatterns({values: signal([]), multi: signal(true)});
        tree.anchor(0);
        tree.next({selectRange: true});
        expect(tree.inputs.values()).toEqual([0, 1]); // Apple (0), Apricot (1)
        tree.next({selectRange: true});
        expect(tree.inputs.values()).toEqual([0, 1, 2]);
        tree.prev({selectRange: true});
        expect(tree.inputs.values()).toEqual([0, 1]);
        tree.prev({selectRange: true});
        expect(tree.inputs.values()).toEqual([0]);
      });

      it('should not wrap when range selecting', () => {
        const {tree} = getDefaultPatterns({values: signal([]), multi: signal(true)});
        tree.anchor(0);
        tree.prev({selectRange: true});
        expect(tree.inputs.activeItem()).toBe(tree.inputs.items()[0]);
        expect(tree.inputs.values()).toEqual([]);
      });

      it('should not select disabled items in a range', () => {
        const {tree, items} = getDefaultPatterns({values: signal([]), multi: signal(true)});
        items[1].disabled.set(true);
        tree.anchor(0);
        tree.goto(items[3], {selectRange: true});
        expect(tree.inputs.values()).toEqual([0, 2, 3]); // Skips 1
      });

      it('should not select non-selectable items in a range', () => {
        const {tree, items} = getDefaultPatterns({values: signal([]), multi: signal(true)});
        items[1].selectable.set(false);
        tree.anchor(0);
        tree.goto(items[3], {selectRange: true});
        expect(tree.inputs.values()).toEqual([0, 2, 3]); // Skips 1
      });
    });
  });

  describe('Typeahead', () => {
    function delay(amount: number) {
      return new Promise(resolve => setTimeout(resolve, amount));
    }

    it('should navigate to an item via typeahead', async () => {
      const {tree, items} = getTreeAndItems(['Apple', 'Apricot', 'Banana', 'Cherry']);
      tree.goto(items[2]); // Start at Banana
      expect(tree.inputs.activeItem()).toBe(items[2]);

      tree.search('A'); // "A" -> Apple (0)
      expect(tree.inputs.activeItem()).toBe(items[0]); // Moved to Apple

      tree.search('p'); // "Ap" -> Apple (0)
      expect(tree.inputs.activeItem()).toBe(items[0]);

      tree.search('r'); // "Apr" -> Apricot (1)
      expect(tree.inputs.activeItem()).toBe(items[1]);

      await delay(500); // Reset
      tree.search('B');
      expect(tree.inputs.activeItem()).toBe(items[2]); // Banana
    });

    it('should respect typeaheadDelay', async () => {
      const {tree, items} = getTreeAndItems(['Apple', 'Apricot', 'Banana'], {
        typeaheadDelay: signal(100),
      });
      tree.goto(items[2]); // Start at Banana

      tree.search('A');
      expect(tree.inputs.activeItem()).toBe(items[0]); // Apple

      await delay(50); // < 100
      tree.search('p'); // "Ap" -> Apple
      expect(tree.inputs.activeItem()).toBe(items[0]);

      await delay(150); // > 100, Reset
      tree.search('B');
      expect(tree.inputs.activeItem()).toBe(items[2]); // Banana
    });

    it('should select an item via typeahead', () => {
      const {tree} = getTreeAndItems(['Apple', 'Banana'], {multi: signal(false)});
      tree.search('b', {selectOne: true});
      expect(tree.inputs.values()).toEqual(['Banana']);
    });

    it('should not select a non-selectable item via typeahead', () => {
      const {tree, items} = getTreeAndItems(['Apple', 'Banana'], {multi: signal(false)});
      items[1].selectable.set(false);
      tree.search('b', {selectOne: true});
      expect(tree.inputs.values()).toEqual([]);
    });
  });
});
