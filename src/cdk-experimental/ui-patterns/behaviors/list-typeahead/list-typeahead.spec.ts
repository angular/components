/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {SignalLike, WritableSignalLike} from '../signal-like/signal-like';
import {ListTypeaheadItem, ListTypeahead} from './list-typeahead';
import {fakeAsync, tick} from '@angular/core/testing';
import {ListNavigation} from '../list-navigation/list-navigation';

describe('List Typeahead', () => {
  interface TestItem extends ListTypeaheadItem {
    disabled: WritableSignalLike<boolean>;
  }

  function getItems(length: number): SignalLike<TestItem[]> {
    return signal(
      Array.from({length}).map((_, i) => ({
        index: signal(i),
        disabled: signal(false),
        searchTerm: signal(`Item ${i}`),
      })),
    );
  }

  let items: SignalLike<TestItem[]>;
  let typeahead: ListTypeahead<TestItem>;
  let navigation: ListNavigation<TestItem>;

  beforeEach(() => {
    items = getItems(5);
    navigation = new ListNavigation({
      items,
      wrap: signal(false),
      activeIndex: signal(0),
      skipDisabled: signal(false),
      textDirection: signal('ltr'),
      orientation: signal('vertical'),
    });
    typeahead = new ListTypeahead({
      navigation,
      typeaheadDelay: signal(0.5),
    });
  });

  describe('#search', () => {
    it('should navigate to an item', () => {
      typeahead.search('i');
      expect(navigation.inputs.activeIndex()).toBe(1);

      typeahead.search('t');
      typeahead.search('e');
      typeahead.search('m');
      typeahead.search(' ');
      typeahead.search('3');
      expect(navigation.inputs.activeIndex()).toBe(3);
    });

    it('should reset after a delay', fakeAsync(() => {
      typeahead.search('i');
      expect(navigation.inputs.activeIndex()).toBe(1);

      tick(500);

      typeahead.search('i');
      expect(navigation.inputs.activeIndex()).toBe(2);
    }));

    it('should skip disabled items', () => {
      items()[1].disabled.set(true);
      (navigation.inputs.skipDisabled as WritableSignalLike<boolean>).set(true);
      typeahead.search('i');
      expect(navigation.inputs.activeIndex()).toBe(2);
    });

    it('should not skip disabled items', () => {
      items()[1].disabled.set(true);
      (navigation.inputs.skipDisabled as WritableSignalLike<boolean>).set(false);
      typeahead.search('i');
      expect(navigation.inputs.activeIndex()).toBe(1);
    });

    it('should ignore keys like shift', () => {
      typeahead.search('i');
      typeahead.search('t');
      typeahead.search('e');

      typeahead.search('Shift');

      typeahead.search('m');
      typeahead.search(' ');
      typeahead.search('2');
      expect(navigation.inputs.activeIndex()).toBe(2);
    });

    it('should not allow a query to begin with a space', () => {
      typeahead.search(' ');
      typeahead.search('i');
      typeahead.search('t');
      typeahead.search('e');
      typeahead.search('m');
      typeahead.search(' ');
      typeahead.search('3');
      expect(navigation.inputs.activeIndex()).toBe(3);
    });
  });
});
