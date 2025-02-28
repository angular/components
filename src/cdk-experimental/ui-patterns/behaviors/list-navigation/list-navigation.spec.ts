/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal, signal, WritableSignal} from '@angular/core';
import {ListNavigationItem, ListNavigation, ListNavigationInputs} from './list-navigation';

describe('List Navigation', () => {
  interface TestItem extends ListNavigationItem {
    disabled: WritableSignal<boolean>;
  }

  function getItems(length: number): Signal<TestItem[]> {
    return signal(
      Array.from({length}).map((_, i) => ({
        index: signal(i),
        disabled: signal(false),
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
      textDirection: signal('ltr'),
      orientation: signal('vertical'),
      ...args,
    });
  }

  describe('#goto', () => {
    it('should navigate to an item', () => {
      const items = getItems(5);
      const nav = getNavigation(items);

      expect(nav.inputs.activeIndex()).toBe(0);
      nav.goto(items()[3]);
      expect(nav.inputs.activeIndex()).toBe(3);
    });
  });

  describe('#next', () => {
    it('should navigate next', () => {
      const nav = getNavigation(getItems(3));
      nav.next(); // 0 -> 1
      expect(nav.inputs.activeIndex()).toBe(1);
    });

    it('should wrap', () => {
      const nav = getNavigation(getItems(3), {
        wrap: signal(true),
      });

      nav.next(); // 0 -> 1
      nav.next(); // 1 -> 2
      nav.next(); // 2 -> 0

      expect(nav.inputs.activeIndex()).toBe(0);
    });

    it('should not wrap', () => {
      const nav = getNavigation(getItems(3), {
        wrap: signal(false),
      });

      nav.next(); // 0 -> 1
      nav.next(); // 1 -> 2
      nav.next(); // 2 -> 2

      expect(nav.inputs.activeIndex()).toBe(2);
    });

    it('should skip disabled items', () => {
      const nav = getNavigation(getItems(3), {
        skipDisabled: signal(true),
      });
      nav.inputs.items()[1].disabled.set(true);

      nav.next(); // 0 -> 2
      expect(nav.inputs.activeIndex()).toBe(2);
    });

    it('should not skip disabled items', () => {
      const nav = getNavigation(getItems(3), {
        skipDisabled: signal(false),
      });
      nav.inputs.items()[1].disabled.set(true);

      nav.next(); // 0 -> 1
      expect(nav.inputs.activeIndex()).toBe(1);
    });

    it('should wrap and skip disabled items', () => {
      const nav = getNavigation(getItems(3), {
        wrap: signal(true),
        skipDisabled: signal(true),
      });
      nav.inputs.items()[2].disabled.set(true);

      nav.next(); // 0 -> 1
      nav.next(); // 1 -> 0

      expect(nav.inputs.activeIndex()).toBe(0);
    });

    it('should do nothing if other items are disabled', () => {
      const nav = getNavigation(getItems(3), {
        skipDisabled: signal(true),
      });
      nav.inputs.items()[1].disabled.set(true);
      nav.inputs.items()[2].disabled.set(true);

      nav.next(); // 0 -> 0
      expect(nav.inputs.activeIndex()).toBe(0);
    });

    it('should do nothing if there are no other items to navigate to', () => {
      const nav = getNavigation(getItems(1));
      nav.next(); // 0 -> 0
      expect(nav.inputs.activeIndex()).toBe(0);
    });
  });

  describe('#prev', () => {
    it('should navigate prev', () => {
      const nav = getNavigation(getItems(3), {
        activeIndex: signal(2),
      });
      nav.prev(); // 2 -> 1
      expect(nav.inputs.activeIndex()).toBe(1);
    });

    it('should wrap', () => {
      const nav = getNavigation(getItems(3), {
        wrap: signal(true),
      });
      nav.prev(); // 0 -> 2
      expect(nav.inputs.activeIndex()).toBe(2);
    });

    it('should not wrap', () => {
      const nav = getNavigation(getItems(3), {
        wrap: signal(false),
      });
      nav.prev(); // 0 -> 0
      expect(nav.inputs.activeIndex()).toBe(0);
    });

    it('should skip disabled items', () => {
      const nav = getNavigation(getItems(3), {
        activeIndex: signal(2),
        skipDisabled: signal(true),
      });
      nav.inputs.items()[1].disabled.set(true);

      nav.prev(); // 2 -> 0
      expect(nav.inputs.activeIndex()).toBe(0);
    });

    it('should not skip disabled items', () => {
      const nav = getNavigation(getItems(3), {
        activeIndex: signal(2),
        skipDisabled: signal(false),
      });
      nav.inputs.items()[1].disabled.set(true);

      nav.prev(); // 2 -> 1
      expect(nav.inputs.activeIndex()).toBe(1);
    });

    it('should wrap and skip disabled items', () => {
      const nav = getNavigation(getItems(3), {
        wrap: signal(true),
        activeIndex: signal(2),
        skipDisabled: signal(true),
      });
      nav.inputs.items()[0].disabled.set(true);

      nav.prev(); // 2 -> 1
      nav.prev(); // 1 -> 2

      expect(nav.inputs.activeIndex()).toBe(2);
    });

    it('should do nothing if other items are disabled', () => {
      const nav = getNavigation(getItems(3), {
        activeIndex: signal(2),
        skipDisabled: signal(true),
      });
      nav.inputs.items()[0].disabled.set(true);
      nav.inputs.items()[1].disabled.set(true);

      nav.prev(); // 2 -> 2
      expect(nav.inputs.activeIndex()).toBe(2);
    });

    it('should do nothing if there are no other items to navigate to', () => {
      const nav = getNavigation(getItems(1));
      nav.prev(); // 0 -> 0
      expect(nav.inputs.activeIndex()).toBe(0);
    });
  });

  describe('#first', () => {
    it('should navigate to the first item', () => {
      const nav = getNavigation(getItems(3), {
        activeIndex: signal(2),
      });

      nav.first();
      expect(nav.inputs.activeIndex()).toBe(0);
    });

    it('should skip disabled items', () => {
      const nav = getNavigation(getItems(3), {
        activeIndex: signal(2),
        skipDisabled: signal(true),
      });
      nav.inputs.items()[0].disabled.set(true);

      nav.first();
      expect(nav.inputs.activeIndex()).toBe(1);
    });

    it('should not skip disabled items', () => {
      const nav = getNavigation(getItems(3), {
        activeIndex: signal(2),
        skipDisabled: signal(false),
      });
      nav.inputs.items()[0].disabled.set(true);

      nav.first();
      expect(nav.inputs.activeIndex()).toBe(0);
    });
  });

  describe('#last', () => {
    it('should navigate to the last item', () => {
      const nav = getNavigation(getItems(3));
      nav.last();
      expect(nav.inputs.activeIndex()).toBe(2);
    });

    it('should skip disabled items', () => {
      const nav = getNavigation(getItems(3), {
        skipDisabled: signal(true),
      });
      nav.inputs.items()[2].disabled.set(true);

      nav.last();
      expect(nav.inputs.activeIndex()).toBe(1);
    });

    it('should not skip disabled items', () => {
      const nav = getNavigation(getItems(3), {
        skipDisabled: signal(false),
      });
      nav.inputs.items()[2].disabled.set(true);

      nav.last();
      expect(nav.inputs.activeIndex()).toBe(2);
    });
  });

  describe('#isFocusable', () => {
    it('should return true for enabled items', () => {
      const nav = getNavigation(getItems(3), {
        skipDisabled: signal(true),
      });

      expect(nav.isFocusable(nav.inputs.items()[0])).toBeTrue();
      expect(nav.isFocusable(nav.inputs.items()[1])).toBeTrue();
      expect(nav.isFocusable(nav.inputs.items()[2])).toBeTrue();
    });

    it('should return false for disabled items', () => {
      const nav = getNavigation(getItems(3), {
        skipDisabled: signal(true),
      });
      nav.inputs.items()[1].disabled.set(true);

      expect(nav.isFocusable(nav.inputs.items()[0])).toBeTrue();
      expect(nav.isFocusable(nav.inputs.items()[1])).toBeFalse();
      expect(nav.isFocusable(nav.inputs.items()[2])).toBeTrue();
    });

    it('should return true for disabled items if skip disabled is false', () => {
      const nav = getNavigation(getItems(3), {
        skipDisabled: signal(false),
      });
      nav.inputs.items()[1].disabled.set(true);

      expect(nav.isFocusable(nav.inputs.items()[0])).toBeTrue();
      expect(nav.isFocusable(nav.inputs.items()[1])).toBeTrue();
      expect(nav.isFocusable(nav.inputs.items()[2])).toBeTrue();
    });
  });
});
