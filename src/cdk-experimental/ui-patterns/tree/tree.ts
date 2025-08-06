/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {List, ListInputs, ListItem} from '../behaviors/list/list';
import {ExpansionItem, ExpansionControl, ListExpansion} from '../behaviors/expansion/expansion';
import {KeyboardEventManager, PointerEventManager, Modifier} from '../behaviors/event-manager';

/** Represents the required inputs for a tree item. */
export interface TreeItemInputs<V> extends Omit<ListItem<V>, 'index'> {
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
  /** The position of this item among its siblings. */
  readonly index = computed(() => this.tree().visibleItems().indexOf(this));

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
  readonly active = computed(() => this.tree().activeItem() === this);

  /** The tabindex of the item. */
  readonly tabindex = computed(() => this.tree().listBehavior.getItemTabindex(this));

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
export interface TreeInputs<V> extends Omit<ListInputs<TreeItemPattern<V>, V>, 'items'> {
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
  /** The list behavior for the tree. */
  readonly listBehavior: List<TreeItemPattern<V>, V>;

  /** Controls expansion for direct children of the tree root (top-level items). */
  readonly expansionManager: ListExpansion;

  /** The root level is 0. */
  readonly level = () => 0;

  /** The root is always expanded. */
  readonly expanded = () => true;

  /** The tabindex of the tree. */
  readonly tabindex = computed(() => this.listBehavior.tabindex());

  /** The id of the current active item. */
  readonly activedescendant = computed(() => this.listBehavior.activedescendant());

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
  readonly dynamicSpaceKey = computed(() => (this.listBehavior.isTyping() ? '' : ' '));

  /** Regular expression to match characters for typeahead. */
  readonly typeaheadRegexp = /^.$/;

