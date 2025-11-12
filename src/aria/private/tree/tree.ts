/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {SignalLike, WritableSignalLike} from '../behaviors/signal-like/signal-like';
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

/**
 * Represents an item in a Tree.
 */
export class TreeItemPattern<V> implements ListItem<V>, ExpansionItem {
  /** A unique identifier for this item. */
  readonly id: SignalLike<string>;

  /** The value of this item. */
  readonly value: SignalLike<V>;

  /** A reference to the item element. */
  readonly element: SignalLike<HTMLElement | undefined>;

  /** Whether the item is disabled. */
  readonly disabled: SignalLike<boolean>;

  /** The text used by the typeahead search. */
  readonly searchTerm: SignalLike<string>;

  /** The tree pattern this item belongs to. */
  readonly tree: SignalLike<TreePattern<V>>;

  /** The parent item. */
  readonly parent: SignalLike<TreeItemPattern<V> | TreePattern<V>>;

  /** The children items. */
  readonly children: SignalLike<TreeItemPattern<V>[]>;

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

  /** Whether the item is selectable. */
  readonly selectable: SignalLike<boolean>;

  /** The level of the current item in a tree. */
  readonly level: SignalLike<number> = computed(() => this.parent().level() + 1);

  /** Whether this item is currently expanded. */
  readonly expanded = computed(() => this.expansion.isExpanded());

  /** Whether this item is visible. */
  readonly visible: SignalLike<boolean> = computed(
    () => this.parent().expanded() && this.parent().visible(),
  );

  /** The number of items under the same parent at the same level. */
  readonly setsize = computed(() => this.parent().children().length);

  /** The position of this item among its siblings (1-based). */
  readonly posinset = computed(() => this.parent().children().indexOf(this) + 1);

  /** Whether the item is active. */
  readonly active = computed(() => this.tree().activeItem() === this);

  /** The tab index of the item. */
  readonly tabIndex = computed(() => this.tree().listBehavior.getItemTabindex(this));

  /** Whether the item is selected. */
  readonly selected: SignalLike<boolean | undefined> = computed(() => {
    if (this.tree().nav()) {
      return undefined;
    }
    if (!this.selectable()) {
      return undefined;
    }
    return this.tree().values().includes(this.value());
  });

