/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {ListFocus, ListFocusInputs, ListFocusItem} from '../behaviors/list-focus/list-focus';
import {
  ListNavigation,
  ListNavigationInputs,
  ListNavigationItem,
} from '../behaviors/list-navigation/list-navigation';
import {
  ListSelection,
  ListSelectionInputs,
  ListSelectionItem,
} from '../behaviors/list-selection/list-selection';
import {
  ListTypeahead,
  ListTypeaheadInputs,
  ListTypeaheadItem,
} from '../behaviors/list-typeahead/list-typeahead';
import {ExpansionItem, ExpansionControl, ListExpansion} from '../behaviors/expansion/expansion';
import {
  KeyboardEventManager,
  PointerEventManager,
  ModifierKey as Modifier,
} from '../behaviors/event-manager';

/** Represents the required inputs for a tree item. */
export interface TreeItemInputs<V>
  extends ListFocusItem,
    ListNavigationItem,
    ListSelectionItem<V>,
    ListTypeaheadItem {
  /** The parent item. */
  parent: SignalLike<TreeItemPattern<V> | TreePattern<V>>;

  /** Whether this item has children. Children can be lazily loaded. */
  hasChildren: SignalLike<boolean>;

  /** The children items. */
  children: SignalLike<TreeItemPattern<V>[]>;

  /** The tree pattern this item belongs to. */
  tree: SignalLike<TreePattern<V>>;
}

export interface TreeItemPattern<V> extends TreeItemInputs<V> {}
/**
 * Represents an item in a Tree.
 */
export class TreeItemPattern<V> implements ExpansionItem {
  /** The unique identifier used by the expansion behavior. */
  readonly expansionId: SignalLike<string>;

  /** Controls expansion for child items. */
  readonly expansionManager: ListExpansion;

  /** Controls expansion for this item. */
  readonly expansion: ExpansionControl;

  /** Whether the item is expandable. It's expandable if children item exist. */
  readonly expandable: SignalLike<boolean>;

  /** The level of the current item in a tree. */
  readonly level: SignalLike<number> = computed(() => this.parent().level() + 1);

  /** Whether this item is currently expanded. */
  readonly expanded = computed(() => this.expansion.isExpanded());

  /** Whether this item is visible. */
  readonly visible = computed(() => this.parent().expanded());

  /** The number of items under the same parent at the same level. */
  readonly setsize = computed(() => this.parent().children().length);

  /** The position of this item among its siblings (1-based). */
  readonly posinset = computed(() => this.parent().children().indexOf(this) + 1);

  /** Whether the item is active. */
  readonly active = computed(() => this.tree().focusManager.activeItem() === this);

  /** The tabindex of the item. */
  readonly tabindex = computed(() => this.tree().focusManager.getItemTabindex(this));

  /** Whether the item is selected. */
  readonly selected = computed(() => {
    if (this.tree().nav()) {
      return undefined;
    }
    return this.tree().value().includes(this.value());
  });

  /** The current type of this item. */
  readonly current = computed(() => {
    if (!this.tree().nav()) {
      return undefined;
    }
    return this.tree().value().includes(this.value()) ? this.tree().currentType() : undefined;
  });

  constructor(readonly inputs: TreeItemInputs<V>) {
    this.id = inputs.id;
    this.value = inputs.value;
    this.element = inputs.element;
    this.disabled = inputs.disabled;
    this.searchTerm = inputs.searchTerm;
    this.expansionId = inputs.id;
    this.tree = inputs.tree;
    this.parent = inputs.parent;
    this.children = inputs.children;
    this.expandable = inputs.hasChildren;
    this.expansion = new ExpansionControl({
      ...inputs,
      expandable: this.expandable,
      expansionId: this.expansionId,
      expansionManager: this.parent().expansionManager,
    });
    this.expansionManager = new ListExpansion({
      ...inputs,
      multiExpandable: () => true,
      // TODO(ok7sai): allow pre-expanded tree items.
      expandedIds: signal([]),
      items: this.children,
      disabled: computed(() => this.tree()?.disabled() ?? false),
    });
  }
}

/** The selection operations that the tree can perform. */
interface SelectOptions {
  toggle?: boolean;
  selectOne?: boolean;
  selectRange?: boolean;
  anchor?: boolean;
}

