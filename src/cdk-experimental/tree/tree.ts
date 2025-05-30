/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  signal,
  Signal,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {DeferredContent, DeferredContentAware} from '@angular/cdk-experimental/deferred-content';
import {TreeItemPattern, TreePattern} from '../ui-patterns/tree/tree';

/**
 * Base class to make a Cdk item groupable.
 *
 * Also need to add the following to the `@Directive` configuration:
 * ```
 * providers: [
 *  { provide: BaseGroupable, useExisting: forwardRef(() => CdkSomeItem) },
 * ],
 * ```
 *
 * TODO(ok7sai): Move it to a shared place.
 */
export class BaseGroupable {
  /** The parent CdkGroup, if any. */
  groupParent = inject(CdkGroup, {optional: true});
}

/**
 * Generic container that designates content as a group.
 *
 * TODO(ok7sai): Move it to a shared place.
 */
@Directive({
  selector: '[cdkGroup]',
  exportAs: 'cdkGroup',
  hostDirectives: [
    {
      directive: DeferredContentAware,
      inputs: ['preserveContent'],
    },
  ],
  host: {
    'class': 'cdk-group',
    'role': 'group',
    '[id]': 'id',
    '[attr.inert]': 'visible() ? null : true',
  },
})
export class CdkGroup<V> {
  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware);

  /** All groupable items that are descendants of the group. */
  private readonly _items = contentChildren(BaseGroupable, {descendants: true});

  /** Identifier for matching the group owner. */
  readonly value = input.required<V>();

  /** Whether the group is visible. */
  readonly visible = signal(true);

  /** Unique ID for the group. */
  readonly id = inject(_IdGenerator).getId('cdk-group-');

  /** Child items within this group. */
  readonly children = signal<BaseGroupable[]>([]);

  constructor() {
    afterRenderEffect(() => {
      this.children.set(this._items().filter(item => item.groupParent === this));
    });

    // Connect the group's hidden state to the DeferredContentAware's visibility.
    afterRenderEffect(() => {
      this._deferredContentAware.contentVisible.set(this.visible());
    });
  }
}

/**
 * A structural directive that marks the `ng-template` to be used as the content
 * for a `CdkGroup`. This content can be lazily loaded.
 *
 * TODO(ok7sai): Move it to a shared place.
 */
@Directive({
  selector: 'ng-template[cdkGroupContent]',
  hostDirectives: [DeferredContent],
})
export class CdkGroupContent {}

/**
 * Makes an element a tree and manages state (focus, selection, keyboard navigation).
 */
@Directive({
  selector: '[cdkTree]',
  exportAs: 'cdkTree',
  host: {
    'class': 'cdk-tree',
    'role': 'tree',
    '[attr.aria-orientation]': 'pattern.orientation()',
    '[attr.aria-multiselectable]': 'pattern.multi()',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[attr.aria-activedescendant]': 'pattern.activedescendant()',
    '[tabindex]': 'pattern.tabindex()',
    '(keydown)': 'pattern.onKeydown($event)',
    '(pointerdown)': 'pattern.onPointerdown($event)',
  },
})
export class CdkTree<V> {
  /** All CdkTreeItem instances within this tree. */
  private readonly _cdkTreeItems = contentChildren<CdkTreeItem<V>>(CdkTreeItem, {
    descendants: true,
  });

  /** All TreeItemPattern instances within this tree. */
  private readonly _itemPatterns = computed(() => this._cdkTreeItems().map(item => item.pattern));

  /** All CdkGroup instances within this tree. */
  private readonly _cdkGroups = contentChildren(CdkGroup, {descendants: true});

  /** Orientation of the tree. */
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');

  /** Whether multi-selection is allowed. */
  readonly multi = input(false, {transform: booleanAttribute});

  /** Whether the tree is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** The selection strategy used by the tree. */
  readonly selectionMode = input<'explicit' | 'follow'>('explicit');

  /** The focus strategy used by the tree. */
  readonly focusMode = input<'roving' | 'activedescendant'>('roving');

