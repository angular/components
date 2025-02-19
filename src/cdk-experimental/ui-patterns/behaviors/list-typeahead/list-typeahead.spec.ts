/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal, signal, WritableSignal} from '@angular/core';
import {ListTypeaheadItem, ListTypeahead} from './list-typeahead';
import {fakeAsync, tick} from '@angular/core/testing';
import {ListNavigation} from '../list-navigation/list-navigation';

describe('List Typeahead', () => {
  interface TestItem extends ListTypeaheadItem {
    disabled: WritableSignal<boolean>;
  }

  function getItems(length: number): Signal<TestItem[]> {
    return signal(
      Array.from({length}).map((_, i) => ({
        index: signal(i),
        disabled: signal(false),
        searchTerm: signal(`Item ${i}`),
      })),
    );
  }

  describe('#search', () => {
    it('should navigate to an item', async () => {
      const items = getItems(5);
      const activeIndex = signal(0);
      const navigation = new ListNavigation({
        items,
        activeIndex,
        wrap: signal(false),
        skipDisabled: signal(false),
        directionality: signal('ltr'),
        orientation: signal('vertical'),
      });
      const typeahead = new ListTypeahead({
        navigation,
        typeaheadDelay: signal(0.5),
      });

      typeahead.search('i');
      expect(activeIndex()).toBe(1);

      typeahead.search('t');
      typeahead.search('e');
      typeahead.search('m');
      typeahead.search(' ');
      typeahead.search('3');
      expect(activeIndex()).toBe(3);
    });

    it('should reset after a delay', fakeAsync(async () => {
      const items = getItems(5);
      const activeIndex = signal(0);
      const navigation = new ListNavigation({
        items,
        activeIndex,
        wrap: signal(false),
        skipDisabled: signal(false),
        directionality: signal('ltr'),
        orientation: signal('vertical'),
      });
      const typeahead = new ListTypeahead({
        navigation,
        typeaheadDelay: signal(0.5),
      });

      typeahead.search('i');
      expect(activeIndex()).toBe(1);

      tick(500);

      typeahead.search('i');
      expect(activeIndex()).toBe(2);
    }));

    it('should skip disabled items', async () => {
      const items = getItems(5);
      const activeIndex = signal(0);
      const navigation = new ListNavigation({
        items,
        activeIndex,
        wrap: signal(false),
        skipDisabled: signal(true),
        directionality: signal('ltr'),
        orientation: signal('vertical'),
      });
      const typeahead = new ListTypeahead({
        navigation,
        typeaheadDelay: signal(0.5),
      });
      items()[1].disabled.set(true);

      typeahead.search('i');
      expect(activeIndex()).toBe(2);
    });

    it('should not skip disabled items', async () => {
      const items = getItems(5);
      const activeIndex = signal(0);
      const navigation = new ListNavigation({
        items,
        activeIndex,
        wrap: signal(false),
        skipDisabled: signal(false),
        directionality: signal('ltr'),
        orientation: signal('vertical'),
      });
      const typeahead = new ListTypeahead({
        navigation,
        typeaheadDelay: signal(0.5),
      });
      items()[1].disabled.set(true);

      typeahead.search('i');
      expect(activeIndex()).toBe(1);
    });

    it('should ignore keys like shift', async () => {
      const items = getItems(5);
      const activeIndex = signal(0);
      const navigation = new ListNavigation({
        items,
        activeIndex,
        wrap: signal(false),
        skipDisabled: signal(false),
        directionality: signal('ltr'),
        orientation: signal('vertical'),
      });
      const typeahead = new ListTypeahead({
        navigation,
        typeaheadDelay: signal(0.5),
      });

      typeahead.search('i');
      typeahead.search('t');
      typeahead.search('e');

      typeahead.search('Shift');

      typeahead.search('m');
      typeahead.search(' ');
      typeahead.search('2');
      expect(activeIndex()).toBe(2);
    });
  });
});