/** Represents the required inputs for a tree. */
export interface TreeInputs<V>
  extends Omit<
    ListFocusInputs<TreeItemPattern<V>> &
      ListNavigationInputs<TreeItemPattern<V>> &
      ListSelectionInputs<TreeItemPattern<V>, V> &
      ListTypeaheadInputs<TreeItemPattern<V>>,
    'items'
  > {
  /** All items in the tree, in document order (DFS-like, a flattened list). */
  allItems: SignalLike<TreeItemPattern<V>[]>;

  /** Whether the tree is in navigation mode. */
  nav: SignalLike<boolean>;

  /** The aria-current type. */
  currentType: SignalLike<'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'>;
}

export interface TreePattern<V> extends TreeInputs<V> {}
/** Controls the state and interactions of a tree view. */
export class TreePattern<V> {
  /** Controls focus for the all visible tree items. */
  readonly focusManager: ListFocus<TreeItemPattern<V>>;

  /** Controls navigation for all visible tree items. */
  readonly navigationManager: ListNavigation<TreeItemPattern<V>>;

  /** Controls selection for all visible tree items. */
  readonly selectionManager: ListSelection<TreeItemPattern<V>, V>;

  /** Controls typeahead for all visible tree items. */
  readonly typeaheadManager: ListTypeahead<TreeItemPattern<V>>;

  /** Controls expansion for direct children of the tree root (top-level items). */
  readonly expansionManager: ListExpansion;

  /** The root level is 0. */
  readonly level = () => 0;

  /** The root is always expanded. */
  readonly expanded = () => true;

  /** The tabindex of the tree. */
  readonly tabindex = computed(() => this.focusManager.getListTabindex());

  /** The id of the current active item. */
  readonly activedescendant = computed(() => this.focusManager.getActiveDescendant());

  /** Whether the tree is performing a range selection. */
  readonly inSelection = signal(false);

  /** The direct children of the root (top-level tree items). */
  readonly children = computed(() =>
    this.inputs.allItems().filter(item => item.level() === this.level() + 1),
  );

  /** All currently visible tree items. An item is visible if their parent is expanded. */
  readonly visibleItems = computed(() => this.inputs.allItems().filter(item => item.visible()));

  /** Whether the tree selection follows focus. */
  readonly followFocus = computed(() => this.inputs.selectionMode() === 'follow');