  /** The current type of this item. */
  readonly current: SignalLike<string | undefined> = computed(() => {
    if (!this.tree().nav()) {
      return undefined;
    }
    if (!this.selectable()) {
      return undefined;
    }
    return this.tree().values().includes(this.value()) ? this.tree().currentType() : undefined;
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
    this.selectable = inputs.selectable;
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
  /** A unique identifier for the tree. */
  id: SignalLike<string>;

  /** All items in the tree, in document order (DFS-like, a flattened list). */
  allItems: SignalLike<TreeItemPattern<V>[]>;

  /** Whether the tree is in navigation mode. */
  nav: SignalLike<boolean>;

  /** The aria-current type. */
  currentType: SignalLike<'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'>;

  /** The text direction of the tree. */
  textDirection: SignalLike<'ltr' | 'rtl'>;
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

  /** The root is always visible. */
  readonly visible = () => true;

  /** The tab index of the tree. */
  readonly tabIndex: SignalLike<-1 | 0> = computed(() => this.listBehavior.tabIndex());

  /** The id of the current active item. */
  readonly activeDescendant = computed(() => this.listBehavior.activeDescendant());

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
    const isRtl = this.inputs.textDirection() === 'rtl';
    return isRtl ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key for expanding an item or moving to its first child. */
  readonly expandKey = computed(() => {
    if (this.inputs.orientation() === 'horizontal') {
      return 'ArrowDown';
    }
    const isRtl = this.inputs.textDirection() === 'rtl';
    return isRtl ? 'ArrowLeft' : 'ArrowRight';
  });

  /** Represents the space key. Does nothing when the user is actively using typeahead. */
  readonly dynamicSpaceKey = computed(() => (this.listBehavior.isTyping() ? '' : ' '));

  /** Regular expression to match characters for typeahead. */
  readonly typeaheadRegexp = /^.$/;

  /** The keydown event manager for the tree. */
  readonly keydown = computed(() => {
    const manager = new KeyboardEventManager();
    const list = this.listBehavior;

    manager
      .on(this.prevKey, () => list.prev({selectOne: this.followFocus()}))
      .on(this.nextKey, () => list.next({selectOne: this.followFocus()}))
      .on('Home', () => list.first({selectOne: this.followFocus()}))
      .on('End', () => list.last({selectOne: this.followFocus()}))
      .on(this.typeaheadRegexp, e => list.search(e.key, {selectOne: this.followFocus()}))
      .on(this.expandKey, () => this.expand({selectOne: this.followFocus()}))
      .on(this.collapseKey, () => this.collapse({selectOne: this.followFocus()}))
      .on(Modifier.Shift, '*', () => this.expandSiblings());

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
        .on('Enter', () => list.toggle(), {preventDefault: !this.nav()})
        .on([Modifier.Ctrl, Modifier.Meta], 'A', () => list.toggleAll());
    }

    if (!this.followFocus() && !this.inputs.multi()) {
      manager.on(this.dynamicSpaceKey, () => list.selectOne());
      manager.on('Enter', () => list.selectOne(), {preventDefault: !this.nav()});
    }

    if (this.inputs.multi() && this.followFocus()) {
      manager
        .on([Modifier.Ctrl, Modifier.Meta], this.prevKey, () => list.prev())
        .on([Modifier.Ctrl, Modifier.Meta], this.nextKey, () => list.next())
        .on([Modifier.Ctrl, Modifier.Meta], this.expandKey, () => this.expand())
        .on([Modifier.Ctrl, Modifier.Meta], this.collapseKey, () => this.collapse())
        .on([Modifier.Ctrl, Modifier.Meta], ' ', () => list.toggle())
        .on([Modifier.Ctrl, Modifier.Meta], 'Enter', () => list.toggle())
        .on([Modifier.Ctrl, Modifier.Meta], 'Home', () => list.first())
        .on([Modifier.Ctrl, Modifier.Meta], 'End', () => list.last())
        .on([Modifier.Ctrl, Modifier.Meta], 'A', () => {
          list.toggleAll();
          list.select(); // Ensure the currect item remains selected.
        });
    }

    return manager;
  });

  /** The pointerdown event manager for the tree. */
  pointerdown = computed(() => {
    const manager = new PointerEventManager();

    if (this.multi()) {
      manager.on(Modifier.Shift, e => this.goto(e, {selectRange: true}));
    }

    if (!this.multi()) {
      return manager.on(e => this.goto(e, {selectOne: true}));
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

  /** A unique identifier for the tree. */
  id: SignalLike<string>;

  /** Whether the tree is in navigation mode. */
  nav: SignalLike<boolean>;

  /** The aria-current type. */
  currentType: SignalLike<'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'>;

  /** All items in the tree, in document order (DFS-like, a flattened list). */
  allItems: SignalLike<TreeItemPattern<V>[]>;

  /** Whether the tree is disabled. */
  disabled: SignalLike<boolean>;

  /** The currently active item in the tree. */
  activeItem: WritableSignalLike<TreeItemPattern<V> | undefined> = signal(undefined);

  /** Whether disabled items should be focusable. */
  softDisabled: SignalLike<boolean>;

  /** Whether the focus should wrap when navigating past the first or last item. */
  wrap: SignalLike<boolean>;

  /** The orientation of the tree. */
  orientation: SignalLike<'vertical' | 'horizontal'>;

  /** Whether multiple items can be selected at the same time. */
  multi: SignalLike<boolean>;

  /** The selection mode of the tree. */
  selectionMode: SignalLike<'follow' | 'explicit'>;

  /** The delay in milliseconds to wait before clearing the typeahead buffer. */
  typeaheadDelay: SignalLike<number>;

  /** The current selected items of the tree. */
  values: WritableSignalLike<V[]>;

  constructor(readonly inputs: TreeInputs<V>) {
    this.id = inputs.id;
    this.nav = inputs.nav;
    this.currentType = inputs.currentType;
    this.allItems = inputs.allItems;
    this.focusMode = inputs.focusMode;
    this.disabled = inputs.disabled;
    this.activeItem = inputs.activeItem;
    this.softDisabled = inputs.softDisabled;
    this.wrap = inputs.wrap;
    this.orientation = inputs.orientation;
    this.multi = computed(() => (this.nav() ? false : this.inputs.multi()));
    this.selectionMode = inputs.selectionMode;
    this.typeaheadDelay = inputs.typeaheadDelay;
    this.values = inputs.values;

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
  expand(opts?: SelectOptions) {
    const item = this.activeItem();
    if (!item || !this.listBehavior.isFocusable(item)) return;

    if (item.expandable() && !item.expanded()) {
      item.expansion.open();
    } else if (
      item.expanded() &&
      item.children().some(item => this.listBehavior.isFocusable(item))
    ) {
      this.listBehavior.next(opts);
    }
  }

  /** Expands all sibling tree items including itself. */
  expandSiblings(item?: TreeItemPattern<V>) {
    item ??= this.activeItem();
    const siblings = item?.parent()?.children();
    siblings?.forEach(item => item.expansion.open());
  }

  /** Collapses a tree item. */
  collapse(opts?: SelectOptions) {
    const item = this.activeItem();
    if (!item || !this.listBehavior.isFocusable(item)) return;

    if (item.expandable() && item.expanded()) {
      item.expansion.close();
    } else if (item.parent() && item.parent() !== this) {
      const parentItem = item.parent();
      if (parentItem instanceof TreeItemPattern && this.listBehavior.isFocusable(parentItem)) {
        this.listBehavior.goto(parentItem, opts);
      }
    }
  }

  /** Retrieves the TreeItemPattern associated with a DOM event, if any. */
  protected _getItem(event: Event): TreeItemPattern<V> | undefined {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const element = event.target.closest('[role="treeitem"]');
    return this.inputs.allItems().find(i => i.element() === element);
  }
}
