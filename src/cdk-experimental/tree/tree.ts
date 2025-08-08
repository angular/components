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
  inject,
  input,
  model,
  signal,
  Signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {DeferredContent, DeferredContentAware} from '@angular/cdk-experimental/deferred-content';
import {TreeItemPattern, TreePattern} from '../ui-patterns/tree/tree';

interface HasElement {
  element: Signal<HTMLElement>;
}

/**
 * Sort directives by their document order.
 */
function sortDirectives(a: HasElement, b: HasElement) {
  return (a.element().compareDocumentPosition(b.element()) & Node.DOCUMENT_POSITION_PRECEDING) > 0
    ? 1
    : -1;
}

/**
 * A Tree container.
 *
 * Transforms nested lists into an accessible, ARIA-compliant tree structure.
 *
 * ```html
 * <ul cdkTree [(value)]="selectedItems" [multi]="true">
 *   <li cdkTreeItem [value]="'leaf1'">Leaf Item 1</li>
 *   <li cdkTreeItem [value]="'parent1'">
 *     Parent Item 1
 *     <ul cdkTreeItemGroup [value]="'parent1'">
 *       <ng-template cdkTreeItemGroupContent>
 *         <li cdkTreeItem [value]="'child1.1'">Child Item 1.1</li>
 *         <li cdkTreeItem [value]="'child1.2'">Child Item 1.2</li>
 *       </ng-template>
 *     </ul>
 *   </li>
 *   <li cdkTreeItem [value]="'leaf2'" [disabled]="true">Disabled Leaf Item 2</li>
 * </ul>
 * ```
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
    '(focusin)': 'onFocus()',
  },
})
export class CdkTree<V> {
  /** All CdkTreeItem instances within this tree. */
  private readonly _unorderedItems = signal(new Set<CdkTreeItem<V>>());

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

  /** Whether the tree is in navigation mode. */
  readonly nav = input(false);

  /** The aria-current type. */
  readonly currentType = input<'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'>(
    'page',
  );

  /** The UI pattern for the tree. */
  readonly pattern: TreePattern<V> = new TreePattern<V>({
    ...this,
    allItems: computed(() =>
      [...this._unorderedItems()].sort(sortDirectives).map(item => item.pattern),
    ),
    activeItem: signal(undefined),
  });

  /** Whether the tree has received focus yet. */
  private _hasFocused = signal(false);

  constructor() {
    afterRenderEffect(() => {
      if (!this._hasFocused()) {
        this.pattern.setDefaultState();
      }
    });
  }

  onFocus() {
    this._hasFocused.set(true);
  }

  register(child: CdkTreeItem<V>) {
    this._unorderedItems().add(child);
    this._unorderedItems.set(new Set(this._unorderedItems()));
  }

  unregister(child: CdkTreeItem<V>) {
    this._unorderedItems().delete(child);
    this._unorderedItems.set(new Set(this._unorderedItems()));
  }
}

/**
 * A selectable and expandable Tree Item in a Tree.
 */
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
    '[attr.aria-current]': 'pattern.current()',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[attr.aria-level]': 'pattern.level()',
    '[attr.aria-owns]': 'ownsId()',
    '[attr.aria-setsize]': 'pattern.setsize()',
    '[attr.aria-posinset]': 'pattern.posinset()',
    '[attr.tabindex]': 'pattern.tabindex()',
    '[attr.inert]': 'pattern.visible() ? null : true',
  },
})
export class CdkTreeItem<V> implements OnInit, OnDestroy, HasElement {
  /** A reference to the tree item element. */
  private readonly _elementRef = inject(ElementRef);

  /** A unique identifier for the tree item. */
  private readonly _id = inject(_IdGenerator).getId('cdk-tree-item-');

  /** The owned tree item group. */
  private readonly _group = signal<CdkTreeItemGroup<V> | undefined>(undefined);

  /** The id of the owned group. */
  readonly ownsId = computed(() => this._group()?.id);

  /** The host native element. */
  readonly element = computed(() => this._elementRef.nativeElement);

  /** The value of the tree item. */
  readonly value = input.required<V>();

