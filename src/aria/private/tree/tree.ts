/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SignalLike, computed, WritableSignalLike} from '../behaviors/signal-like/signal-like';
import {Tree, TreeItem, TreeInputs as TreeBehaviorInputs} from '../behaviors/tree/tree';
import {KeyboardEventManager, PointerEventManager, Modifier} from '../behaviors/event-manager';

/** Represents the required inputs for a tree item. */
export interface TreeItemInputs<V> extends Omit<
  TreeItem<V, TreeItemPattern<V>>,
  'index' | 'parent' | 'visible' | 'expandable'
> {
  /** The parent item. */
  parent: SignalLike<TreeItemPattern<V> | TreePattern<V>>;

  /** Whether this item has children. Children can be lazily loaded. */
  hasChildren: SignalLike<boolean>;

  /** The tree pattern this item belongs to. */
  tree: SignalLike<TreePattern<V>>;
}

/**
 * Represents an item in a Tree.
 */
export class TreeItemPattern<V> implements TreeItem<V, TreeItemPattern<V>> {
  /** A unique identifier for this item. */
  readonly id: SignalLike<string> = () => this.inputs.id();

  /** The value of this item. */
  readonly value: SignalLike<V> = () => this.inputs.value();

  /** A reference to the item element. */
  readonly element: SignalLike<HTMLElement> = () => this.inputs.element()!;

  /** Whether the item is disabled. */
  readonly disabled: SignalLike<boolean> = () => this.inputs.disabled();

  /** The text used by the typeahead search. */
  readonly searchTerm: SignalLike<string> = () => this.inputs.searchTerm();

  /** The tree pattern this item belongs to. */
  readonly tree: SignalLike<TreePattern<V>> = () => this.inputs.tree();

  /** The parent item. */
  readonly parent: SignalLike<TreeItemPattern<V> | undefined> = computed(() => {
    const parent = this.inputs.parent();
    return parent instanceof TreeItemPattern ? parent : undefined;
  });

  /** The children items. */
  readonly children: SignalLike<TreeItemPattern<V>[]> = () => this.inputs.children() ?? [];

  /** The position of this item among its siblings. */
  readonly index = computed(() => this.tree().inputs.items().indexOf(this));

  /** Whether the item is expandable. It's expandable if children item exist. */
  readonly expandable: SignalLike<boolean> = () => this.inputs.hasChildren();

  /** Whether the item is selectable. */
  readonly selectable: SignalLike<boolean> = () => this.inputs.selectable();

  /** Whether the item is expanded. */
  readonly expanded: WritableSignalLike<boolean>;

  /** The level of the current item in a tree. */
  readonly level: SignalLike<number> = computed(() => this.inputs.parent().level() + 1);

  /** Whether this item is visible. */
  readonly visible: SignalLike<boolean> = computed(
    () => this.inputs.parent().expanded() && this.inputs.parent().visible(),
  );

  /** The number of items under the same parent at the same level. */
  readonly setsize = computed(() => this.inputs.parent().children().length);

  /** The position of this item among its siblings (1-based). */
  readonly posinset = computed(() => this.inputs.parent().children().indexOf(this) + 1);

  /** Whether the item is active. */
  readonly active = computed(() => this.tree().activeItem() === this);

  /** The tab index of the item. */
  readonly tabIndex = computed(() => this.tree().treeBehavior.getItemTabindex(this));

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
    this.expanded = inputs.expanded;
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
export interface TreeInputs<V> extends Omit<
  TreeBehaviorInputs<TreeItemPattern<V>, V>,
  'multiExpandable'
> {
  /** A unique identifier for the tree. */
  id: SignalLike<string>;

  /** Whether the tree is in navigation mode. */
  nav: SignalLike<boolean>;

  /** The aria-current type. */
  currentType: SignalLike<'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'>;

  /** The text direction of the tree. */
  textDirection: SignalLike<'ltr' | 'rtl'>;
}

/** Controls the state and interactions of a tree view. */
export class TreePattern<V> implements TreeInputs<V> {
  /** The tree behavior for the tree. */
  readonly treeBehavior: Tree<TreeItemPattern<V>, V>;

  /** The root level is 0. */
  readonly level = () => 0;

  /** The root is always expanded. */
  readonly expanded = () => true;

  /** The root is always visible. */
  readonly visible = () => true;

  /** The tab index of the tree. */
  readonly tabIndex: SignalLike<-1 | 0> = computed(() => this.treeBehavior.tabIndex());

  /** The id of the current active item. */
  readonly activeDescendant = computed(() => this.treeBehavior.activeDescendant());

