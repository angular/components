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
  untracked,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {DeferredContent, DeferredContentAware} from '@angular/aria/deferred-content';
import {ComboboxTreePattern, TreeItemPattern, TreePattern} from '@angular/aria/ui-patterns';
import {ComboboxPopup} from '../combobox';

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
 * <ul ngTree [(value)]="selectedItems" [multi]="true">
 *   <li ngTreeItem [value]="'leaf1'">Leaf Item 1</li>
 *   <li ngTreeItem [value]="'parent1'">
 *     Parent Item 1
 *     <ul ngTreeItemGroup [value]="'parent1'">
 *       <ng-template ngTreeItemGroupContent>
 *         <li ngTreeItem [value]="'child1.1'">Child Item 1.1</li>
 *         <li ngTreeItem [value]="'child1.2'">Child Item 1.2</li>
 *       </ng-template>
 *     </ul>
 *   </li>
 *   <li ngTreeItem [value]="'leaf2'" [disabled]="true">Disabled Leaf Item 2</li>
 * </ul>
 * ```
 */
@Directive({
  selector: '[ngTree]',
  exportAs: 'ngTree',
  host: {
    'class': 'ng-tree',
    'role': 'tree',
    '[attr.id]': 'id()',
    '[attr.aria-orientation]': 'pattern.orientation()',
    '[attr.aria-multiselectable]': 'pattern.multi()',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[attr.aria-activedescendant]': 'pattern.activedescendant()',
    '[tabindex]': 'pattern.tabindex()',
    '(keydown)': 'pattern.onKeydown($event)',
    '(pointerdown)': 'pattern.onPointerdown($event)',
    '(focusin)': 'onFocus()',
  },
  hostDirectives: [{directive: ComboboxPopup}],
})
export class Tree<V> {
  /** A unique identifier for the tree. */
  private readonly _generatedId = inject(_IdGenerator).getId('ng-tree-');

  // TODO(wagnermaciel): https://github.com/angular/components/pull/30495#discussion_r1972601144.
  /** A unique identifier for the tree. */
  protected id = computed(() => this._generatedId);

  /** A reference to the parent combobox popup, if one exists. */
  private readonly _popup = inject<ComboboxPopup<V>>(ComboboxPopup, {
    optional: true,
  });

  /** A reference to the tree element. */
  private readonly _elementRef = inject(ElementRef);

  /** All TreeItem instances within this tree. */
  private readonly _unorderedItems = signal(new Set<TreeItem<V>>());

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
  readonly pattern: TreePattern<V>;

  /** Whether the tree has received focus yet. */
  private _hasFocused = signal(false);

  constructor() {
    const inputs = {
      ...this,
      id: this.id,
      allItems: computed(() =>
        [...this._unorderedItems()].sort(sortDirectives).map(item => item.pattern),
      ),
      activeItem: signal<TreeItemPattern<V> | undefined>(undefined),
      element: () => this._elementRef.nativeElement,
      combobox: () => this._popup?.combobox?.pattern,
    };

    this.pattern = this._popup?.combobox
      ? new ComboboxTreePattern<V>(inputs)
      : new TreePattern<V>(inputs);

    if (this._popup?.combobox) {
      this._popup?.controls?.set(this.pattern as ComboboxTreePattern<V>);
    }

    afterRenderEffect(() => {
      if (!this._hasFocused()) {
        this.pattern.setDefaultState();
      }
    });

    afterRenderEffect(() => {
      const items = inputs.allItems();
      const activeItem = untracked(() => inputs.activeItem());

      if (!items.some(i => i === activeItem) && activeItem) {
        this.pattern.listBehavior.unfocus();
      }
    });

    afterRenderEffect(() => {
      const items = inputs.allItems();
      const value = untracked(() => this.value());

      if (items && value.some(v => !items.some(i => i.value() === v))) {
        this.value.set(value.filter(v => items.some(i => i.value() === v)));
      }
    });
  }

  onFocus() {
    this._hasFocused.set(true);
  }

  register(child: TreeItem<V>) {
    this._unorderedItems().add(child);
    this._unorderedItems.set(new Set(this._unorderedItems()));
  }

  unregister(child: TreeItem<V>) {
    this._unorderedItems().delete(child);
    this._unorderedItems.set(new Set(this._unorderedItems()));
  }
}

/**
 * A selectable and expandable Tree Item in a Tree.
 */
@Directive({
  selector: '[ngTreeItem]',
  exportAs: 'ngTreeItem',
  host: {
    'class': 'ng-treeitem',
    '[attr.data-active]': 'pattern.active()',
    'role': 'treeitem',
    '[id]': 'pattern.id()',
    '[attr.aria-expanded]': 'pattern.expandable() ? pattern.expanded() : null',
    '[attr.aria-selected]': 'pattern.selected()',
    '[attr.aria-current]': 'pattern.current()',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[attr.aria-level]': 'pattern.level()',
    '[attr.aria-setsize]': 'pattern.setsize()',
    '[attr.aria-posinset]': 'pattern.posinset()',
    '[attr.tabindex]': 'pattern.tabindex()',
  },
})
export class TreeItem<V> extends DeferredContentAware implements OnInit, OnDestroy, HasElement {
  /** A reference to the tree item element. */
  private readonly _elementRef = inject(ElementRef);

  /** A unique identifier for the tree item. */
  private readonly _id = inject(_IdGenerator).getId('ng-tree-item-');

  /** The owned tree item group. */
  private readonly _group = signal<TreeItemGroup<V> | undefined>(undefined);

  /** The host native element. */
  readonly element = computed(() => this._elementRef.nativeElement);

  /** The value of the tree item. */
  readonly value = input.required<V>();

  /** The parent tree root or tree item group. */
  readonly parent = input.required<Tree<V> | TreeItemGroup<V>>();

  /** Whether the tree item is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Optional label for typeahead. Defaults to the element's textContent. */
  readonly label = input<string>();

  /** Search term for typeahead. */
  readonly searchTerm = computed(() => this.label() ?? this.element().textContent);

  /** The tree root. */
  readonly tree: Signal<Tree<V>> = computed(() => {
    if (this.parent() instanceof Tree) {
      return this.parent() as Tree<V>;
    }
    return (this.parent() as TreeItemGroup<V>).ownedBy().tree();
  });

  /** The UI pattern for this item. */
  pattern: TreeItemPattern<V>;

  constructor() {
    super();
    this.preserveContent.set(true);
    // Connect the group's hidden state to the DeferredContentAware's visibility.
    afterRenderEffect(() => {
      this.tree().pattern instanceof ComboboxTreePattern
        ? this.contentVisible.set(true)
        : this.contentVisible.set(this.pattern.expanded());
    });
  }

  ngOnInit() {
    this.parent().register(this);
    this.tree().register(this);

    const treePattern = computed(() => this.tree().pattern);
    const parentPattern = computed(() => {
      if (this.parent() instanceof Tree) {
        return treePattern();
      }
      return (this.parent() as TreeItemGroup<V>).ownedBy().pattern;
    });
    this.pattern = new TreeItemPattern<V>({
      ...this,
      id: () => this._id,
      tree: treePattern,
      parent: parentPattern,
      children: computed(() => this._group()?.children() ?? []),
      hasChildren: computed(() => !!this._group()),
    });
  }

  ngOnDestroy() {
    this.parent().unregister(this);
    this.tree().unregister(this);
  }

  register(group: TreeItemGroup<V>) {
    this._group.set(group);
  }

  unregister() {
    this._group.set(undefined);
  }
}

/**
 * Contains children tree itmes.
 */
@Directive({
  selector: 'ng-template[ngTreeItemGroup]',
  exportAs: 'ngTreeItemGroup',
  hostDirectives: [DeferredContent],
})
export class TreeItemGroup<V> implements OnInit, OnDestroy {
  /** The DeferredContent host directive. */
  private readonly _deferredContent = inject(DeferredContent);

  /** All groupable items that are descendants of the group. */
  private readonly _unorderedItems = signal(new Set<TreeItem<V>>());

  /** Child items within this group. */
  readonly children = computed<TreeItemPattern<V>[]>(() =>
    [...this._unorderedItems()].sort(sortDirectives).map(c => c.pattern),
  );

  /** Tree item that owns the group. */
  readonly ownedBy = input.required<TreeItem<V>>();

  ngOnInit() {
    this._deferredContent.deferredContentAware.set(this.ownedBy());
    this.ownedBy().register(this);
  }

  ngOnDestroy() {
    this.ownedBy().unregister();
  }

  register(child: TreeItem<V>) {
    this._unorderedItems().add(child);
    this._unorderedItems.set(new Set(this._unorderedItems()));
  }

  unregister(child: TreeItem<V>) {
    this._unorderedItems().delete(child);
    this._unorderedItems.set(new Set(this._unorderedItems()));
  }
}
