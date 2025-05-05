/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {ListSelection, ListSelectionItem} from '../behaviors/list-selection/list-selection';
import {ListTypeaheadItem} from '../behaviors/list-typeahead/list-typeahead';
import {ListNavigation, ListNavigationItem} from '../behaviors/list-navigation/list-navigation';
import {ListFocus, ListFocusItem} from '../behaviors/list-focus/list-focus';
import {SignalLike} from '../behaviors/signal-like/signal-like';

/**
 * Represents the properties exposed by a nav that need to be accessed by a link.
 * This exists to avoid circular dependency errors between the nav and link.
 */
interface NavPattern<V> {
  focusManager: ListFocus<LinkPattern<V>>;
  selection: ListSelection<LinkPattern<V>, V>;
  navigation: ListNavigation<LinkPattern<V>>;
}

/** Represents the required inputs for a link in a nav. */
export interface LinkInputs<V>
  extends ListNavigationItem,
    ListSelectionItem<V>,
    ListTypeaheadItem,
    ListFocusItem {
  nav: SignalLike<NavPattern<V> | undefined>;
}

/** Represents a link in a nav. */
export class LinkPattern<V> {
  /** A unique identifier for the link. */
  id: SignalLike<string>;

  /** The value of the link, typically a URL or route path. */
  value: SignalLike<V>;

  /** The position of the link in the list. */
  index = computed(
    () =>
      this.nav()
        ?.navigation.inputs.items()
        .findIndex(i => i.id() === this.id()) ?? -1,
  );

  /** Whether the link is active (focused). */
  active = computed(() => this.nav()?.focusManager.activeItem() === this);

  /** Whether the link is selected (activated). */
  selected = computed(() => this.nav()?.selection.inputs.value().includes(this.value()));

  /** Whether the link is disabled. */
  disabled: SignalLike<boolean>;

  /** The text used by the typeahead search. */
  searchTerm: SignalLike<string>;

  /** A reference to the parent nav. */
  nav: SignalLike<NavPattern<V> | undefined>;

  /** The tabindex of the link. */
  tabindex = computed(() => this.nav()?.focusManager.getItemTabindex(this));

  /** The html element that should receive focus. */
  element: SignalLike<HTMLElement>;

  constructor(args: LinkInputs<V>) {
    this.id = args.id;
    this.value = args.value;
    this.nav = args.nav;
    this.element = args.element;
    this.disabled = args.disabled;
    this.searchTerm = args.searchTerm;
  }
}