  /** The direct children of the root (top-level tree items). */
  readonly children = computed(() =>
    this.inputs.items().filter(item => item.level() === this.level() + 1),
  );

  /** Whether the tree selection follows focus. */
  readonly followFocus = computed(() => this.inputs.selectionMode() === 'follow');

  /** Whether the tree direction is RTL. */
  readonly isRtl = computed(() => this.inputs.textDirection() === 'rtl');

  /** The key for navigating to the previous item. */
  readonly prevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.isRtl() ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key for navigating to the next item. */
  readonly nextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.isRtl() ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The key for collapsing an item or moving to its parent. */
  readonly collapseKey = computed(() => {
    if (this.inputs.orientation() === 'horizontal') {
      return 'ArrowUp';
    }
    return this.isRtl() ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key for expanding an item or moving to its first child. */
  readonly expandKey = computed(() => {
    if (this.inputs.orientation() === 'horizontal') {
      return 'ArrowDown';
    }
    return this.isRtl() ? 'ArrowLeft' : 'ArrowRight';
  });

  /** Represents the space key. Does nothing when the user is actively using typeahead. */
  readonly dynamicSpaceKey = computed(() => (this.treeBehavior.isTyping() ? '' : ' '));

  /** Regular expression to match characters for typeahead. */
  readonly typeaheadRegexp = /^.$/;

  /** The keydown event manager for the tree. */
  readonly keydown = computed(() => {
    const manager = new KeyboardEventManager();
    const tree = this.treeBehavior;

    manager
      .on(this.prevKey, () => tree.prev({selectOne: this.followFocus()}))
      .on(this.nextKey, () => tree.next({selectOne: this.followFocus()}))
      .on('Home', () => tree.first({selectOne: this.followFocus()}))
      .on('End', () => tree.last({selectOne: this.followFocus()}))
      .on(this.typeaheadRegexp, e => tree.search(e.key, {selectOne: this.followFocus()}))
      .on(Modifier.Shift, '*', () => tree.expandSiblings())
      .on(this.expandKey, () => this._expandOrFirstChild({selectOne: this.followFocus()}))
      .on(this.collapseKey, () => this._collapseOrParent({selectOne: this.followFocus()}));

    if (this.inputs.multi()) {
      manager
        // TODO: Tracking the anchor by index can break if the
        // tree is expanded or collapsed causing the index to change.
        .on(Modifier.Any, 'Shift', () => tree.anchor(this.treeBehavior.activeIndex()))
        .on(Modifier.Shift, this.prevKey, () => tree.prev({selectRange: true}))
        .on(Modifier.Shift, this.nextKey, () => tree.next({selectRange: true}))
        .on([Modifier.Ctrl | Modifier.Shift, Modifier.Meta | Modifier.Shift], 'Home', () =>
          tree.first({selectRange: true, anchor: false}),
        )
        .on([Modifier.Ctrl | Modifier.Shift, Modifier.Meta | Modifier.Shift], 'End', () =>
          tree.last({selectRange: true, anchor: false}),
        )
        .on(Modifier.Shift, 'Enter', () => tree.updateSelection({selectRange: true, anchor: false}))
        .on(Modifier.Shift, this.dynamicSpaceKey, () =>
          tree.updateSelection({selectRange: true, anchor: false}),
        );
    }

    if (!this.followFocus() && this.inputs.multi()) {
      manager
        .on(this.dynamicSpaceKey, () => tree.toggle())
        .on('Enter', () => tree.toggle(), {preventDefault: !this.nav()})
        .on([Modifier.Ctrl, Modifier.Meta], 'A', () => tree.toggleAll());
    }

    if (!this.followFocus() && !this.inputs.multi()) {
      manager.on(this.dynamicSpaceKey, () => tree.selectOne());
      manager.on('Enter', () => tree.selectOne(), {preventDefault: !this.nav()});
    }

    if (this.inputs.multi() && this.followFocus()) {
      manager
        .on([Modifier.Ctrl, Modifier.Meta], this.prevKey, () => tree.prev())
        .on([Modifier.Ctrl, Modifier.Meta], this.nextKey, () => tree.next())
        .on([Modifier.Ctrl, Modifier.Meta], this.expandKey, () => this._expandOrFirstChild())
        .on([Modifier.Ctrl, Modifier.Meta], this.collapseKey, () => this._collapseOrParent())
        .on([Modifier.Ctrl, Modifier.Meta], ' ', () => tree.toggle())
        .on([Modifier.Ctrl, Modifier.Meta], 'Enter', () => tree.toggle())
        .on([Modifier.Ctrl, Modifier.Meta], 'Home', () => tree.first())
        .on([Modifier.Ctrl, Modifier.Meta], 'End', () => tree.last())
        .on([Modifier.Ctrl, Modifier.Meta], 'A', () => {
          tree.toggleAll();
          tree.select(); // Ensure the currect item remains selected.
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
  readonly id: SignalLike<string> = () => this.inputs.id();

  /** The host native element. */
  readonly element: SignalLike<HTMLElement> = () => this.inputs.element()!;

  /** Whether the tree is in navigation mode. */
  readonly nav: SignalLike<boolean> = () => this.inputs.nav();

  /** The aria-current type. */
  readonly currentType: SignalLike<
    'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'
  > = () => this.inputs.currentType();

  /** All items in the tree, in document order (DFS-like, a flattened list). */
  readonly items: SignalLike<TreeItemPattern<V>[]> = () => this.inputs.items();

  /** The focus strategy used by the tree. */
  readonly focusMode: SignalLike<'roving' | 'activedescendant'> = () => this.inputs.focusMode();

  /** Whether the tree is disabled. */
  readonly disabled: SignalLike<boolean> = () => this.inputs.disabled();

  /** The currently active item in the tree. */
  readonly activeItem: WritableSignalLike<TreeItemPattern<V> | undefined>;

  /** Whether disabled items should be focusable. */
  readonly softDisabled: SignalLike<boolean> = () => this.inputs.softDisabled();

  /** Whether the focus should wrap when navigating past the first or last item. */
  readonly wrap: SignalLike<boolean> = () => this.inputs.wrap();

  /** The orientation of the tree. */
  readonly orientation: SignalLike<'vertical' | 'horizontal'> = () => this.inputs.orientation();

  /** The text direction of the tree. */
  readonly textDirection: SignalLike<'ltr' | 'rtl'> = () => this.textDirection();

  /** Whether multiple items can be selected at the same time. */
  readonly multi: SignalLike<boolean> = computed(() => (this.nav() ? false : this.inputs.multi()));

  /** The selection mode of the tree. */
  readonly selectionMode: SignalLike<'follow' | 'explicit'> = () => this.inputs.selectionMode();

  /** The delay in milliseconds to wait before clearing the typeahead buffer. */
  readonly typeaheadDelay: SignalLike<number> = () => this.inputs.typeaheadDelay();

  /** The current selected items of the tree. */
  readonly values: WritableSignalLike<V[]>;

  constructor(readonly inputs: TreeInputs<V>) {
    this.activeItem = inputs.activeItem;
    this.values = inputs.values;

    this.treeBehavior = new Tree<TreeItemPattern<V>, V>({
      ...inputs,
      multi: this.multi,
      multiExpandable: () => true,
    });
  }

  /** Returns a set of violations */
  validate(): string[] {
    const violations: string[] = [];

    if (!this.inputs.multi() && this.inputs.values().length > 1) {
      violations.push(
        `A single-select tree should not have multiple selected options. Selected options: ${this.inputs.values().join(', ')}`,
      );
    }

    return violations;
  }

  /**
   * Sets the tree to it's default initial state.
   *
   * Sets the active index of the tree to the first focusable selected tree item if one exists.
   * Otherwise, sets focus to the first focusable tree item.
   */
  setDefaultState() {
    let firstItem: TreeItemPattern<V> | undefined;

    for (const item of this.inputs.items()) {
      if (!item.visible()) continue;
      if (!this.treeBehavior.isFocusable(item)) continue;

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

    this.treeBehavior.goto(item, opts);
    this.treeBehavior.toggleExpansion(item);
  }

  /** Expands the active item if possible, otherwise navigates to the first child. */
  _expandOrFirstChild(opts?: SelectOptions) {
    const item = this.treeBehavior.inputs.activeItem();
    if (item && this.treeBehavior.isExpandable(item) && !item.expanded()) {
      this.treeBehavior.expand(item);
    } else {
      this.treeBehavior.firstChild(opts);
    }
  }

  /** Collapses the active item if possible, otherwise navigates to the parent. */
  _collapseOrParent(opts?: SelectOptions) {
    const item = this.treeBehavior.inputs.activeItem();
    if (item && this.treeBehavior.isExpandable(item) && item.expanded()) {
      this.treeBehavior.collapse(item);
    } else {
      this.treeBehavior.parent(opts);
    }
  }

  /** Retrieves the TreeItemPattern associated with a DOM event, if any. */
  protected _getItem(event: Event): TreeItemPattern<V> | undefined {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const element = event.target.closest('[role="treeitem"]');
    return this.inputs.items().find(i => i.element() === element);
  }
}
