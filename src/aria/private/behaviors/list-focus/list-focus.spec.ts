/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SignalLike, signal, WritableSignalLike} from '../signal-like/signal-like';
import {ListFocus, ListFocusInputs, ListFocusItem} from './list-focus';

type TestItem = ListFocusItem & {
  disabled: WritableSignalLike<boolean>;
};

type TestInputs = Partial<ListFocusInputs<ListFocusItem>> & {
  numItems?: number;
};

export function getListFocus(inputs: TestInputs = {}): ListFocus<ListFocusItem> {
  const items = inputs.items || getItems(inputs.numItems ?? 5);
  return new ListFocus({
    activeItem: signal(items()[0]),
    disabled: signal(false),
    softDisabled: signal(true),
    focusMode: signal('roving'),
    element: signal({focus: () => {}} as HTMLElement),
    items: items,
    ...inputs,
  });
}

function getItems(length: number): SignalLike<ListFocusItem[]> {
  return signal(
    Array.from({length}).map((_, i) => {
      return {
        id: signal(`${i}`),
        disabled: signal(false),
        element: signal({focus: () => {}} as HTMLElement),
        index: signal(i),
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

    it('should set the list   to -1', () => {
      expect(focusManager.getListTabIndex()).toBe(-1);
    });

    it('should set the active descendant to undefined', () => {
      expect(focusManager.getActiveDescendant()).toBeUndefined();
    });

    it('should set the tab index based on the active index', () => {
      const items = focusManager.inputs.items() as TestItem[];
      focusManager.inputs.activeItem.set(focusManager.inputs.items()[2]);
      expect(focusManager.getItemTabIndex(items[0])).toBe(-1);
      expect(focusManager.getItemTabIndex(items[1])).toBe(-1);
      expect(focusManager.getItemTabIndex(items[2])).toBe(0);
      expect(focusManager.getItemTabIndex(items[3])).toBe(-1);
      expect(focusManager.getItemTabIndex(items[4])).toBe(-1);
    });
  });

  describe('activedescendant', () => {
    let focusManager: ListFocus<ListFocusItem>;

    beforeEach(() => {
      focusManager = getListFocus({focusMode: signal('activedescendant')});
    });

    it('should set the list tab index to 0', () => {
      expect(focusManager.getListTabIndex()).toBe(0);
    });

    it('should set the activedescendant to the active items id', () => {
      expect(focusManager.getActiveDescendant()).toBe(focusManager.inputs.items()[0].id());
    });

    it('should set the tab index of all items to -1', () => {
      const items = focusManager.inputs.items() as TestItem[];
      focusManager.inputs.activeItem.set(focusManager.inputs.items()[0]);
      expect(focusManager.getItemTabIndex(items[0])).toBe(-1);
      expect(focusManager.getItemTabIndex(items[1])).toBe(-1);
      expect(focusManager.getItemTabIndex(items[2])).toBe(-1);
      expect(focusManager.getItemTabIndex(items[3])).toBe(-1);
      expect(focusManager.getItemTabIndex(items[4])).toBe(-1);
    });

    it('should update the activedescendant of the list when navigating', () => {
      focusManager.inputs.activeItem.set(focusManager.inputs.items()[1]);
      expect(focusManager.getActiveDescendant()).toBe(focusManager.inputs.items()[1].id());
    });

    it('should focus the list element when focusing an item', () => {
      const focusSpy = spyOn(focusManager.inputs.element()!, 'focus');
      focusManager.focus(focusManager.inputs.items()[1]);
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('#isFocusable', () => {
    it('should return true for enabled items', () => {
      const focusManager = getListFocus({softDisabled: signal(false)});
      const items = focusManager.inputs.items() as TestItem[];
      expect(focusManager.isFocusable(items[0])).toBeTrue();
      expect(focusManager.isFocusable(items[1])).toBeTrue();
      expect(focusManager.isFocusable(items[2])).toBeTrue();
    });

    it('should return false for disabled items', () => {
      const focusManager = getListFocus({softDisabled: signal(false)});
      const items = focusManager.inputs.items() as TestItem[];
      items[1].disabled.set(true);

      expect(focusManager.isFocusable(items[0])).toBeTrue();
      expect(focusManager.isFocusable(items[1])).toBeFalse();
      expect(focusManager.isFocusable(items[2])).toBeTrue();
    });

    it('should return true for disabled items if soft disabled is true', () => {
      const focusManager = getListFocus({softDisabled: signal(true)});
      const items = focusManager.inputs.items() as TestItem[];
      items[1].disabled.set(true);

      expect(focusManager.isFocusable(items[0])).toBeTrue();
      expect(focusManager.isFocusable(items[1])).toBeTrue();
      expect(focusManager.isFocusable(items[2])).toBeTrue();
    });
  });
});
