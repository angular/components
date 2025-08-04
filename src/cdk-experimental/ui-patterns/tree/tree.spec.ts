/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {WritableSignal, signal} from '@angular/core';
import {TreeInputs, TreeItemInputs, TreeItemPattern, TreePattern} from './tree';
import {createKeyboardEvent} from '@angular/cdk/testing/private';
import {ModifierKeys} from '@angular/cdk/testing';
import {SignalLike} from '../behaviors/signal-like/signal-like';

// Converts the SignalLike type to WritableSignal type for controlling test inputs.
type WritableSignalOverrides<O> = {
  [K in keyof O as O[K] extends SignalLike<any> ? K : never]: O[K] extends SignalLike<infer T>
    ? WritableSignal<T>
    : never;
};

type TestTreeInputs<V> = Omit<TreeInputs<V> & WritableSignalOverrides<TreeInputs<V>>, 'allItems'>;
type TestTreeItemInputs<V> = TreeItemInputs<V> & WritableSignalOverrides<TreeItemInputs<V>>;

const a = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 65, 'A', mods);
const up = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 38, 'ArrowUp', mods);
const down = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 40, 'ArrowDown', mods);
const left = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 37, 'ArrowLeft', mods);
const right = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 39, 'ArrowRight', mods);
const home = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 36, 'Home', mods);
const end = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 35, 'End', mods);
const space = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 32, ' ', mods);
const enter = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 13, 'Enter', mods);
const asterisk = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 106, '*', mods);
const shift = () => createKeyboardEvent('keydown', 16, 'Shift', {shift: true});

function createClickEvent(element: HTMLElement, mods?: ModifierKeys): PointerEvent {
  return {
    target: element,
    shiftKey: mods?.shift,
    ctrlKey: mods?.control,
    metaKey: mods?.meta,
    button: 0,
    preventDefault: () => {},
    stopPropagation: () => {},
  } as unknown as PointerEvent;
}

function createTreeItemElement(id: string): HTMLElement {
  const element = document.createElement('div');
  element.role = 'treeitem';
  element.id = id;
  return element;
}

interface TestTreeItem<V> {
  value: V;
  children?: TestTreeItem<V>[];
  disabled: boolean;
}

