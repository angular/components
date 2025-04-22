/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal, signal, WritableSignal} from '@angular/core';
import {ListFocus, ListFocusInputs, ListFocusItem} from './list-focus';

type TestItem = ListFocusItem & {
  disabled: WritableSignal<boolean>;
};

type TestInputs = Partial<ListFocusInputs<ListFocusItem>> & {
  numItems?: number;
};

export function getListFocus(inputs: TestInputs = {}): ListFocus<ListFocusItem> {
  return new ListFocus({
    activeIndex: signal(0),
    disabled: signal(false),
    skipDisabled: signal(false),
    focusMode: signal('roving'),
    items: getItems(inputs.numItems ?? 5),
    ...inputs,
  });
}

function getItems(length: number): Signal<ListFocusItem[]> {
  return signal(
    Array.from({length}).map((_, i) => {
      return {
        id: signal(`${i}`),
        disabled: signal(false),
        element: signal({focus: () => {}} as HTMLElement),
      };
    }),
  );
}

describe('List Focus', () => {
  describe('roving', () => {
    let focusManager: ListFocus<ListFocusItem>;

    beforeEach(() => {
      focusManager = getListFocus({focusMode: signal('roving')});
    });

    it('should set the list tabindex to -1', () => {
      expect(focusManager.getListTabindex()).toBe(-1);
    });

    it('should set the activedescendant to undefined', () => {
      expect(focusManager.getActiveDescendant()).toBeUndefined();
    });

    it('should set the tabindex based on the active index', () => {
      const items = focusManager.inputs.items() as TestItem[];
      focusManager.inputs.activeIndex.set(2);
      expect(focusManager.getItemTabindex(items[0])).toBe(-1);
      expect(focusManager.getItemTabindex(items[1])).toBe(-1);
      expect(focusManager.getItemTabindex(items[2])).toBe(0);
      expect(focusManager.getItemTabindex(items[3])).toBe(-1);
      expect(focusManager.getItemTabindex(items[4])).toBe(-1);
    });
  });

  describe('activedescendant', () => {
    let focusManager: ListFocus<ListFocusItem>;

    beforeEach(() => {
      focusManager = getListFocus({focusMode: signal('activedescendant')});
    });

    it('should set the list tabindex to 0', () => {
      expect(focusManager.getListTabindex()).toBe(0);
    });

    it('should set the activedescendant to the active items id', () => {
      expect(focusManager.getActiveDescendant()).toBe(focusManager.inputs.items()[0].id());
    });

    it('should set the tabindex of all items to -1', () => {
      const items = focusManager.inputs.items() as TestItem[];
      focusManager.inputs.activeIndex.set(0);
      expect(focusManager.getItemTabindex(items[0])).toBe(-1);
      expect(focusManager.getItemTabindex(items[1])).toBe(-1);
      expect(focusManager.getItemTabindex(items[2])).toBe(-1);
      expect(focusManager.getItemTabindex(items[3])).toBe(-1);
      expect(focusManager.getItemTabindex(items[4])).toBe(-1);
    });

    it('should update the activedescendant of the list when navigating', () => {
      focusManager.inputs.activeIndex.set(1);
      expect(focusManager.getActiveDescendant()).toBe(focusManager.inputs.items()[1].id());
    });
  });

  describe('#isFocusable', () => {
    it('should return true for enabled items', () => {
      const focusManager = getListFocus({skipDisabled: signal(true)});
      const items = focusManager.inputs.items() as TestItem[];
      expect(focusManager.isFocusable(items[0])).toBeTrue();
      expect(focusManager.isFocusable(items[1])).toBeTrue();
      expect(focusManager.isFocusable(items[2])).toBeTrue();
    });

    it('should return false for disabled items', () => {
      const focusManager = getListFocus({skipDisabled: signal(true)});
      const items = focusManager.inputs.items() as TestItem[];
      items[1].disabled.set(true);

      expect(focusManager.isFocusable(items[0])).toBeTrue();
      expect(focusManager.isFocusable(items[1])).toBeFalse();
      expect(focusManager.isFocusable(items[2])).toBeTrue();
    });

    it('should return true for disabled items if skip disabled is false', () => {
      const focusManager = getListFocus({skipDisabled: signal(false)});
      const items = focusManager.inputs.items() as TestItem[];
      items[1].disabled.set(true);

      expect(focusManager.isFocusable(items[0])).toBeTrue();
      expect(focusManager.isFocusable(items[1])).toBeTrue();
      expect(focusManager.isFocusable(items[2])).toBeTrue();
    });
  });
});
