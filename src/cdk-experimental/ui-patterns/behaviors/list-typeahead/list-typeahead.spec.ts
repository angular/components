/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal, signal, WritableSignal} from '@angular/core';
import {ListTypeaheadItem, ListTypeahead, ListTypeaheadInputs} from './list-typeahead';
import {fakeAsync, tick} from '@angular/core/testing';
import {getListFocus} from '../list-focus/list-focus.spec';
import {ListFocus} from '../list-focus/list-focus';

type TestItem = ListTypeaheadItem & {
  disabled: WritableSignal<boolean>;
};
type TestInputs = Partial<ListTypeaheadInputs> & {
  numItems?: number;
};

function getTypeahead(inputs: TestInputs = {}): ListTypeahead<TestItem> {
  const items = getItems(inputs.numItems ?? 5);
  const focusManager = getListFocus({...inputs, items}) as ListFocus<TestItem>;

  return new ListTypeahead({
    focusManager,
    ...focusManager.inputs,
    typeaheadDelay: signal(0.5),
    ...inputs,
  });
}

function getItems(length: number): Signal<TestItem[]> {
  return signal(
    Array.from({length}).map((_, i) => {
      return {
        searchTerm: signal(`Item ${i}`),
        id: signal(`${i}`),
        disabled: signal(false),
        element: signal({focus: () => {}} as HTMLElement),
      };
    }),
  );
}

describe('List Typeahead', () => {
  let items: TestItem[];
  let typeahead: ListTypeahead<TestItem>;

  beforeEach(() => {
    typeahead = getTypeahead();
    items = typeahead.inputs.focusManager.inputs.items();
  });

  describe('#search', () => {
    it('should navigate to an item', () => {
      typeahead.search('i');
      expect(typeahead.inputs.focusManager.inputs.activeIndex()).toBe(1);

      typeahead.search('t');
      typeahead.search('e');
      typeahead.search('m');
      typeahead.search(' ');
      typeahead.search('3');
      expect(typeahead.inputs.focusManager.inputs.activeIndex()).toBe(3);
    });

    it('should reset after a delay', fakeAsync(() => {
      typeahead.search('i');
      expect(typeahead.inputs.focusManager.inputs.activeIndex()).toBe(1);

      tick(500);

      typeahead.search('i');
      expect(typeahead.inputs.focusManager.inputs.activeIndex()).toBe(2);
    }));

    it('should skip disabled items', () => {
      items[1].disabled.set(true);
      (typeahead.inputs.focusManager.inputs.skipDisabled as WritableSignal<boolean>).set(true);
      typeahead.search('i');
      expect(typeahead.inputs.focusManager.inputs.activeIndex()).toBe(2);
    });

    it('should not skip disabled items', () => {
      items[1].disabled.set(true);
      (typeahead.inputs.focusManager.inputs.skipDisabled as WritableSignal<boolean>).set(false);
      typeahead.search('i');
      expect(typeahead.inputs.focusManager.inputs.activeIndex()).toBe(1);
    });

    it('should ignore keys like shift', () => {
      typeahead.search('i');
      typeahead.search('t');
      typeahead.search('e');

      typeahead.search('Shift');

      typeahead.search('m');
      typeahead.search(' ');
      typeahead.search('2');
      expect(typeahead.inputs.focusManager.inputs.activeIndex()).toBe(2);
    });

    it('should not allow a query to begin with a space', () => {
      typeahead.search(' ');
      typeahead.search('i');
      typeahead.search('t');
      typeahead.search('e');
      typeahead.search('m');
      typeahead.search(' ');
      typeahead.search('3');
      expect(typeahead.inputs.focusManager.inputs.activeIndex()).toBe(3);
    });
  });
});