describe('Tree Pattern', () => {
  function createTree<V>(treeData: TestTreeItem<V>[], treeInputs: TestTreeInputs<V>) {
    const allItems = signal<TreeItemPattern<V>[]>([]);
    const itemPatternInputsMap = new Map<string, TestTreeItemInputs<V>>();
    const tree = new TreePattern<V>({
      ...treeInputs,
      allItems,
    });

    let nextId = 0;

    function buildItems(
      treeData: TestTreeItem<V>[],
      parent: TreeItemPattern<V> | TreePattern<V>,
    ): TreeItemPattern<V>[] {
      const items: TreeItemPattern<V>[] = [];

      for (const node of treeData) {
        const itemId = `treeitem-${nextId++}`;
        const element = createTreeItemElement(itemId);
        const itemPatternInputs: TestTreeItemInputs<V> = {
          id: signal(itemId),
          value: signal(node.value),
          element: signal(element),
          disabled: signal(node.disabled),
          searchTerm: signal(String(node.value)),
          parent: signal(parent),
          hasChildren: signal((node.children ?? []).length > 0),
          children: signal<TreeItemPattern<V>[]>([]),
          tree: signal(tree),
        };

        const item = new TreeItemPattern(itemPatternInputs);
        itemPatternInputsMap.set(itemId, itemPatternInputs);

        allItems.set([...allItems(), item]);
        items.push(item);

        const childItems = buildItems(node.children ?? [], item);
        itemPatternInputs.children.set(childItems);
      }
      return items;
    }

    // Build tree items recursively.
    buildItems(treeData, tree as TreePattern<V>);
    tree.activeItem.set(allItems()[0]);

    return {tree, allItems, itemPatternInputsMap};
  }

  function getItemByValue<V>(allItems: TreeItemPattern<V>[], value: V) {
    return allItems.find(i => i.value() === value)!;
  }

  const treeExample: TestTreeItem<string>[] = [
    {
      value: 'Item 0',
      children: [
        {value: 'Item 0-0', disabled: false},
        {value: 'Item 0-1', disabled: false},
      ],
      disabled: false,
    },
    {value: 'Item 1', disabled: false},
    {
      value: 'Item 2',
      children: [{value: 'Item 2-0', disabled: false}],
      disabled: false,
    },
  ];

  describe('TreeItemPattern properties', () => {
    let treeInputs: TestTreeInputs<string>;

    beforeEach(() => {
      treeInputs = {
        activeItem: signal(undefined),
        disabled: signal(false),
        focusMode: signal('roving'),
        multi: signal(false),
        orientation: signal('vertical'),
        selectionMode: signal('follow'),
        skipDisabled: signal(true),
        textDirection: signal('ltr'),
        typeaheadDelay: signal(0),
        value: signal([]),
        wrap: signal(false),
        nav: signal(false),
        currentType: signal('page'),
      };
    });

    it('should correctly compute level', () => {
      const {allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item0_0 = getItemByValue(allItems(), 'Item 0-0');

      expect(item0.level()).toBe(1);
      expect(item0_0.level()).toBe(2);
    });

    it('should correctly compute setsize', () => {
      const {allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item0_0 = getItemByValue(allItems(), 'Item 0-0');

      expect(item0.setsize()).toBe(3);
      expect(item0_0.setsize()).toBe(2);
    });

    it('should correctly compute posinset', () => {
      const {allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item1 = getItemByValue(allItems(), 'Item 1');
      const item0_0 = getItemByValue(allItems(), 'Item 0-0');
      const item0_1 = getItemByValue(allItems(), 'Item 0-1');

      expect(item0.posinset()).toBe(1);
      expect(item1.posinset()).toBe(2);
      expect(item0_0.posinset()).toBe(1);
      expect(item0_1.posinset()).toBe(2);
    });

    describe('nav mode', () => {
      let treeInputs: TestTreeInputs<string>;

      beforeEach(() => {
        treeInputs = {
          activeItem: signal(undefined),
          disabled: signal(false),
          focusMode: signal('roving'),
          multi: signal(false),
          orientation: signal('vertical'),
          selectionMode: signal('follow'),
          skipDisabled: signal(true),
          textDirection: signal('ltr'),
          typeaheadDelay: signal(0),
          value: signal([]),
          wrap: signal(false),
          nav: signal(true),
          currentType: signal('page'),
        };
      });

      it('should have undefined selected state', () => {
        const {allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        treeInputs.value.set(['Item 0']);
        expect(item0.selected()).toBeUndefined();
      });

      it('should correctly compute current state', () => {
        const {allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        const item1 = getItemByValue(allItems(), 'Item 1');

        treeInputs.value.set(['Item 0']);
        expect(item0.current()).toBe('page');
        expect(item1.current()).toBeUndefined();

        treeInputs.value.set(['Item 1']);
        treeInputs.currentType.set('step');
        expect(item0.current()).toBeUndefined();
        expect(item1.current()).toBe('step');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    let treeInputs: TestTreeInputs<string>;

    beforeEach(() => {
      treeInputs = {
        activeItem: signal(undefined),
        disabled: signal(false),
        focusMode: signal('roving'),
        multi: signal(false),
        orientation: signal('vertical'),
        selectionMode: signal('explicit'),
        skipDisabled: signal(true),
        textDirection: signal('ltr'),
        typeaheadDelay: signal(0),
        value: signal([]),
        wrap: signal(false),
        nav: signal(false),
        currentType: signal('page'),
      };
    });

    it('should correctly compute active state', () => {
      const {allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item1 = getItemByValue(allItems(), 'Item 1');

      treeInputs.activeItem.set(item0);
      expect(item0.active()).toBe(true);
      expect(item1.active()).toBe(false);

      treeInputs.activeItem.set(item1);
      expect(item0.active()).toBe(false);
      expect(item1.active()).toBe(true);
    });

    it('should correctly compute tabindex state', () => {
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      expect(item0.tabindex()).toBe(tree.listBehavior.getItemTabindex(item0));
    });

    it('should navigate next on ArrowDown (vertical)', () => {
      treeInputs.orientation.set('vertical');
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item1 = getItemByValue(allItems(), 'Item 1');
      tree.listBehavior.goto(item0);

      expect(tree.activeItem()).toBe(item0);
      tree.onKeydown(down());
      expect(tree.activeItem()).toBe(item1);
    });

    it('should navigate prev on ArrowUp (vertical)', () => {
      treeInputs.orientation.set('vertical');
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item1 = getItemByValue(allItems(), 'Item 1');
      tree.listBehavior.goto(item1);

      expect(tree.activeItem()).toBe(item1);
      tree.onKeydown(up());
      expect(tree.activeItem()).toBe(item0);
    });

    it('should navigate next on ArrowRight (horizontal)', () => {
      treeInputs.orientation.set('horizontal');
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item1 = getItemByValue(allItems(), 'Item 1');
      tree.listBehavior.goto(item0);

      expect(tree.activeItem()).toBe(item0);
      tree.onKeydown(right());
      expect(tree.activeItem()).toBe(item1);
    });

    it('should navigate prev on ArrowLeft (horizontal)', () => {
      treeInputs.orientation.set('horizontal');
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item1 = getItemByValue(allItems(), 'Item 1');
      tree.listBehavior.goto(item1);

      expect(tree.activeItem()).toBe(item1);
      tree.onKeydown(left());
      expect(tree.activeItem()).toBe(item0);
    });

    it('should navigate next on ArrowLeft (horizontal & rtl)', () => {
      treeInputs.orientation.set('horizontal');
      treeInputs.textDirection.set('rtl');
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item1 = getItemByValue(allItems(), 'Item 1');
      treeInputs.activeItem.set(item0);

      expect(tree.activeItem()).toBe(item0);
      tree.onKeydown(left());
      expect(tree.activeItem()).toBe(item1);
    });

    it('should navigate prev on ArrowRight (horizontal & rtl)', () => {
      treeInputs.orientation.set('horizontal');
      treeInputs.textDirection.set('rtl');
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item1 = getItemByValue(allItems(), 'Item 1');
      tree.listBehavior.goto(item1);

      expect(tree.activeItem()).toBe(item1);
      tree.onKeydown(right());
      expect(tree.activeItem()).toBe(item0);
    });

    it('should navigate to the first visible item on Home', () => {
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item2 = getItemByValue(allItems(), 'Item 2');
      tree.listBehavior.goto(item2);

      expect(tree.activeItem()).toBe(item2);
      tree.onKeydown(home());
      expect(tree.activeItem()).toBe(item0);
    });

    it('should navigate to the last visible item on End', () => {
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item2 = getItemByValue(allItems(), 'Item 2');
      tree.listBehavior.goto(item0);

      expect(tree.activeItem()).toBe(item0);
      tree.onKeydown(end());
      expect(tree.activeItem()).toBe(item2);
    });

    it('should skip disabled items when skipDisabled is true', () => {
      treeInputs.skipDisabled.set(true);
      const localTreeExample: TestTreeItem<string>[] = [
        {value: 'Item A', disabled: false},
        {value: 'Item B', disabled: true},
        {value: 'Item C', disabled: false},
      ];
      const {tree, allItems} = createTree(localTreeExample, treeInputs);
      const itemA = getItemByValue(allItems(), 'Item A');
      const itemC = getItemByValue(allItems(), 'Item C');
      tree.listBehavior.goto(itemA);

      expect(tree.activeItem()).toBe(itemA);
      tree.onKeydown(down());
      expect(tree.activeItem()).toBe(itemC);
    });

    it('should not skip disabled items when skipDisabled is false', () => {
      treeInputs.skipDisabled.set(false);
      const localTreeExample: TestTreeItem<string>[] = [
        {value: 'Item A', disabled: false},
        {value: 'Item B', disabled: true},
        {value: 'Item C', disabled: false},
      ];
      const {tree, allItems} = createTree(localTreeExample, treeInputs);
      const itemA = getItemByValue(allItems(), 'Item A');
      const itemB = getItemByValue(allItems(), 'Item B');
      tree.listBehavior.goto(itemA);

      expect(tree.activeItem()).toBe(itemA);
      tree.onKeydown(down());
      expect(tree.activeItem()).toBe(itemB);
    });

    it('should not navigate when the tree is disabled', () => {
      treeInputs.disabled.set(true);
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      tree.listBehavior.goto(item0);

      expect(tree.activeItem()).toBe(item0);
      tree.onKeydown(down());
      expect(tree.activeItem()).toBe(item0);
    });
  });

  describe('Keyboard Selection', () => {
    describe('follows focus & single select', () => {
      let treeInputs: TestTreeInputs<string>;

      beforeEach(() => {
        treeInputs = {
          activeItem: signal(undefined),
          disabled: signal(false),
          focusMode: signal('roving'),
          multi: signal(false),
          orientation: signal('vertical'),
          selectionMode: signal('follow'),
          skipDisabled: signal(true),
          textDirection: signal('ltr'),
          typeaheadDelay: signal(0),
          value: signal([]),
          wrap: signal(false),
          nav: signal(false),
          currentType: signal('page'),
        };
      });

      it('should correctly compute selected state', () => {
        const {allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        const item1 = getItemByValue(allItems(), 'Item 1');

        treeInputs.value.set(['Item 0']);
        expect(item0.selected()).toBe(true);
        expect(item1.selected()).toBe(false);

        treeInputs.value.set(['Item 1']);
        expect(item0.selected()).toBe(false);
        expect(item1.selected()).toBe(true);
      });

      it('should select an item on navigation', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        const item1 = getItemByValue(allItems(), 'Item 1');

        tree.onKeydown(down());
        expect(tree.activeItem()).toBe(item1);
        expect(tree.inputs.value()).toEqual(['Item 1']);

        tree.onKeydown(up());
        expect(tree.activeItem()).toBe(item0);
        expect(tree.inputs.value()).toEqual(['Item 0']);
      });

      it('should not change selection when the tree is disabled', () => {
        treeInputs.disabled.set(true);
        const {tree} = createTree(treeExample, treeInputs);

        tree.onKeydown(down());
        expect(tree.inputs.value()).toEqual([]);
      });
    });

    describe('explicit focus & single select', () => {
      let treeInputs: TestTreeInputs<string>;

      beforeEach(() => {
        treeInputs = {
          activeItem: signal(undefined),
          disabled: signal(false),
          focusMode: signal('roving'),
          multi: signal(false),
          orientation: signal('vertical'),
          selectionMode: signal('explicit'),
          skipDisabled: signal(true),
          textDirection: signal('ltr'),
          typeaheadDelay: signal(0),
          value: signal([]),
          wrap: signal(false),
          nav: signal(false),
          currentType: signal('page'),
        };
      });

      it('should select an item on Space', () => {
        const {tree} = createTree(treeExample, treeInputs);

        tree.onKeydown(space());
        expect(tree.inputs.value()).toEqual(['Item 0']);

        tree.onKeydown(space());
        expect(tree.inputs.value()).toEqual([]);
      });

      it('should select an item on Enter', () => {
        const {tree} = createTree(treeExample, treeInputs);

        tree.onKeydown(enter());
        expect(tree.inputs.value()).toEqual(['Item 0']);

        tree.onKeydown(enter());
        expect(tree.inputs.value()).toEqual([]);
      });

      it('should only allow one selected item', () => {
        const {tree} = createTree(treeExample, treeInputs);

        tree.onKeydown(enter());
        expect(tree.inputs.value()).toEqual(['Item 0']);

        tree.onKeydown(down());
        tree.onKeydown(enter());
        expect(tree.inputs.value()).toEqual(['Item 1']);
      });

      it('should not change selection when the tree is disabled', () => {
        treeInputs.disabled.set(true);
        const {tree} = createTree(treeExample, treeInputs);

        tree.onKeydown(space());
        expect(tree.inputs.value()).toEqual([]);

        tree.onKeydown(enter());
        expect(tree.inputs.value()).toEqual([]);
      });
    });

    describe('explicit focus & multi select', () => {
      let treeInputs: TestTreeInputs<string>;

      beforeEach(() => {
        treeInputs = {
          activeItem: signal(undefined),
          disabled: signal(false),
          focusMode: signal('roving'),
          multi: signal(true),
          orientation: signal('vertical'),
          selectionMode: signal('explicit'),
          skipDisabled: signal(true),
          textDirection: signal('ltr'),
          typeaheadDelay: signal(0),
          value: signal([]),
          wrap: signal(false),
          nav: signal(false),
          currentType: signal('page'),
        };
      });

      it('should select an item on Space', () => {
        const {tree} = createTree(treeExample, treeInputs);

        tree.onKeydown(space());
        expect(tree.inputs.value()).toEqual(['Item 0']);
      });

      it('should select an item on Enter', () => {
        const {tree} = createTree(treeExample, treeInputs);

        tree.onKeydown(enter());
        expect(tree.inputs.value()).toEqual(['Item 0']);
      });

      it('should allow multiple selected items', () => {
        const {tree} = createTree(treeExample, treeInputs);

        tree.onKeydown(enter());
        tree.onKeydown(down());
        tree.onKeydown(enter());
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 1']);
      });

      it('should select a range of visible items on Shift + ArrowDown/ArrowUp', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        item0.expansion.open();

        tree.onKeydown(shift());
        tree.onKeydown(down({shift: true}));
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 0-0']);

        tree.onKeydown(down({shift: true}));
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 0-0', 'Item 0-1']);

        tree.onKeydown(up({shift: true}));
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 0-0']);
      });

      it('should not allow wrapping while Shift is held down', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');

        tree.onKeydown(shift());
        tree.onKeydown(up({shift: true}));
        expect(tree.activeItem()).toBe(item0);
        expect(tree.inputs.value()).toEqual([]);
      });

      it('should select a range of visible items on Shift + Space (or Enter)', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        item0.expansion.open();

        tree.onKeydown(down());
        tree.onKeydown(space());
        expect(tree.inputs.value()).toEqual(['Item 0-0']);

        tree.onKeydown(down());
        tree.onKeydown(down());
        tree.onKeydown(shift());
        tree.onKeydown(space({shift: true}));
        expect(tree.inputs.value()).toEqual(['Item 0-0', 'Item 0-1', 'Item 1']);
      });

      it('should select the focused item and all visible items up to the first on Ctrl + Shift + Home', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        const item1 = getItemByValue(allItems(), 'Item 1');
        item0.expansion.open();
        tree.listBehavior.goto(item1);

        tree.onKeydown(shift());
        tree.onKeydown(home({control: true, shift: true}));
        expect(tree.inputs.value()).toEqual(['Item 1', 'Item 0-1', 'Item 0-0', 'Item 0']);
      });

      it('should select the focused item and all visible items down to the last on Ctrl + Shift + End', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        const item0_0 = getItemByValue(allItems(), 'Item 0-0');
        item0.expansion.open();
        tree.listBehavior.goto(item0_0);

        tree.onKeydown(shift());
        tree.onKeydown(end({control: true, shift: true}));
        expect(tree.inputs.value()).toEqual(['Item 0-0', 'Item 0-1', 'Item 1', 'Item 2']);
      });

      it('should not change selection when the tree is disabled', () => {
        treeInputs.disabled.set(true);
        const {tree} = createTree(treeExample, treeInputs);

        tree.onKeydown(space());
        expect(tree.inputs.value()).toEqual([]);

        tree.onKeydown(a({control: true}));
        expect(tree.inputs.value()).toEqual([]);
      });

      it('should not select disabled items on Shift + ArrowUp / ArrowDown', () => {
        const localTreeData: TestTreeItem<string>[] = [
          {value: 'A', disabled: false},
          {value: 'B', disabled: true},
          {value: 'C', disabled: false},
        ];
        treeInputs.skipDisabled.set(false);
        const {tree, allItems} = createTree(localTreeData, treeInputs);
        const itemA = getItemByValue(allItems(), 'A');

        tree.listBehavior.goto(itemA);
        tree.onKeydown(shift());
        tree.onKeydown(down({shift: true}));
        tree.onKeydown(down({shift: true}));
        expect(tree.inputs.value()).toEqual(['A', 'C']);
      });

      it('should select all visible items on Ctrl + A', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        item0.expansion.open();

        tree.onKeydown(a({control: true}));
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 0-0', 'Item 0-1', 'Item 1', 'Item 2']);
      });

      it('should deselect all visible items on Ctrl + A if all are selected', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        item0.expansion.open();

        tree.onKeydown(a({control: true}));
        tree.onKeydown(a({control: true}));
        expect(tree.inputs.value()).toEqual([]);
      });
    });

    describe('follows focus & multi select', () => {
      let treeInputs: TestTreeInputs<string>;

      beforeEach(() => {
        treeInputs = {
          activeItem: signal(undefined),
          disabled: signal(false),
          focusMode: signal('roving'),
          multi: signal(true),
          orientation: signal('vertical'),
          selectionMode: signal('follow'),
          skipDisabled: signal(true),
          textDirection: signal('ltr'),
          typeaheadDelay: signal(0),
          value: signal([]),
          wrap: signal(false),
          nav: signal(false),
          currentType: signal('page'),
        };
      });

      it('should select an item on navigation', () => {
        const {tree} = createTree(treeExample, treeInputs);

        tree.onKeydown(down());
        expect(tree.inputs.value()).toEqual(['Item 1']);
      });

      it('should navigate without selecting if the Ctrl key is pressed', () => {
        treeInputs.value.set(['Item 0']);
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item1 = getItemByValue(allItems(), 'Item 1');

        tree.onKeydown(down({control: true}));
        expect(tree.inputs.value()).toEqual(['Item 0']);
        expect(tree.activeItem()).toBe(item1);
      });

      it('should toggle an item selection state on Ctrl + Space', () => {
        treeInputs.value.set(['Item 0']);
        const {tree} = createTree(treeExample, treeInputs);

        tree.onKeydown(down({control: true}));
        tree.onKeydown(space({control: true}));
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 1']);

        tree.onKeydown(space({control: true}));
        expect(tree.inputs.value()).toEqual(['Item 0']);
      });

      it('should select a range of visible items on Shift + ArrowDown/ArrowUp', () => {
        treeInputs.value.set(['Item 0']);
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        item0.expansion.open();

        tree.onKeydown(shift());
        tree.onKeydown(down({shift: true}));
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 0-0']);
        tree.onKeydown(down({shift: true}));
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 0-0', 'Item 0-1']);
      });

      it('should not allow wrapping while Shift is held down', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        tree.listBehavior.goto(item0);

        tree.onKeydown(shift());
        tree.onKeydown(up({shift: true}));
        expect(tree.activeItem()).toBe(item0);
        expect(tree.inputs.value()).toEqual([]);
      });

      it('should select a range of visible items on Shift + Space (or Enter)', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        item0.expansion.open();
        tree.listBehavior.goto(item0);

        tree.onKeydown(down({control: true}));
        tree.onKeydown(down({control: true}));
        tree.onKeydown(shift());
        tree.onKeydown(space({shift: true}));
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 0-0', 'Item 0-1']);
      });

      it('should select the focused item and all visible items up to the first on Ctrl + Shift + Home', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        const item1 = getItemByValue(allItems(), 'Item 1');
        item0.expansion.open();
        tree.listBehavior.goto(item1);

        tree.onKeydown(shift());
        tree.onKeydown(home({control: true, shift: true}));
        expect(tree.inputs.value()).toEqual(['Item 1', 'Item 0-1', 'Item 0-0', 'Item 0']);
      });

      it('should select the focused item and all visible items down to the last on Ctrl + Shift + End', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        const item0_0 = getItemByValue(allItems(), 'Item 0-0');
        item0.expansion.open();
        tree.listBehavior.goto(item0_0);

        tree.onKeydown(shift());
        tree.onKeydown(end({control: true, shift: true}));
        expect(tree.inputs.value()).toEqual(['Item 0-0', 'Item 0-1', 'Item 1', 'Item 2']);
      });

      it('should not change selection when the tree is disabled', () => {
        treeInputs.disabled.set(true);
        const {tree} = createTree(treeExample, treeInputs);

        tree.onKeydown(down());
        expect(tree.inputs.value()).toEqual([]);
      });

      it('should not select disabled items on navigation', () => {
        const localTreeData: TestTreeItem<string>[] = [
          {value: 'A', disabled: false},
          {value: 'B', disabled: true},
          {value: 'C', disabled: false},
        ];
        treeInputs.skipDisabled.set(true);
        const {tree, allItems} = createTree(localTreeData, treeInputs);
        treeInputs.value.set(['A']);
        tree.listBehavior.goto(getItemByValue(allItems(), 'A'));

        tree.onKeydown(down());
        expect(tree.inputs.value()).toEqual(['C']);
      });

      it('should deselect all except the focused item on Ctrl + A if all are selected', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        const item0_0 = getItemByValue(allItems(), 'Item 0-0');
        item0.expansion.open();
        tree.listBehavior.goto(item0_0);

        tree.onKeydown(a({control: true}));
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 0-0', 'Item 0-1', 'Item 1', 'Item 2']);
        tree.onKeydown(a({control: true}));
        expect(tree.inputs.value()).toEqual(['Item 0-0']);
      });
    });
  });

  describe('Pointer Events', () => {
    describe('follows focus & single select', () => {
      let treeInputs: TestTreeInputs<string>;

      beforeEach(() => {
        treeInputs = {
          activeItem: signal(undefined),
          disabled: signal(false),
          focusMode: signal('roving'),
          multi: signal(false),
          orientation: signal('vertical'),
          selectionMode: signal('follow'),
          skipDisabled: signal(true),
          textDirection: signal('ltr'),
          typeaheadDelay: signal(0),
          value: signal([]),
          wrap: signal(false),
          nav: signal(false),
          currentType: signal('page'),
        };
      });

      it('should navigate and select a single item on click', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item1 = getItemByValue(allItems(), 'Item 1');

        tree.onPointerdown(createClickEvent(item1.element()));
        expect(tree.activeItem()).toBe(item1);
        expect(tree.inputs.value()).toEqual(['Item 1']);
      });

      it('should not change selection when the tree is disabled', () => {
        treeInputs.disabled.set(true);
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item1 = getItemByValue(allItems(), 'Item 1');

        tree.onPointerdown(createClickEvent(item1.element()));
        expect(tree.inputs.value()).toEqual([]);
      });
    });

    describe('explicit focus & single select', () => {
      let treeInputs: TestTreeInputs<string>;

      beforeEach(() => {
        treeInputs = {
          activeItem: signal(undefined),
          disabled: signal(false),
          focusMode: signal('roving'),
          multi: signal(false),
          orientation: signal('vertical'),
          selectionMode: signal('explicit'),
          skipDisabled: signal(true),
          textDirection: signal('ltr'),
          typeaheadDelay: signal(0),
          value: signal([]),
          wrap: signal(false),
          nav: signal(false),
          currentType: signal('page'),
        };
      });

      it('should navigate and toggle selection on click', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item1 = getItemByValue(allItems(), 'Item 1');

        tree.onPointerdown(createClickEvent(item1.element()));
        expect(tree.activeItem()).toBe(item1);
        expect(tree.inputs.value()).toEqual(['Item 1']);

        tree.onPointerdown(createClickEvent(item1.element()));
        expect(tree.activeItem()).toBe(item1);
        expect(tree.inputs.value()).toEqual([]);
      });

      it('should not change selection when the tree is disabled', () => {
        treeInputs.disabled.set(true);
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item1 = getItemByValue(allItems(), 'Item 1');

        tree.onPointerdown(createClickEvent(item1.element()));
        expect(tree.inputs.value()).toEqual([]);
      });
    });

    describe('explicit focus & multi select', () => {
      let treeInputs: TestTreeInputs<string>;

      beforeEach(() => {
        treeInputs = {
          activeItem: signal(undefined),
          disabled: signal(false),
          focusMode: signal('roving'),
          multi: signal(true),
          orientation: signal('vertical'),
          selectionMode: signal('explicit'),
          skipDisabled: signal(true),
          textDirection: signal('ltr'),
          typeaheadDelay: signal(0),
          value: signal([]),
          wrap: signal(false),
          nav: signal(false),
          currentType: signal('page'),
        };
      });

      it('should navigate and toggle selection on click', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        const item1 = getItemByValue(allItems(), 'Item 1');

        tree.onPointerdown(createClickEvent(item0.element()));
        expect(tree.inputs.value()).toEqual(['Item 0']);

        tree.onPointerdown(createClickEvent(item1.element()));
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 1']);

        tree.onPointerdown(createClickEvent(item0.element()));
        expect(tree.inputs.value()).toEqual(['Item 1']);
      });

      it('should navigate and select range from anchor on shift + click', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        const item1 = getItemByValue(allItems(), 'Item 1');
        item0.expansion.open();

        tree.onKeydown(shift());
        tree.onPointerdown(createClickEvent(item1.element(), {shift: true}));
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 0-0', 'Item 0-1', 'Item 1']);
      });
    });

    describe('follows focus & multi select', () => {
      let treeInputs: TestTreeInputs<string>;

      beforeEach(() => {
        treeInputs = {
          activeItem: signal(undefined),
          disabled: signal(false),
          focusMode: signal('roving'),
          multi: signal(true),
          orientation: signal('vertical'),
          selectionMode: signal('follow'),
          skipDisabled: signal(true),
          textDirection: signal('ltr'),
          typeaheadDelay: signal(0),
          value: signal([]),
          wrap: signal(false),
          nav: signal(false),
          currentType: signal('page'),
        };
      });

      it('should navigate and select a single item on click', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        const item1 = getItemByValue(allItems(), 'Item 1');

        tree.onPointerdown(createClickEvent(item0.element()));
        expect(tree.inputs.value()).toEqual(['Item 0']);
        tree.onPointerdown(createClickEvent(item1.element()));
        expect(tree.inputs.value()).toEqual(['Item 1']);
      });

      it('should navigate and toggle selection on ctrl + click', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        const item1 = getItemByValue(allItems(), 'Item 1');

        tree.onPointerdown(createClickEvent(item0.element())); // Select and expand Item 0
        tree.onPointerdown(createClickEvent(item1.element(), {control: true}));
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 1']);
        tree.onPointerdown(createClickEvent(item0.element(), {control: true}));
        expect(tree.inputs.value()).toEqual(['Item 1']);
      });

      it('should navigate and select range from anchor on shift + click', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        const item2 = getItemByValue(allItems(), 'Item 2');

        tree.onPointerdown(createClickEvent(item0.element())); // Select and expand Item 0
        tree.onKeydown(shift());
        tree.onPointerdown(createClickEvent(item2.element(), {shift: true}));
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 0-0', 'Item 0-1', 'Item 1', 'Item 2']);
      });

      it('should select a new range on subsequent shift + clicks, deselecting previous range', () => {
        const {tree, allItems} = createTree(treeExample, treeInputs);
        const item0 = getItemByValue(allItems(), 'Item 0');
        const item1 = getItemByValue(allItems(), 'Item 1');
        const item0_0 = getItemByValue(allItems(), 'Item 0-0');
        item0.expansion.open();

        tree.onKeydown(shift());
        tree.onPointerdown(createClickEvent(item1.element(), {shift: true}));
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 0-0', 'Item 0-1', 'Item 1']);

        tree.onPointerdown(createClickEvent(item0_0.element(), {shift: true}));
        expect(tree.inputs.value()).toEqual(['Item 0', 'Item 0-0']);
      });

      it('should not select disabled items on click', () => {
        const localTreeData: TestTreeItem<string>[] = [{value: 'A', disabled: true}];
        const {tree, allItems} = createTree(localTreeData, treeInputs);
        const itemA = getItemByValue(allItems(), 'A');

        tree.onPointerdown(createClickEvent(itemA.element()));
        expect(tree.inputs.value()).toEqual([]);
        expect(tree.activeItem()).toBe(itemA);
      });
    });
  });

  describe('Expansion/Collapse', () => {
    let treeInputs: TestTreeInputs<string>;

    beforeEach(() => {
      treeInputs = {
        activeItem: signal(undefined),
        disabled: signal(false),
        focusMode: signal('roving'),
        multi: signal(false),
        orientation: signal('vertical'),
        selectionMode: signal('explicit'),
        skipDisabled: signal(true),
        textDirection: signal('ltr'),
        typeaheadDelay: signal(0),
        value: signal([]),
        wrap: signal(false),
        nav: signal(false),
        currentType: signal('page'),
      };
    });

    it('should correctly compute visible state', () => {
      const {allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item0_0 = getItemByValue(allItems(), 'Item 0-0');

      expect(item0_0.visible()).toBe(false);
      item0.expansion.open();
      expect(item0_0.visible()).toBe(true);
      item0.expansion.close();
      expect(item0_0.visible()).toBe(false);
    });

    it('should correctly compute expanded state', () => {
      const {allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');

      expect(item0.expanded()).toBe(false);
      item0.expansion.open();
      expect(item0.expanded()).toBe(true);
    });

    it('should expand an item on expandKey if collapsed (vertical)', () => {
      treeInputs.orientation.set('vertical');
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      tree.listBehavior.goto(item0);

      expect(item0.expanded()).toBe(false);
      tree.onKeydown(right());
      expect(item0.expanded()).toBe(true);
    });

    it('should move focus to the first child on expandKey if expanded and has children (vertical)', () => {
      treeInputs.orientation.set('vertical');
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item0_0 = getItemByValue(allItems(), 'Item 0-0');
      tree.listBehavior.goto(item0);
      item0.expansion.open();

      tree.onKeydown(right());
      expect(tree.activeItem()).toBe(item0_0);
    });

    it('should do nothing on expandKey if expanded and has no children (vertical)', () => {
      treeInputs.orientation.set('vertical');
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item1 = getItemByValue(allItems(), 'Item 1');
      tree.listBehavior.goto(item1);

      tree.onKeydown(right());
      expect(tree.activeItem()).toBe(item1);
    });

    it('should collapse an item on collapseKey if expanded (vertical)', () => {
      treeInputs.orientation.set('vertical');
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      tree.listBehavior.goto(item0);
      item0.expansion.open();

      expect(item0.expanded()).toBe(true);
      tree.onKeydown(left());
      expect(item0.expanded()).toBe(false);
    });

    it('should move focus to the parent on collapseKey if collapsed (vertical)', () => {
      treeInputs.orientation.set('vertical');
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item0_0 = getItemByValue(allItems(), 'Item 0-0');
      item0.expansion.open();
      tree.listBehavior.goto(item0_0);

      tree.onKeydown(left());
      expect(tree.activeItem()).toBe(item0);
    });

    it('should do nothing on collapseKey if collapsed and is a root item (vertical)', () => {
      treeInputs.orientation.set('vertical');
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      tree.listBehavior.goto(item0);

      tree.onKeydown(left());
      expect(tree.activeItem()).toBe(item0);
      expect(item0.expanded()).toBe(false);
    });

    it('should expand all sibling items on Shift + Asterisk (*)', () => {
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      const item1 = getItemByValue(allItems(), 'Item 1');
      const item2 = getItemByValue(allItems(), 'Item 2');
      tree.listBehavior.goto(item0);

      tree.onKeydown(asterisk({shift: true}));
      expect(item0.expanded()).toBe(true);
      expect(item1.expanded()).toBe(false);
      expect(item2.expanded()).toBe(true);
    });

    it('should toggle expansion on pointerdown (click)', () => {
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');

      expect(item0.expanded()).toBe(false);
      tree.onPointerdown(createClickEvent(item0.element()));
      expect(item0.expanded()).toBe(true);
      tree.onPointerdown(createClickEvent(item0.element()));
      expect(item0.expanded()).toBe(false);
    });

    it('should not toggle expansion on pointerdown if the item is not expandable', () => {
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item1 = getItemByValue(allItems(), 'Item 1');

      expect(item1.expanded()).toBe(false);
      tree.onPointerdown(createClickEvent(item1.element()));
      expect(item1.expanded()).toBe(false);
    });

    it('should not toggle expansion on pointerdown if the item is disabled', () => {
      const {tree, allItems, itemPatternInputsMap} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      itemPatternInputsMap.get(item0.id())!.disabled.set(true);

      tree.onPointerdown(createClickEvent(item0.element()));
      expect(item0.expanded()).toBe(false);
    });

    it('should not toggle expansion on pointerdown if the tree is disabled', () => {
      treeInputs.disabled.set(true);
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');

      tree.onPointerdown(createClickEvent(item0.element()));
      expect(item0.expanded()).toBe(false);
    });
  });

  describe('#setDefaultState', () => {
    let treeInputs: TestTreeInputs<string>;

    beforeEach(() => {
      treeInputs = {
        activeItem: signal(undefined),
        disabled: signal(false),
        focusMode: signal('roving'),
        multi: signal(false),
        orientation: signal('vertical'),
        selectionMode: signal('explicit'),
        skipDisabled: signal(true),
        textDirection: signal('ltr'),
        typeaheadDelay: signal(0),
        value: signal([]),
        wrap: signal(false),
        nav: signal(false),
        currentType: signal('page'),
      };
    });

    it('should set activeIndex to the first visible focusable item if no selection', () => {
      const localTreeData: TestTreeItem<string>[] = [
        {value: 'A', disabled: false},
        {value: 'B', disabled: false},
      ];
      const {tree, allItems} = createTree(localTreeData, treeInputs);

      tree.setDefaultState();
      expect(treeInputs.activeItem()).toBe(allItems()[0]);
    });

    it('should set activeIndex to the first visible focusable disabled item if skipDisabled is false and no selection', () => {
      const localTreeData: TestTreeItem<string>[] = [
        {value: 'A', disabled: true},
        {value: 'B', disabled: false},
      ];
      treeInputs.skipDisabled.set(false);
      const {tree, allItems} = createTree(localTreeData, treeInputs);

      tree.setDefaultState();
      expect(treeInputs.activeItem()).toBe(allItems()[0]);
    });

    it('should set activeIndex to the first selected visible focusable item', () => {
      const localTreeData: TestTreeItem<string>[] = [
        {value: 'A', disabled: false},
        {value: 'B', disabled: false},
        {value: 'C', disabled: false},
      ];
      treeInputs.value.set(['B']);
      const {tree, allItems} = createTree(localTreeData, treeInputs);

      tree.setDefaultState();
      expect(treeInputs.activeItem()).toBe(allItems()[1]);
    });

    it('should prioritize the first selected item in visible order', () => {
      const localTreeData: TestTreeItem<string>[] = [
        {value: 'A', disabled: false},
        {value: 'B', disabled: false},
        {value: 'C', disabled: false},
      ];
      treeInputs.value.set(['C', 'A']);
      const {tree, allItems} = createTree(localTreeData, treeInputs);

      tree.setDefaultState();
      expect(treeInputs.activeItem()).toBe(allItems()[0]);
    });

    it('should skip a selected disabled item if skipDisabled is true', () => {
      const localTreeData: TestTreeItem<string>[] = [
        {value: 'A', disabled: false},
        {value: 'B', disabled: true},
        {value: 'C', disabled: false},
      ];
      treeInputs.value.set(['B']);
      treeInputs.skipDisabled.set(true);
      const {tree, allItems} = createTree(localTreeData, treeInputs);

      tree.setDefaultState();
      expect(treeInputs.activeItem()).toBe(allItems()[0]);
    });

    it('should select a selected disabled item if skipDisabled is false', () => {
      const localTreeData: TestTreeItem<string>[] = [
        {value: 'A', disabled: false},
        {value: 'B', disabled: true},
        {value: 'C', disabled: false},
      ];
      treeInputs.value.set(['B']);
      treeInputs.skipDisabled.set(false);
      const {tree, allItems} = createTree(localTreeData, treeInputs);

      tree.setDefaultState();
      expect(treeInputs.activeItem()).toBe(allItems()[1]);
    });

    it('should set activeIndex to first visible focusable item if selected item is not visible', () => {
      const {tree, allItems} = createTree(treeExample, treeInputs);
      const item0 = getItemByValue(allItems(), 'Item 0');
      treeInputs.value.set(['Item 0-0']);

      expect(item0.expanded()).toBe(false);
      expect(getItemByValue(allItems(), 'Item 0-0').visible()).toBe(false);
      tree.setDefaultState();
      expect(treeInputs.activeItem()).toBe(item0);
    });
  });
});
