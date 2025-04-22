/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal, signal, WritableSignal} from '@angular/core';
import {ListSelectionItem, ListSelection, ListSelectionInputs} from './list-selection';
import {getListFocus} from '../list-focus/list-focus.spec';
import {ListFocus} from '../list-focus/list-focus';

type TestItem = ListSelectionItem<number> & {
  disabled: WritableSignal<boolean>;
};
type TestInputs = Partial<ListSelectionInputs<TestItem, number>> & {
  numItems?: number;
};

function getSelection(inputs: TestInputs = {}): ListSelection<ListSelectionItem<number>, number> {
  const items = getItems(inputs.numItems ?? 5);
  const focusManager = getListFocus({...inputs, items}) as ListFocus<TestItem>;

  return new ListSelection({
    focusManager,
    ...focusManager.inputs,
    items,
    value: signal([]),
    multi: signal(false),
    selectionMode: signal('follow'),
    ...inputs,
  });
}

function getItems(length: number): Signal<TestItem[]> {
  return signal(
    Array.from({length}).map((_, i) => {
      return {
        value: signal(i),
        id: signal(`${i}`),
        disabled: signal(false),
        element: signal({focus: () => {}} as HTMLElement),
      };
    }),
  );
}

describe('List Selection', () => {
  describe('#select', () => {
    it('should select an item', () => {
      const selection = getSelection();
      selection.select(); // [0]
      expect(selection.inputs.value()).toEqual([0]);
    });

    it('should select multiple options', () => {
      const selection = getSelection({multi: signal(true)});
      const items = selection.inputs.items() as TestItem[];

      selection.select(); // [0]
      selection.inputs.focusManager.focus(items[1]);
      selection.select(); // [0, 1]

      expect(selection.inputs.value()).toEqual([0, 1]);
    });

    it('should not select multiple options', () => {
      const selection = getSelection({multi: signal(false)});
      const items = selection.inputs.items() as TestItem[];
      selection.select(); // [0]
      selection.inputs.focusManager.focus(items[1]);
      selection.select(); // [1]
      expect(selection.inputs.value()).toEqual([1]);
    });

    it('should not select disabled items', () => {
      const selection = getSelection();
      const items = selection.inputs.items() as TestItem[];
      items[0].disabled.set(true);
      selection.select(); // []
      expect(selection.inputs.value()).toEqual([]);
    });

    it('should do nothing to already selected items', () => {
      const selection = getSelection();
      selection.select(); // [0]
      selection.select(); // [0]
      expect(selection.inputs.value()).toEqual([0]);
    });
  });

  describe('#deselect', () => {
    it('should deselect an item', () => {
      const selection = getSelection();
      selection.deselect(); // []
      expect(selection.inputs.value().length).toBe(0);
    });

    it('should not deselect disabled items', () => {
      const selection = getSelection();
      const items = selection.inputs.items() as TestItem[];
      selection.select(); // [0]
      items[0].disabled.set(true);
      selection.deselect(); // [0]
      expect(selection.inputs.value()).toEqual([0]);
    });
  });

  describe('#toggle', () => {
    it('should select an unselected item', () => {
      const selection = getSelection();
      selection.toggle(); // [0]
      expect(selection.inputs.value()).toEqual([0]);
    });

    it('should deselect a selected item', () => {
      const selection = getSelection();
      selection.select(); // [0]
      selection.toggle(); // []
      expect(selection.inputs.value().length).toBe(0);
    });
  });

  describe('#toggleOne', () => {
    it('should select an unselected item', () => {
      const selection = getSelection({multi: signal(true)});
      selection.toggleOne(); // [0]
      expect(selection.inputs.value()).toEqual([0]);
    });

    it('should deselect a selected item', () => {
      const selection = getSelection({multi: signal(true)});
      selection.select(); // [0]
      selection.toggleOne(); // []
      expect(selection.inputs.value().length).toBe(0);
    });

    it('should only leave one item selected', () => {
      const selection = getSelection({multi: signal(true)});
      const items = selection.inputs.items() as TestItem[];
      selection.select(); // [0]
      selection.inputs.focusManager.focus(items[1]);
      selection.toggleOne(); // [1]
      expect(selection.inputs.value()).toEqual([1]);
    });
  });

  describe('#selectAll', () => {
    it('should select all items', () => {
      const selection = getSelection({multi: signal(true)});
      selection.selectAll();
      expect(selection.inputs.value()).toEqual([0, 1, 2, 3, 4]);
    });

    it('should do nothing if a list is not multiselectable', () => {
      const selection = getSelection({multi: signal(false)});
      selection.selectAll();
      expect(selection.inputs.value()).toEqual([]);
    });
  });

  describe('#deselectAll', () => {
    it('should deselect all items', () => {
      const selection = getSelection({multi: signal(true)});
      selection.selectAll(); // [0, 1, 2, 3, 4]
      selection.deselectAll(); // []
      expect(selection.inputs.value().length).toBe(0);
    });
  });

  describe('#toggleAll', () => {
    it('should select all items', () => {
      const selection = getSelection({multi: signal(true)});
      selection.toggleAll();
      expect(selection.inputs.value()).toEqual([0, 1, 2, 3, 4]);
    });

    it('should deselect all if all items are selected', () => {
      const selection = getSelection({multi: signal(true)});
      selection.selectAll();
      selection.toggleAll();
      expect(selection.inputs.value()).toEqual([]);
    });

    it('should ignore disabled items when determining if all items are selected', () => {
      const selection = getSelection({multi: signal(true)});
      const items = selection.inputs.items() as TestItem[];
      items[0].disabled.set(true);
      selection.toggleAll();
      expect(selection.inputs.value()).toEqual([1, 2, 3, 4]);
      selection.toggleAll();
      expect(selection.inputs.value()).toEqual([]);
    });
  });

  describe('#selectOne', () => {
    it('should select a single item', () => {
      const selection = getSelection({multi: signal(true)});
      const items = selection.inputs.items() as TestItem[];
      selection.selectOne(); // [0]
      selection.inputs.focusManager.focus(items[1]);
      selection.selectOne(); // [1]
      expect(selection.inputs.value()).toEqual([1]);
    });

    it('should not select disabled items', () => {
      const selection = getSelection({multi: signal(true)});
      const items = selection.inputs.items() as TestItem[];
      items[0].disabled.set(true);

      selection.select(); // []
      expect(selection.inputs.value()).toEqual([]);
    });

    it('should do nothing to already selected items', () => {
      const selection = getSelection({multi: signal(true)});
      selection.selectOne(); // [0]
      selection.selectOne(); // [0]
      expect(selection.inputs.value()).toEqual([0]);
    });
  });

  describe('#selectRange', () => {
    it('should select all items from an anchor at a lower index', () => {
      const selection = getSelection({multi: signal(true)});
      const items = selection.inputs.items() as TestItem[];
      selection.select(); // [0]
      selection.inputs.focusManager.focus(items[2]);
      selection.selectRange(); // [0, 1, 2]
      expect(selection.inputs.value()).toEqual([0, 1, 2]);
    });

    it('should select all items from an anchor at a higher index', () => {
      const selection = getSelection({
        multi: signal(true),
        activeIndex: signal(3),
      });
      const items = selection.inputs.items() as TestItem[];

      selection.select(); // [3]
      selection.inputs.focusManager.focus(items[1]);
      selection.selectRange(); // [3, 2, 1]

      expect(selection.inputs.value()).toEqual([3, 2, 1]);
    });

    it('should deselect items within the range when the range is changed', () => {
      const selection = getSelection({
        multi: signal(true),
        activeIndex: signal(2),
      });
      const items = selection.inputs.items() as TestItem[];

      selection.select(); // [2]
      expect(selection.inputs.value()).toEqual([2]);

      selection.inputs.focusManager.focus(items[4]);
      selection.selectRange(); // [2, 3, 4]
      expect(selection.inputs.value()).toEqual([2, 3, 4]);

      selection.inputs.focusManager.focus(items[0]);
      selection.selectRange(); // [2, 1, 0]
      expect(selection.inputs.value()).toEqual([2, 1, 0]);
    });

    it('should not select a disabled item', () => {
      const selection = getSelection({multi: signal(true)});
      const items = selection.inputs.items() as TestItem[];
      items[1].disabled.set(true);

      selection.select(); // [0]
      expect(selection.inputs.value()).toEqual([0]);

      selection.inputs.focusManager.focus(items[1]);
      selection.selectRange(); // [0]
      expect(selection.inputs.value()).toEqual([0]);

      selection.inputs.focusManager.focus(items[2]);
      selection.selectRange(); // [0, 2]
      expect(selection.inputs.value()).toEqual([0, 2]);
    });

    it('should not deselect a disabled item', () => {
      const selection = getSelection({multi: signal(true)});
      const items = selection.inputs.items() as TestItem[];

      selection.select(items[1]);
      items[1].disabled.set(true);

      selection.select(); // [0]
      selection.inputs.focusManager.focus(items[0]);
      expect(selection.inputs.value()).toEqual([1, 0]);

      selection.inputs.focusManager.focus(items[2]);
      selection.selectRange(); // [0, 1, 2]
      expect(selection.inputs.value()).toEqual([1, 0, 2]);

      selection.inputs.focusManager.focus(items[0]);
      selection.selectRange(); // [0]
      expect(selection.inputs.value()).toEqual([1, 0]);
    });
  });

  describe('#beginRangeSelection', () => {
    it('should set where a range is starting from', () => {
      const selection = getSelection({multi: signal(true)});
      const items = selection.inputs.items() as TestItem[];
      selection.inputs.focusManager.focus(items[2]);
      selection.beginRangeSelection();
      expect(selection.inputs.value()).toEqual([]);
      selection.inputs.focusManager.focus(items[4]);
      selection.selectRange(); // [2, 3, 4]
      expect(selection.inputs.value()).toEqual([2, 3, 4]);
    });

    it('should be able to select a range starting on a disabled item', () => {
      const selection = getSelection({multi: signal(true)});
      const items = selection.inputs.items() as TestItem[];
      items[0].disabled.set(true);
      selection.beginRangeSelection(0);
      selection.inputs.focusManager.focus(items[2]);
      selection.selectRange();
      expect(selection.inputs.value()).toEqual([1, 2]);
    });
  });
});
