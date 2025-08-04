/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {KeyboardEventManager, PointerEventManager} from '../behaviors/event-manager';
import {
  ExpansionItem,
  ExpansionControl,
  ListExpansionInputs,
  ListExpansion,
} from '../behaviors/expansion/expansion';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {LabelControl, LabelControlOptionalInputs} from '../behaviors/label/label';
import {List, ListInputs, ListItem} from '../behaviors/list/list';

/** The required inputs to tabs. */
export interface TabInputs
  extends Omit<ListItem<string>, 'searchTerm' | 'index'>,
    Omit<ExpansionItem, 'expansionId' | 'expandable'> {
  /** The parent tablist that controls the tab. */
  tablist: SignalLike<TabListPattern>;

  /** The remote tabpanel controlled by the tab. */
  tabpanel: SignalLike<TabPanelPattern | undefined>;
}

/** A tab in a tablist. */
export class TabPattern {
  /** Controls expansion for this tab. */
  readonly expansion: ExpansionControl;

  /** A global unique identifier for the tab. */
  readonly id: SignalLike<string>;

  /** The index of the tab. */
  readonly index = computed(() => this.inputs.tablist().inputs.items().indexOf(this));

  /** A local unique identifier for the tab. */
  readonly value: SignalLike<string>;

  /** Whether the tab is disabled. */
  readonly disabled: SignalLike<boolean>;

  /** The html element that should receive focus. */
  readonly element: SignalLike<HTMLElement>;

  /** The text used by the typeahead search. */
  readonly searchTerm = () => ''; // Unused because tabs do not support typeahead.

  /** Whether this tab has expandable content. */
  readonly expandable = computed(() => this.expansion.expandable());

  /** The unique identifier used by the expansion behavior. */
  readonly expansionId = computed(() => this.expansion.expansionId());

  /** Whether the tab is expanded. */
  readonly expanded = computed(() => this.expansion.isExpanded());

  /** Whether the tab is active. */
  readonly active = computed(() => this.inputs.tablist().inputs.activeItem() === this);

  /** Whether the tab is selected. */
  readonly selected = computed(() => !!this.inputs.tablist().inputs.value().includes(this.value()));

  /** The tabindex of the tab. */
  readonly tabindex = computed(() => this.inputs.tablist().listBehavior.getItemTabindex(this));

  /** The id of the tabpanel associated with the tab. */
  readonly controls = computed(() => this.inputs.tabpanel()?.id());

  constructor(readonly inputs: TabInputs) {
    this.id = inputs.id;
    this.value = inputs.value;
    this.disabled = inputs.disabled;
    this.element = inputs.element;
    this.expansion = new ExpansionControl({
      ...inputs,
      expansionId: inputs.value,
      expandable: () => true,
      expansionManager: inputs.tablist().expansionManager,
    });
  }
}

/** The required inputs for the tabpanel. */
export interface TabPanelInputs extends LabelControlOptionalInputs {
  id: SignalLike<string>;
  tab: SignalLike<TabPattern | undefined>;
  value: SignalLike<string>;
}

/** A tabpanel associated with a tab. */
export class TabPanelPattern {
  /** A global unique identifier for the tabpanel. */
  readonly id: SignalLike<string>;

  /** A local unique identifier for the tabpanel. */
  readonly value: SignalLike<string>;

  /** Controls label for this tabpanel. */
  readonly labelManager: LabelControl;

  /** Whether the tabpanel is hidden. */
  readonly hidden = computed(() => this.inputs.tab()?.expanded() === false);

  /** The tabindex of this tabpanel. */
  readonly tabindex = computed(() => (this.hidden() ? -1 : 0));

  /** The aria-labelledby value for this tabpanel. */
  readonly labelledBy = computed(() =>
    this.labelManager.labelledBy().length > 0
      ? this.labelManager.labelledBy().join(' ')
      : undefined,
  );

