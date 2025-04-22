/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignal} from '@angular/core';
import {ListNavigation, ListNavigationInputs, ListNavigationItem} from './list-navigation';
import {getListFocus} from '../list-focus/list-focus.spec';
import {ListFocusInputs} from '../list-focus/list-focus';

type TestItem = ListNavigationItem & {
  disabled: WritableSignal<boolean>;
};

type TestInputs = Partial<ListNavigationInputs & ListFocusInputs<TestItem>> & {
  numItems?: number;
};

function getNavigation(inputs: TestInputs = {}): ListNavigation<ListNavigationItem> {
  const focusManager = getListFocus(inputs);
  return new ListNavigation({
    focusManager,
    ...focusManager.inputs,
    wrap: signal(false),
    textDirection: signal('ltr'),
    orientation: signal('vertical'),
    ...inputs,
  });
}

describe('List Navigation', () => {
  describe('#goto', () => {
    it('should navigate to an item', () => {
      const nav = getNavigation();
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(0);
      nav.goto(nav.inputs.focusManager.inputs.items()[3]);
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(3);
    });
  });

  describe('#next', () => {
    it('should navigate next', () => {
      const nav = getNavigation();
      nav.next(); // 0 -> 1
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(1);
    });

    it('should wrap', () => {
      const nav = getNavigation({wrap: signal(true)});
      nav.next(); // 0 -> 1
      nav.next(); // 1 -> 2
      nav.next(); // 2 -> 3
      nav.next(); // 3 -> 4
      nav.next(); // 4 -> 0
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(0);
    });

    it('should not wrap', () => {
      const nav = getNavigation({wrap: signal(false)});
      nav.next(); // 0 -> 1
      nav.next(); // 1 -> 2
      nav.next(); // 2 -> 3
      nav.next(); // 3 -> 4
      nav.next(); // 4 -> 4
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(4);
    });

    it('should skip disabled items', () => {
      const nav = getNavigation({skipDisabled: signal(true)});
      const items = nav.inputs.focusManager.inputs.items() as TestItem[];
      items[1].disabled.set(true);
      nav.next(); // 0 -> 2
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(2);
    });

    it('should not skip disabled items', () => {
      const nav = getNavigation({skipDisabled: signal(false)});
      const items = nav.inputs.focusManager.inputs.items() as TestItem[];
      items[1].disabled.set(true);
      nav.next(); // 0 -> 1
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(1);
    });

    it('should wrap and skip disabled items', () => {
      const nav = getNavigation({
        wrap: signal(true),
        skipDisabled: signal(true),
      });
      const items = nav.inputs.focusManager.inputs.items() as TestItem[];
      items[2].disabled.set(true);
      items[3].disabled.set(true);
      items[4].disabled.set(true);

      nav.next(); // 0 -> 1
      nav.next(); // 1 -> 0

      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(0);
    });

    it('should do nothing if other items are disabled', () => {
      const nav = getNavigation({skipDisabled: signal(true)});
      const items = nav.inputs.focusManager.inputs.items() as TestItem[];
      items[1].disabled.set(true);
      items[2].disabled.set(true);
      items[3].disabled.set(true);
      items[4].disabled.set(true);
      nav.next(); // 0 -> 0
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(0);
    });

    it('should do nothing if there are no other items to navigate to', () => {
      const nav = getNavigation({numItems: 1});
      nav.next(); // 0 -> 0
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(0);
    });
  });

  describe('#prev', () => {
    it('should navigate prev', () => {
      const nav = getNavigation({activeIndex: signal(2)});
      nav.prev(); // 2 -> 1
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(1);
    });

    it('should wrap', () => {
      const nav = getNavigation({wrap: signal(true)});
      nav.prev(); // 0 -> 4
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(4);
    });

    it('should not wrap', () => {
      const nav = getNavigation({wrap: signal(false)});
      nav.prev(); // 0 -> 0
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(0);
    });

    it('should skip disabled items', () => {
      const nav = getNavigation({
        activeIndex: signal(2),
        skipDisabled: signal(true),
      });
      const items = nav.inputs.focusManager.inputs.items() as TestItem[];
      items[1].disabled.set(true);
      nav.prev(); // 2 -> 0
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(0);
    });

    it('should not skip disabled items', () => {
      const nav = getNavigation({
        activeIndex: signal(2),
        skipDisabled: signal(false),
      });
      const items = nav.inputs.focusManager.inputs.items() as TestItem[];
      items[1].disabled.set(true);
      nav.prev(); // 2 -> 1
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(1);
    });

    it('should wrap and skip disabled items', () => {
      const nav = getNavigation({
        wrap: signal(true),
        activeIndex: signal(2),
        skipDisabled: signal(true),
      });
      const items = nav.inputs.focusManager.inputs.items() as TestItem[];
      items[0].disabled.set(true);
      items[1].disabled.set(true);
      nav.prev(); // 2 -> 4
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(4);
    });

    it('should do nothing if other items are disabled', () => {
      const nav = getNavigation({
        skipDisabled: signal(true),
      });
      const items = nav.inputs.focusManager.inputs.items() as TestItem[];
      items[1].disabled.set(true);
      items[2].disabled.set(true);
      items[3].disabled.set(true);
      items[4].disabled.set(true);
      nav.prev(); // 0 -> 0
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(0);
    });

    it('should do nothing if there are no other items to navigate to', () => {
      const nav = getNavigation({numItems: 1});
      nav.prev(); // 0 -> 0
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(0);
    });
  });

  describe('#first', () => {
    it('should navigate to the first item', () => {
      const nav = getNavigation({activeIndex: signal(2)});
      nav.first();
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(0);
    });

    it('should skip disabled items', () => {
      const nav = getNavigation({
        activeIndex: signal(2),
        skipDisabled: signal(true),
      });
      const items = nav.inputs.focusManager.inputs.items() as TestItem[];
      items[0].disabled.set(true);
      nav.first();
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(1);
    });

    it('should not skip disabled items', () => {
      const nav = getNavigation({
        activeIndex: signal(2),
        skipDisabled: signal(false),
      });
      const items = nav.inputs.focusManager.inputs.items() as TestItem[];
      items[0].disabled.set(true);
      nav.first();
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(0);
    });
  });

  describe('#last', () => {
    it('should navigate to the last item', () => {
      const nav = getNavigation();
      nav.last();
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(4);
    });

    it('should skip disabled items', () => {
      const nav = getNavigation({
        skipDisabled: signal(true),
      });
      const items = nav.inputs.focusManager.inputs.items() as TestItem[];
      items[4].disabled.set(true);
      nav.last();
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(3);
    });

    it('should not skip disabled items', () => {
      const nav = getNavigation({
        skipDisabled: signal(false),
      });
      const items = nav.inputs.focusManager.inputs.items() as TestItem[];
      items[4].disabled.set(true);
      nav.last();
      expect(nav.inputs.focusManager.inputs.activeIndex()).toBe(4);
    });
  });
});