  /** The key for navigating to the previous item. */
  readonly prevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key for navigating to the next item. */
  readonly nextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The key for collapsing an item or moving to its parent. */
  readonly collapseKey = computed(() => {
    if (this.inputs.orientation() === 'horizontal') {
      return 'ArrowUp';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key for expanding an item or moving to its first child. */
  readonly expandKey = computed(() => {
    if (this.inputs.orientation() === 'horizontal') {
      return 'ArrowDown';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** Represents the space key. Does nothing when the user is actively using typeahead. */
  readonly dynamicSpaceKey = computed(() => (this.typeaheadManager.isTyping() ? '' : ' '));

  /** Regular expression to match characters for typeahead. */
  readonly typeaheadRegexp = /^.$/;

  /** Uncommitted tree item for selecting a range of tree items. */
  readonly anchorItem = signal<TreeItemPattern<V> | undefined>(undefined);

  /**
   * Uncommitted tree item index for selecting a range of tree items.
   *
   * The index is computed in case the tree item position is changed caused by tree expansions.
   */
  readonly anchorIndex = computed(() =>
    this.anchorItem() ? this.visibleItems().indexOf(this.anchorItem()!) : -1,
  );

  /** The keydown event manager for the tree. */
  readonly keydown = computed(() => {
    const manager = new KeyboardEventManager();

    if (!this.followFocus()) {
      manager
        .on(this.prevKey, () => this.prev())
        .on(this.nextKey, () => this.next())
        .on('Home', () => this.first())
        .on('End', () => this.last())
        .on(this.typeaheadRegexp, e => this.search(e.key));
    }

    if (this.followFocus()) {
      manager
        .on(this.prevKey, () => this.prev({selectOne: true}))
        .on(this.nextKey, () => this.next({selectOne: true}))
        .on('Home', () => this.first({selectOne: true}))
        .on('End', () => this.last({selectOne: true}))
        .on(this.typeaheadRegexp, e => this.search(e.key, {selectOne: true}));
    }

    if (this.inputs.multi()) {
      manager
        .on(Modifier.Any, 'Shift', () => this.anchorItem.set(this.focusManager.activeItem()))
        .on(Modifier.Shift, this.prevKey, () => this.prev({selectRange: true}))
        .on(Modifier.Shift, this.nextKey, () => this.next({selectRange: true}))
        .on([Modifier.Ctrl | Modifier.Shift, Modifier.Meta | Modifier.Shift], 'Home', () =>
          this.first({selectRange: true, anchor: false}),
        )
        .on([Modifier.Ctrl | Modifier.Shift, Modifier.Meta | Modifier.Shift], 'End', () =>
          this.last({selectRange: true, anchor: false}),
        )
        .on(Modifier.Shift, 'Enter', () =>
          this._updateSelection({selectRange: true, anchor: false}),
        )
        .on(Modifier.Shift, this.dynamicSpaceKey, () =>
          this._updateSelection({selectRange: true, anchor: false}),
        );
    }

    if (!this.followFocus() && this.inputs.multi()) {
      manager
        .on(this.dynamicSpaceKey, () => this.selectionManager.toggle())
        .on('Enter', () => this.selectionManager.toggle())
        .on([Modifier.Ctrl, Modifier.Meta], 'A', () => this.selectionManager.toggleAll());
    }

    if (!this.followFocus() && !this.inputs.multi()) {
      manager.on(this.dynamicSpaceKey, () => this.selectionManager.toggleOne());
      manager.on('Enter', () => this.selectionManager.toggleOne());
    }

    if (this.inputs.multi() && this.followFocus()) {
      manager
        .on([Modifier.Ctrl, Modifier.Meta], this.prevKey, () => this.prev())
        .on([Modifier.Ctrl, Modifier.Meta], this.nextKey, () => this.next())
        .on([Modifier.Ctrl, Modifier.Meta], ' ', () => this.selectionManager.toggle())
        .on([Modifier.Ctrl, Modifier.Meta], 'Enter', () => this.selectionManager.toggle())
        .on([Modifier.Ctrl, Modifier.Meta], 'Home', () => this.first())
        .on([Modifier.Ctrl, Modifier.Meta], 'End', () => this.last())
        .on([Modifier.Ctrl, Modifier.Meta], 'A', () => {
          this.selectionManager.toggleAll();
          this.selectionManager.select(); // Ensure the currect item remains selected.
        });
    }

    manager
      .on(this.expandKey, () => this.expand())
      .on(this.collapseKey, () => this.collapse())
      .on(Modifier.Shift, '*', () => this.expandSiblings());

    return manager;
  });

  /** The pointerdown event manager for the tree. */
  pointerdown = computed(() => {
    const manager = new PointerEventManager();

    if (this.multi()) {
      manager.on(Modifier.Shift, e => this.goto(e, {selectRange: true}));
    }

    if (!this.multi() && this.followFocus()) {
      return manager.on(e => this.goto(e, {selectOne: true}));
    }

    if (!this.multi() && !this.followFocus()) {
      return manager.on(e => this.goto(e, {toggle: true}));
    }

    if (this.multi() && this.followFocus()) {
      return manager
        .on(e => this.goto(e, {selectOne: true}))
        .on(Modifier.Ctrl, e => this.goto(e, {toggle: true}));
    }

    if (this.multi() && !this.followFocus()) {
      return manager.on(e => this.goto(e, {toggle: true}));
    }

    return manager;
  });

  constructor(readonly inputs: TreeInputs<V>) {
    this.nav = inputs.nav;
    this.currentType = inputs.currentType;
    this.allItems = inputs.allItems;
    this.focusMode = inputs.focusMode;
    this.disabled = inputs.disabled;
    this.activeIndex = inputs.activeIndex;
    this.skipDisabled = inputs.skipDisabled;
    this.wrap = inputs.wrap;
    this.orientation = inputs.orientation;
    this.textDirection = inputs.textDirection;
    this.multi = computed(() => (this.nav() ? false : this.inputs.multi()));
    this.value = inputs.value;
    this.selectionMode = inputs.selectionMode;
    this.typeaheadDelay = inputs.typeaheadDelay;
    this.focusManager = new ListFocus({
      ...inputs,
      items: this.visibleItems,
    });
    this.navigationManager = new ListNavigation({
      ...inputs,
      wrap: computed(() => this.inputs.wrap() && !this.inSelection()),
      items: this.visibleItems,
      focusManager: this.focusManager,
    });
    this.selectionManager = new ListSelection({
      ...inputs,
      items: this.visibleItems,
      focusManager: this.focusManager,
    });
    this.typeaheadManager = new ListTypeahead({
      ...inputs,
      items: this.visibleItems,
      focusManager: this.focusManager,
    });
    this.expansionManager = new ListExpansion({
      multiExpandable: () => true,
      // TODO(ok7sai): allow pre-expanded tree items.
      expandedIds: signal([]),
      items: this.children,
      disabled: this.disabled,
    });
  }

  /**
   * Sets the tree to it's default initial state.
   *
   * Sets the active index of the tree to the first focusable selected tree item if one exists.
   * Otherwise, sets focus to the first focusable tree item.
   */
  setDefaultState() {
    let firstItemIndex: number | undefined;

    for (const [index, item] of this.allItems().entries()) {
      if (!item.visible()) continue;
      if (!this.focusManager.isFocusable(item)) continue;

      if (firstItemIndex === undefined) {
        firstItemIndex = index;
      }

      if (item.selected()) {
        this.activeIndex.set(index);
        return;
      }
    }

    if (firstItemIndex !== undefined) {
      this.activeIndex.set(firstItemIndex);
    }
  }

  /** Handles keydown events on the tree. */
  onKeydown(event: KeyboardEvent) {
    if (!this.disabled()) {
      this.keydown().handle(event);
    }
  }

  /** Handles pointerdown events on the tree. */
  onPointerdown(event: PointerEvent) {
    if (!this.disabled()) {
      this.pointerdown().handle(event);
    }
  }

  /** Navigates to the first visible tree item in the tree. */
  first(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigationManager.first());
  }

  /** Navigates to the last visible tree item in the tree. */
  last(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigationManager.last());
  }

  /** Navigates to the next visible tree item in the tree. */
  next(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigationManager.next());
  }

  /** Navigates to the previous visible tree item in the tree. */
  prev(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigationManager.prev());
  }

  /** Navigates to the given tree item in the tree. */
  goto(event: PointerEvent, opts?: SelectOptions) {
    const item = this._getItem(event);
    this._navigate(opts, () => this.navigationManager.goto(item));
    this.toggleExpansion(item);
  }

  /** Handles typeahead search navigation for the tree. */
  search(char: string, opts?: SelectOptions) {
    this._navigate(opts, () => this.typeaheadManager.search(char));
  }

  /** Toggles to expand or collapse a tree item. */
  toggleExpansion(item?: TreeItemPattern<V>) {
    item ??= this.focusManager.activeItem();
    if (!item || !this.focusManager.isFocusable(item)) return;

    if (!item.expandable()) return;
    if (item.expanded()) {
      this.collapse();
    } else {
      item.expansion.open();
    }
  }

  /** Expands a tree item. */
  expand(item?: TreeItemPattern<V>) {
    item ??= this.focusManager.activeItem();
    if (!item || !this.focusManager.isFocusable(item)) return;

    if (item.expandable() && !item.expanded()) {
      item.expansion.open();
    } else if (item.expanded() && item.children().length > 0) {
      const firstChild = item.children()[0];
      if (this.focusManager.isFocusable(firstChild)) {
        this.navigationManager.goto(firstChild);
      }
    }
  }

  /** Expands all sibling tree items including itself. */
  expandSiblings(item?: TreeItemPattern<V>) {
    item ??= this.focusManager.activeItem();
    const siblings = item.parent()?.children();
    siblings?.forEach(item => this.expand(item));
  }

  /** Collapses a tree item. */
  collapse(item?: TreeItemPattern<V>) {
    item ??= this.focusManager.activeItem();
    if (!item || !this.focusManager.isFocusable(item)) return;

    if (item.expandable() && item.expanded()) {
      item.expansion.close();
    } else if (item.parent() && item.parent() !== this) {
      const parentItem = item.parent();
      if (parentItem instanceof TreeItemPattern && this.focusManager.isFocusable(parentItem)) {
        this.navigationManager.goto(parentItem);
      }
    }
  }

  /** Safely performs a navigation operation. */
  private _navigate(opts: SelectOptions = {}, operation: () => boolean) {
    if (opts?.selectRange) {
      this.inSelection.set(true);
      this.selectionManager.rangeStartIndex.set(this.anchorIndex());
    }

    const moved = operation();

    if (moved) {
      this._updateSelection(opts);
    }

    this.inSelection.set(false);
  }

  /** Handles updating selection for the tree. */
  private _updateSelection(opts: SelectOptions = {anchor: true}) {
    if (opts.toggle) {
      this.selectionManager.toggle();
    }
    if (opts.selectOne) {
      this.selectionManager.selectOne();
    }
    if (opts.selectRange) {
      this.selectionManager.selectRange();
    }
    if (!opts.anchor) {
      this.anchorItem.set(this.visibleItems()[this.selectionManager.rangeStartIndex()]);
    }
  }

  /** Retrieves the TreeItemPattern associated with a DOM event, if any. */
  private _getItem(event: Event): TreeItemPattern<V> | undefined {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const element = event.target.closest('[role="treeitem"]');
    return this.inputs.allItems().find(i => i.element() === element);
  }
}