  /** Whether navigation wraps. */
  readonly wrap = input(true, {transform: booleanAttribute});

  /** Whether to skip disabled items during navigation. */
  readonly skipDisabled = input(true, {transform: booleanAttribute});

  /** Typeahead delay. */
  readonly typeaheadDelay = input(0.5);

  /** Selected item values. */
  readonly value = model<V[]>([]);

  /** Text direction. */
  readonly textDirection = inject(Directionality).valueSignal;

  /** The UI pattern for the tree. */
  pattern: TreePattern<V> = new TreePattern<V>({
    ...this,
    allItems: this._itemPatterns,
    activeIndex: signal(0),
  });

  constructor() {
    // Binds groups to tree items.
    afterRenderEffect(() => {
      const groups = this._cdkGroups();
      const treeItems = this._cdkTreeItems();
      for (const group of groups) {
        const treeItem = treeItems.find(item => item.value() === group.value());
        treeItem?.group.set(group);
      }
    });
  }
}

/** Makes an element a tree item within a `CdkTree`. */
@Directive({
  selector: '[cdkTreeItem]',
  exportAs: 'cdkTreeItem',
  host: {
    'class': 'cdk-treeitem',
    '[class.cdk-active]': 'pattern.active()',
    'role': 'treeitem',
    '[id]': 'pattern.id()',
    '[attr.aria-expanded]': 'pattern.expandable() ? pattern.expanded() : null',
    '[attr.aria-selected]': 'pattern.selected()',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[attr.aria-level]': 'pattern.level()',
    '[attr.aria-owns]': 'group()?.id',
    '[attr.aria-setsize]': 'pattern.setsize()',
    '[attr.aria-posinset]': 'pattern.posinset()',
    '[attr.tabindex]': 'pattern.tabindex()',
  },
  providers: [{provide: BaseGroupable, useExisting: forwardRef(() => CdkTreeItem)}],
})
export class CdkTreeItem<V> extends BaseGroupable {
  /** A reference to the tree item element. */
  private readonly _elementRef = inject(ElementRef);

  /** The host native element. */
  private readonly _element = computed(() => this._elementRef.nativeElement);

  /** A unique identifier for the tree item. */
  private readonly _id = inject(_IdGenerator).getId('cdk-tree-item-');

  /** The top level CdkTree. */
  private readonly _cdkTree = inject(CdkTree<V>, {optional: true});

  /** The parent CdkTreeItem. */
  private readonly _cdkTreeItem = inject(CdkTreeItem<V>, {optional: true, skipSelf: true});

  /** The top lavel TreePattern. */
  private readonly _treePattern = computed(() => this._cdkTree?.pattern);

  /** The parent TreeItemPattern. */
  private readonly _parentPattern: Signal<TreeItemPattern<V> | TreePattern<V> | undefined> =
    computed(() => this._cdkTreeItem?.pattern ?? this._treePattern());

  /** The value of the tree item. */
  readonly value = input.required<V>();

  /** Whether the tree item is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Optional label for typeahead. Defaults to the element's textContent. */
  readonly label = input<string>();

  /** Search term for typeahead. */
  readonly searchTerm = computed(() => this.label() ?? this._element().textContent);

  /** Manual group assignment. */
  readonly group = signal<CdkGroup<V> | undefined>(undefined);

  /** The UI pattern for this item. */
  pattern: TreeItemPattern<V> = new TreeItemPattern<V>({
    ...this,
    id: () => this._id,
    element: this._element,
    tree: this._treePattern,
    parent: this._parentPattern,
    children: computed(
      () =>
        this.group()
          ?.children()
          .map(item => (item as CdkTreeItem<V>).pattern) ?? [],
    ),
    hasChilren: computed(() => !!this.group()),
  });

  constructor() {
    super();

    // Updates the visibility of the owned group.
    afterRenderEffect(() => {
      this.group()?.visible.set(this.pattern.expanded());
    });
  }
}
