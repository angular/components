/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {SignalLike} from '../signal-like/signal-like';
import {ListNavigation, ListNavigationInputs} from '../list-navigation/list-navigation';
import {ListFocus, ListFocusInputs, ListFocusItem} from './list-focus';

describe('List Focus', () => {
  interface TestItem extends ListFocusItem {
    tabindex: SignalLike<-1 | 0>;
  }

  function getItems(length: number): SignalLike<TestItem[]> {
    return signal(
      Array.from({length}).map((_, i) => ({
        index: signal(i),
        id: signal(`${i}`),
        tabindex: signal(-1),
        disabled: signal(false),
        element: signal({focus: () => {}} as HTMLElement),
      })),
    );
  }

  function getNavigation<T extends TestItem>(
    items: SignalLike<T[]>,
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

  function getFocus<T extends TestItem>(
    navigation: ListNavigation<T>,
    args: Partial<ListFocusInputs<T>> = {},
  ): ListFocus<T> {
    return new ListFocus({
      navigation,
      focusMode: signal('roving'),
      ...args,
    });
  }

  describe('roving', () => {
    it('should set the list tabindex to -1', () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const focus = getFocus(nav);
      const tabindex = computed(() => focus.getListTabindex());
      expect(tabindex()).toBe(-1);
    });

    it('should set the activedescendant to undefined', () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const focus = getFocus(nav);
      expect(focus.getActiveDescendant()).toBeUndefined();
    });

    it('should set the first items tabindex to 0', () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const focus = getFocus(nav);

      items().forEach(i => {
        i.tabindex = computed(() => focus.getItemTabindex(i));
      });

      expect(items()[0].tabindex()).toBe(0);
      expect(items()[1].tabindex()).toBe(-1);
      expect(items()[2].tabindex()).toBe(-1);
      expect(items()[3].tabindex()).toBe(-1);
      expect(items()[4].tabindex()).toBe(-1);
    });

    it('should update the tabindex of the active item when navigating', () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const focus = getFocus(nav);

      items().forEach(i => {
        i.tabindex = computed(() => focus.getItemTabindex(i));
      });

      nav.next();

      expect(items()[0].tabindex()).toBe(-1);
      expect(items()[1].tabindex()).toBe(0);
      expect(items()[2].tabindex()).toBe(-1);
      expect(items()[3].tabindex()).toBe(-1);
      expect(items()[4].tabindex()).toBe(-1);
    });
  });

  describe('activedescendant', () => {
    it('should set the list tabindex to 0', () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const focus = getFocus(nav, {
        focusMode: signal('activedescendant'),
      });
      const tabindex = computed(() => focus.getListTabindex());
      expect(tabindex()).toBe(0);
    });

    it('should set the activedescendant to the active items id', () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const focus = getFocus(nav, {
        focusMode: signal('activedescendant'),
      });
      expect(focus.getActiveDescendant()).toBe(items()[0].id());
    });

    it('should set the tabindex of all items to -1', () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const focus = getFocus(nav, {
        focusMode: signal('activedescendant'),
      });

      items().forEach(i => {
        i.tabindex = computed(() => focus.getItemTabindex(i));
      });

      expect(items()[0].tabindex()).toBe(-1);
      expect(items()[1].tabindex()).toBe(-1);
      expect(items()[2].tabindex()).toBe(-1);
      expect(items()[3].tabindex()).toBe(-1);
      expect(items()[4].tabindex()).toBe(-1);
    });

    it('should update the activedescendant of the list when navigating', () => {
      const items = getItems(5);
      const nav = getNavigation(items);
      const focus = getFocus(nav, {
        focusMode: signal('activedescendant'),
      });

      nav.next();
      expect(focus.getActiveDescendant()).toBe(items()[1].id());
    });
  });
});