  /** The keydown event manager for the tree. */
  readonly keydown = computed(() => {
    const manager = new KeyboardEventManager();
    const list = this.listBehavior;

    if (!this.followFocus()) {
      manager
        .on(this.prevKey, () => list.prev())
        .on(this.nextKey, () => list.next())
        .on('Home', () => list.first())
        .on('End', () => list.last())
        .on(this.typeaheadRegexp, e => list.search(e.key));
    }

    if (this.followFocus()) {
      manager
        .on(this.prevKey, () => list.prev({selectOne: true}))
        .on(this.nextKey, () => list.next({selectOne: true}))
        .on('Home', () => list.first({selectOne: true}))
        .on('End', () => list.last({selectOne: true}))
        .on(this.typeaheadRegexp, e => list.search(e.key, {selectOne: true}));
    }

    if (this.inputs.multi()) {
      manager
        // TODO: Tracking the anchor by index can break if the
        // tree is expanded or collapsed causing the index to change.
        .on(Modifier.Any, 'Shift', () => list.anchor(this.listBehavior.activeIndex()))
        .on(Modifier.Shift, this.prevKey, () => list.prev({selectRange: true}))
        .on(Modifier.Shift, this.nextKey, () => list.next({selectRange: true}))
        .on([Modifier.Ctrl | Modifier.Shift, Modifier.Meta | Modifier.Shift], 'Home', () =>
          list.first({selectRange: true, anchor: false}),
        )
        .on([Modifier.Ctrl | Modifier.Shift, Modifier.Meta | Modifier.Shift], 'End', () =>
          list.last({selectRange: true, anchor: false}),
        )
        .on(Modifier.Shift, 'Enter', () => list.updateSelection({selectRange: true, anchor: false}))
        .on(Modifier.Shift, this.dynamicSpaceKey, () =>
          list.updateSelection({selectRange: true, anchor: false}),
        );
    }

    if (!this.followFocus() && this.inputs.multi()) {
      manager
        .on(this.dynamicSpaceKey, () => list.toggle())
        .on('Enter', () => list.toggle())
        .on([Modifier.Ctrl, Modifier.Meta], 'A', () => list.toggleAll());
    }

    if (!this.followFocus() && !this.inputs.multi()) {
      manager.on(this.dynamicSpaceKey, () => list.toggleOne());
      manager.on('Enter', () => list.toggleOne());
    }

    if (this.inputs.multi() && this.followFocus()) {
      manager
        .on([Modifier.Ctrl, Modifier.Meta], this.prevKey, () => list.prev())
        .on([Modifier.Ctrl, Modifier.Meta], this.nextKey, () => list.next())
        .on([Modifier.Ctrl, Modifier.Meta], ' ', () => list.toggle())
        .on([Modifier.Ctrl, Modifier.Meta], 'Enter', () => list.toggle())
        .on([Modifier.Ctrl, Modifier.Meta], 'Home', () => list.first())
        .on([Modifier.Ctrl, Modifier.Meta], 'End', () => list.last())
        .on([Modifier.Ctrl, Modifier.Meta], 'A', () => {
          list.toggleAll();
          list.select(); // Ensure the currect item remains selected.
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
    this.activeItem = inputs.activeItem;
    this.skipDisabled = inputs.skipDisabled;
    this.wrap = inputs.wrap;
    this.orientation = inputs.orientation;
    this.textDirection = inputs.textDirection;
    this.multi = computed(() => (this.nav() ? false : this.inputs.multi()));
    this.selectionMode = inputs.selectionMode;
    this.typeaheadDelay = inputs.typeaheadDelay;
    this.value = inputs.value;

    this.listBehavior = new List({
      ...inputs,
      items: this.visibleItems,
      multi: this.multi,
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
    let firstItem: TreeItemPattern<V> | undefined;

    for (const item of this.allItems()) {
      if (!item.visible()) continue;
      if (!this.listBehavior.isFocusable(item)) continue;

      if (firstItem === undefined) {
        firstItem = item;
      }

      if (item.selected()) {
        this.activeItem.set(item);
        return;
      }
    }

    if (firstItem !== undefined) {
      this.activeItem.set(firstItem);
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

  /** Navigates to the given tree item in the tree. */
  goto(e: PointerEvent, opts?: SelectOptions) {
    const item = this._getItem(e);
    if (!item) return;

    this.listBehavior.goto(item, opts);
    this.toggleExpansion(item);
  }

  /** Toggles to expand or collapse a tree item. */
  toggleExpansion(item?: TreeItemPattern<V>) {
    item ??= this.activeItem();
    if (!item || !this.listBehavior.isFocusable(item)) return;

    if (!item.expandable()) return;
    if (item.expanded()) {
      this.collapse();
    } else {
      item.expansion.open();
    }
  }

  /** Expands a tree item. */
  expand(item?: TreeItemPattern<V>) {
    item ??= this.activeItem();
    if (!item || !this.listBehavior.isFocusable(item)) return;

    if (item.expandable() && !item.expanded()) {
      item.expansion.open();
    } else if (item.expanded() && item.children().length > 0) {
      const firstChild = item.children()[0];
      if (this.listBehavior.isFocusable(firstChild)) {
        this.listBehavior.goto(firstChild);
      }
    }
  }

  /** Expands all sibling tree items including itself. */
  expandSiblings(item?: TreeItemPattern<V>) {
    item ??= this.activeItem();
    const siblings = item?.parent()?.children();
    siblings?.forEach(item => this.expand(item));
  }

  /** Collapses a tree item. */
  collapse(item?: TreeItemPattern<V>) {
    item ??= this.activeItem();
    if (!item || !this.listBehavior.isFocusable(item)) return;

    if (item.expandable() && item.expanded()) {
      item.expansion.close();
    } else if (item.parent() && item.parent() !== this) {
      const parentItem = item.parent();
      if (parentItem instanceof TreeItemPattern && this.listBehavior.isFocusable(parentItem)) {
        this.listBehavior.goto(parentItem);
      }
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