  /** The parent tree root or tree item group. */
  readonly parent = input.required<CdkTree<V> | CdkTreeItemGroup<V>>();

  /** Whether the tree item is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Optional label for typeahead. Defaults to the element's textContent. */
  readonly label = input<string>();

  /** Search term for typeahead. */
  readonly searchTerm = computed(() => this.label() ?? this.element().textContent);

  /** The tree root. */
  readonly tree: Signal<CdkTree<V>> = computed(() => {
    if (this.parent() instanceof CdkTree) {
      return this.parent() as CdkTree<V>;
    }
    return (this.parent() as CdkTreeItemGroup<V>).ownedBy().tree();
  });

  /** The UI pattern for this item. */
  pattern: TreeItemPattern<V>;

  constructor() {
    // Updates the visibility of the owned group.
    afterRenderEffect(() => {
      this._group()?.visible.set(this.pattern.expanded());
    });
  }

  ngOnInit() {
    this.parent().register(this);
    this.tree().register(this);

    const treePattern = computed(() => this.tree().pattern);
    const parentPattern = computed(() => {
      if (this.parent() instanceof CdkTree) {
        return treePattern();
      }
      return (this.parent() as CdkTreeItemGroup<V>).ownedBy().pattern;
    });
    this.pattern = new TreeItemPattern<V>({
      ...this,
      id: () => this._id,
      tree: treePattern,
      parent: parentPattern,
      children: computed(
        () =>
          this._group()
            ?.children()
            .map(item => (item as CdkTreeItem<V>).pattern) ?? [],
      ),
      hasChildren: computed(() => !!this._group()),
    });
  }

  ngOnDestroy() {
    this.parent().unregister(this);
    this.tree().unregister(this);
  }

  register(group: CdkTreeItemGroup<V>) {
    this._group.set(group);
  }

  unregister() {
    this._group.set(undefined);
  }
}

/**
 * Container that designates content as a group.
 */
@Directive({
  selector: '[cdkTreeItemGroup]',
  exportAs: 'cdkTreeItemGroup',
  hostDirectives: [
    {
      directive: DeferredContentAware,
      inputs: ['preserveContent'],
    },
  ],
  host: {
    'class': 'cdk-treeitem-group',
    'role': 'group',
    '[id]': 'id',
    '[attr.inert]': 'visible() ? null : true',
  },
})
export class CdkTreeItemGroup<V> implements OnInit, OnDestroy, HasElement {
  /** A reference to the group element. */
  private readonly _elementRef = inject(ElementRef);

  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware);

  /** All groupable items that are descendants of the group. */
  private readonly _unorderedItems = signal(new Set<CdkTreeItem<V>>());

  /** The host native element. */
  readonly element = computed(() => this._elementRef.nativeElement);

  /** Unique ID for the group. */
  readonly id = inject(_IdGenerator).getId('cdk-tree-group-');

  /** Whether the group is visible. */
  readonly visible = signal(true);

  /** Child items within this group. */
  readonly children = computed(() => [...this._unorderedItems()].sort(sortDirectives));

  /** Tree item that owns the group. */
  readonly ownedBy = input.required<CdkTreeItem<V>>();

  constructor() {
    // Connect the group's hidden state to the DeferredContentAware's visibility.
    afterRenderEffect(() => {
      this._deferredContentAware.contentVisible.set(this.visible());
    });
  }

  ngOnInit() {
    this.ownedBy().register(this);
  }

  ngOnDestroy() {
    this.ownedBy().unregister();
  }

  register(child: CdkTreeItem<V>) {
    this._unorderedItems().add(child);
    this._unorderedItems.set(new Set(this._unorderedItems()));
  }

  unregister(child: CdkTreeItem<V>) {
    this._unorderedItems().delete(child);
    this._unorderedItems.set(new Set(this._unorderedItems()));
  }
}

/**
 * A structural directive that marks the `ng-template` to be used as the content
 * for a `CdkTreeItemGroup`. This content can be lazily loaded.
 */
@Directive({
  selector: 'ng-template[cdkTreeItemGroupContent]',
  hostDirectives: [DeferredContent],
})
export class CdkTreeItemGroupContent {}
