/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignalLike} from '../signal-like/signal-like';
import {ListNavigation, ListNavigationInputs, ListNavigationItem} from './list-navigation';
import {getListFocus} from '../list-focus/list-focus.spec';

type TestItem = ListNavigationItem & {
  disabled: WritableSignalLike<boolean>;
};
type TestInputs = Partial<ListNavigationInputs<ListNavigationItem>> & {
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
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[0]);
      nav.goto(nav.inputs.items()[3]);
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[3]);
    });
  });

  describe('#next', () => {
    it('should navigate next', () => {
      const nav = getNavigation();
      nav.next(); // 0 -> 1
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[1]);
    });

    it('should peek next item', () => {
      const nav = getNavigation();
      expect(nav.peekNext()).toBe(nav.inputs.items()[1]);
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[0]);
    });

    it('should wrap', () => {
      const nav = getNavigation({wrap: signal(true)});
      nav.next(); // 0 -> 1
      nav.next(); // 1 -> 2
      nav.next(); // 2 -> 3
      nav.next(); // 3 -> 4
      nav.next(); // 4 -> 0
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[0]);
    });

    it('should not wrap', () => {
      const nav = getNavigation({wrap: signal(false)});
      nav.next(); // 0 -> 1
      nav.next(); // 1 -> 2
      nav.next(); // 2 -> 3
      nav.next(); // 3 -> 4
      nav.next(); // 4 -> 4
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[4]);
    });

    it('should skip disabled items', () => {
      const nav = getNavigation({softDisabled: signal(false)});
      const items = nav.inputs.items() as TestItem[];
      items[1].disabled.set(true);
      nav.next(); // 0 -> 2
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[2]);
    });

    it('should not skip disabled items', () => {
      const nav = getNavigation({softDisabled: signal(true)});
      const items = nav.inputs.items() as TestItem[];
      items[1].disabled.set(true);
      nav.next(); // 0 -> 1
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[1]);
    });

    it('should wrap and skip disabled items', () => {
      const nav = getNavigation({
        wrap: signal(true),
        softDisabled: signal(false),
      });
      const items = nav.inputs.items() as TestItem[];
      items[2].disabled.set(true);
      items[3].disabled.set(true);
      items[4].disabled.set(true);

      nav.next(); // 0 -> 1
      nav.next(); // 1 -> 0

      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[0]);
    });

    it('should do nothing if other items are disabled', () => {
      const nav = getNavigation({softDisabled: signal(false)});
      const items = nav.inputs.items() as TestItem[];
      items[1].disabled.set(true);
      items[2].disabled.set(true);
      items[3].disabled.set(true);
      items[4].disabled.set(true);
      nav.next(); // 0 -> 0
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[0]);
    });

    it('should do nothing if there are no other items to navigate to', () => {
      const nav = getNavigation({numItems: 1});
      nav.next(); // 0 -> 0
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[0]);
    });
  });

  describe('#prev', () => {
    it('should navigate prev', () => {
      const nav = getNavigation();
      nav.goto(nav.inputs.items()[2]);
      nav.prev(); // 2 -> 1
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[1]);
    });

    it('should peek previous item', () => {
      const nav = getNavigation();
      nav.goto(nav.inputs.items()[2]);
      expect(nav.peekPrev()).toBe(nav.inputs.items()[1]);
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[2]);
    });

    it('should wrap', () => {
      const nav = getNavigation({wrap: signal(true)});
      nav.prev(); // 0 -> 4
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[4]);
    });

    it('should not wrap', () => {
      const nav = getNavigation({wrap: signal(false)});
      nav.prev(); // 0 -> 0
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[0]);
    });

    it('should skip disabled items', () => {
      const nav = getNavigation({softDisabled: signal(false)});
      nav.goto(nav.inputs.items()[2]);
      const items = nav.inputs.items() as TestItem[];
      items[1].disabled.set(true);
      nav.prev(); // 2 -> 0
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[0]);
    });

    it('should not skip disabled items', () => {
      const nav = getNavigation({softDisabled: signal(true)});
      nav.goto(nav.inputs.items()[2]);
      const items = nav.inputs.items() as TestItem[];
      items[1].disabled.set(true);
      nav.prev(); // 2 -> 1
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[1]);
    });

    it('should wrap and skip disabled items', () => {
      const nav = getNavigation({
        wrap: signal(true),
        softDisabled: signal(false),
      });
      nav.goto(nav.inputs.items()[2]);
      const items = nav.inputs.items() as TestItem[];
      items[0].disabled.set(true);
      items[1].disabled.set(true);
      nav.prev(); // 2 -> 4
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[4]);
    });

    it('should do nothing if other items are disabled', () => {
      const nav = getNavigation({
        softDisabled: signal(false),
      });
      const items = nav.inputs.items() as TestItem[];
      items[1].disabled.set(true);
      items[2].disabled.set(true);
      items[3].disabled.set(true);
      items[4].disabled.set(true);
      nav.prev(); // 0 -> 0
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[0]);
    });

    it('should do nothing if there are no other items to navigate to', () => {
      const nav = getNavigation({numItems: 1});
      nav.prev(); // 0 -> 0
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[0]);
    });
  });

  describe('#first', () => {
    it('should navigate to the first item', () => {
      const nav = getNavigation();
      nav.goto(nav.inputs.items()[2]);
      nav.first();
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[0]);
    });

    it('should skip disabled items', () => {
      const nav = getNavigation({softDisabled: signal(false)});
      nav.goto(nav.inputs.items()[2]);
      const items = nav.inputs.items() as TestItem[];
      items[0].disabled.set(true);
      nav.first();
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[1]);
    });

    it('should not skip disabled items', () => {
      const nav = getNavigation({softDisabled: signal(true)});
      nav.goto(nav.inputs.items()[2]);
      const items = nav.inputs.items() as TestItem[];
      items[0].disabled.set(true);
      nav.first();
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[0]);
    });
  });

  describe('#last', () => {
    it('should navigate to the last item', () => {
      const nav = getNavigation();
      nav.last();
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[4]);
    });

    it('should skip disabled items', () => {
      const nav = getNavigation({
        softDisabled: signal(false),
      });
      const items = nav.inputs.items() as TestItem[];
      items[4].disabled.set(true);
      nav.last();
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[3]);
    });

    it('should not skip disabled items', () => {
      const nav = getNavigation({
        softDisabled: signal(true),
      });
      const items = nav.inputs.items() as TestItem[];
      items[4].disabled.set(true);
      nav.last();
      expect(nav.inputs.activeItem()).toBe(nav.inputs.items()[4]);
    });
  });

  describe('with items subset', () => {
    it('should navigate only within the provided subset for next/prev', () => {
      const nav = getNavigation();
      const allItems = nav.inputs.items();
      const subset = [allItems[0], allItems[2], allItems[4]];

      // Start at 0
      expect(nav.inputs.activeItem()).toBe(allItems[0]);

      // next(subset) -> 2 (skip 1)
      nav.next({focusElement: false, items: subset});
      expect(nav.inputs.activeItem()).toBe(allItems[2]);

      // next(subset) -> 4 (skip 3)
      nav.next({focusElement: false, items: subset});
      expect(nav.inputs.activeItem()).toBe(allItems[4]);

      // prev(subset) -> 2 (skip 3)
      nav.prev({focusElement: false, items: subset});
      expect(nav.inputs.activeItem()).toBe(allItems[2]);
    });

    it('should wrap within the subset', () => {
      const nav = getNavigation({wrap: signal(true)});
      const allItems = nav.inputs.items();
      const subset = [allItems[0], allItems[2], allItems[4]];

      nav.goto(allItems[4]);

      // next(subset) -> 0 (wrap)
      nav.next({focusElement: false, items: subset});
      expect(nav.inputs.activeItem()).toBe(allItems[0]);

      // prev(subset) -> 4 (wrap)
      nav.prev({focusElement: false, items: subset});
      expect(nav.inputs.activeItem()).toBe(allItems[4]);
    });

    it('should find first/last within the subset', () => {
      const nav = getNavigation();
      const allItems = nav.inputs.items();
      const subset = [allItems[1], allItems[2], allItems[3]];

      nav.first({focusElement: false, items: subset});
      expect(nav.inputs.activeItem()).toBe(allItems[1]);

      nav.last({focusElement: false, items: subset});
      expect(nav.inputs.activeItem()).toBe(allItems[3]);
    });
  });
});