  constructor(readonly inputs: TabPanelInputs) {
    this.id = inputs.id;
    this.value = inputs.value;
    this.labelManager = new LabelControl({
      ...inputs,
      defaultLabelledBy: computed(() => (this.inputs.tab() ? [this.inputs.tab()!.id()] : [])),
    });
  }
}

/** The required inputs for the tablist. */
export type TabListInputs = Omit<ListInputs<TabPattern, string>, 'multi' | 'typeaheadDelay'> &
  Omit<ListExpansionInputs, 'multiExpandable' | 'expandedIds' | 'items'>;

/** Controls the state of a tablist. */
export class TabListPattern {
  /** The list behavior for the tablist. */
  readonly listBehavior: List<TabPattern, string>;

  /** Controls expansion for the tablist. */
  readonly expansionManager: ListExpansion;

  /** Whether the tablist is vertically or horizontally oriented. */
  readonly orientation: SignalLike<'vertical' | 'horizontal'>;

  /** Whether the tablist is disabled. */
  readonly disabled: SignalLike<boolean>;

  /** The tabindex of the tablist. */
  readonly tabindex = computed(() => this.listBehavior.tabindex());

  /** The id of the current active tab. */
  readonly activedescendant = computed(() => this.listBehavior.activedescendant());

  /** Whether selection should follow focus. */
  readonly followFocus = computed(() => this.inputs.selectionMode() === 'follow');

  /** The key used to navigate to the previous tab in the tablist. */
  readonly prevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key used to navigate to the next item in the list. */
  readonly nextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The keydown event manager for the tablist. */
  readonly keydown = computed(() => {
    return new KeyboardEventManager()
      .on(this.prevKey, () => this.listBehavior.prev({select: this.followFocus()}))
      .on(this.nextKey, () => this.listBehavior.next({select: this.followFocus()}))
      .on('Home', () => this.listBehavior.first({select: this.followFocus()}))
      .on('End', () => this.listBehavior.last({select: this.followFocus()}))
      .on(' ', () => this.listBehavior.select())
      .on('Enter', () => this.listBehavior.select());
  });

  /** The pointerdown event manager for the tablist. */
  readonly pointerdown = computed(() => {
    return new PointerEventManager().on(e =>
      this.listBehavior.goto(this._getItem(e)!, {select: true}),
    );
  });

  constructor(readonly inputs: TabListInputs) {
    this.disabled = inputs.disabled;
    this.orientation = inputs.orientation;

    this.listBehavior = new List({
      ...inputs,
      multi: () => false,
      typeaheadDelay: () => 0, // Tabs do not support typeahead.
    });

    this.expansionManager = new ListExpansion({
      ...inputs,
      multiExpandable: () => false,
      expandedIds: this.inputs.value,
    });
  }

  /**
   * Sets the tablist to its default initial state.
   *
   * Sets the active index of the tablist to the first focusable selected
   * tab if one exists. Otherwise, sets focus to the first focusable tab.
   *
   * This method should be called once the tablist and its tabs are properly initialized.
   */
  setDefaultState() {
    let firstItem: TabPattern | undefined;

    for (const item of this.inputs.items()) {
      if (!this.listBehavior.isFocusable(item)) continue;

      if (firstItem === undefined) {
        firstItem = item;
      }

      if (item.selected()) {
        this.inputs.activeItem.set(item);
        return;
      }
    }
    if (firstItem !== undefined) {
      this.inputs.activeItem.set(firstItem);
    }
  }

  /** Handles keydown events for the tablist. */
  onKeydown(event: KeyboardEvent) {
    if (!this.disabled()) {
      this.keydown().handle(event);
    }
  }

  /** The pointerdown event manager for the tablist. */
  onPointerdown(event: PointerEvent) {
    if (!this.disabled()) {
      this.pointerdown().handle(event);
    }
  }

  /** Returns the tab item associated with the given pointer event. */
  private _getItem(e: PointerEvent) {
    if (!(e.target instanceof HTMLElement)) {
      return;
    }

    const element = e.target.closest('[role="tab"]');
    return this.inputs.items().find(i => i.element() === element);
  }
}
