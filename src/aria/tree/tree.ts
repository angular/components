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
  afterNextRender,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {
  ComboboxTreePattern,
  TreeItemPattern,
  TreePattern,
  DeferredContent,
  DeferredContentAware,
} from '@angular/aria/private';
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
 * A container that transforms nested lists into an accessible, ARIA-compliant tree structure.
 * It manages the overall state of the tree, including selection, expansion, and keyboard
 * navigation.
 *
 * ```html
 * <ul ngTree [(value)]="selectedItems" [multi]="true">
 *   <ng-template
 *     [ngTemplateOutlet]="treeNodes"
 *     [ngTemplateOutletContext]="{nodes: treeData, parent: tree}"
 *   />
 * </ul>
 *
 * <ng-template #treeNodes let-nodes="nodes" let-parent="parent">
 *   @for (node of nodes; track node.name) {
 *     <li ngTreeItem [parent]="parent" [value]="node.name" [label]="node.name">
 *       {{ node.name }}
 *       @if (node.children) {
 *         <ul role="group">
 *           <ng-template ngTreeItemGroup [ownedBy]="treeItem" #group="ngTreeItemGroup">
 *             <ng-template
 *               [ngTemplateOutlet]="treeNodes"
 *               [ngTemplateOutletContext]="{nodes: node.children, parent: group}"
 *             />
 *           </ng-template>
 *         </ul>
 *       }
 *     </li>
 *   }
 * </ng-template>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngTree]',
  exportAs: 'ngTree',
  host: {
    'class': 'ng-tree',
    'role': 'tree',
    '[attr.id]': 'id()',
    '[attr.aria-orientation]': '_pattern.orientation()',
    '[attr.aria-multiselectable]': '_pattern.multi()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-activedescendant]': '_pattern.activeDescendant()',
    '[tabindex]': '_pattern.tabIndex()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
    '(focusin)': 'onFocus()',
  },
  hostDirectives: [ComboboxPopup],
})
export class Tree<V> {
  /** A reference to the parent combobox popup, if one exists. */
  private readonly _popup = inject<ComboboxPopup<V>>(ComboboxPopup, {
    optional: true,
  });

  /** A reference to the tree element. */
  private readonly _elementRef = inject(ElementRef);

  /** All TreeItem instances within this tree. */
  private readonly _unorderedItems = signal(new Set<TreeItem<V>>());

  /** A unique identifier for the tree. */
  readonly id = input<string>(inject(_IdGenerator).getId('ng-tree-', true));

  /** The host native element. */
  readonly element = computed(() => this._elementRef.nativeElement);

  /** Orientation of the tree. */
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');

  /** Whether multi-selection is allowed. */
  readonly multi = input(false, {transform: booleanAttribute});

  /** Whether the tree is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /**
   * The selection strategy used by the tree.
   * - `explicit`: Items are selected explicitly by the user (e.g., via click or spacebar).
   * - `follow`: The focused item is automatically selected.
   */
  readonly selectionMode = input<'explicit' | 'follow'>('explicit');

  /**
   * The focus strategy used by the tree.
   * - `roving`: Focus is moved to the active item using `tabindex`.
   * - `activedescendant`: Focus remains on the tree container, and `aria-activedescendant` is used to indicate the active item.
   */
  readonly focusMode = input<'roving' | 'activedescendant'>('roving');

  /** Whether navigation wraps. */
  readonly wrap = input(true, {transform: booleanAttribute});

  /**
   * Whether to allow disabled items to receive focus. When `true`, disabled items are
   * focusable but not interactive. When `false`, disabled items are skipped during navigation.
   */
  readonly softDisabled = input(true, {transform: booleanAttribute});

  /** The delay in seconds before the typeahead search is reset. */
  readonly typeaheadDelay = input(500);

  /** The values of the currently selected items. */
  readonly values = model<V[]>([]);

  /** Text direction. */
  readonly textDirection = inject(Directionality).valueSignal;

  /** Whether the tree is in navigation mode. */
  readonly nav = input(false);

  /**
   * The `aria-current` type. It can be used in navigation trees to indicate the currently active item.
   * See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current for more details.
   */
  readonly currentType = input<'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'>(
    'page',
  );

  /** The UI pattern for the tree. */
  readonly _pattern: TreePattern<V>;

  /** Whether the tree has received focus since it was rendered. */
  private _hasFocused = signal(false);

  constructor() {
    const inputs = {
      ...this,
      id: this.id,
      allItems: computed(() =>
        [...this._unorderedItems()].sort(sortDirectives).map(item => item._pattern),
      ),
      activeItem: signal<TreeItemPattern<V> | undefined>(undefined),
      combobox: () => this._popup?.combobox?._pattern,
    };

    this._pattern = this._popup?.combobox
      ? new ComboboxTreePattern<V>(inputs)
      : new TreePattern<V>(inputs);

    if (this._popup?.combobox) {
      this._popup?.controls?.set(this._pattern as ComboboxTreePattern<V>);
    }

    afterRenderEffect(() => {
      if (!this._hasFocused()) {
        this._pattern.setDefaultState();
      }
    });

    afterRenderEffect(() => {
      const items = inputs.allItems();
      const activeItem = untracked(() => inputs.activeItem());

      if (!items.some(i => i === activeItem) && activeItem) {
        this._pattern.listBehavior.unfocus();
      }
    });

    afterRenderEffect(() => {
      const items = inputs.allItems();
      const values = untracked(() => this.values());

      if (items && values.some(v => !items.some(i => i.value() === v))) {
        this.values.set(values.filter(v => items.some(i => i.value() === v)));
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

  scrollActiveItemIntoView(options: ScrollIntoViewOptions = {block: 'nearest'}) {
    this._pattern.inputs.activeItem()?.element()?.scrollIntoView(options);
  }
}

/**
 * A selectable and expandable item in an `ngTree`.
 *
 * The `ngTreeItem` directive represents an individual node within an `ngTree`. It can be
 * selected, expanded (if it has children), and disabled. The `parent` input establishes
 * the hierarchical relationship within the tree.
 *
 * ```html
 * <li ngTreeItem [parent]="parentTreeOrGroup" value="item-id" label="Item Label">
 *   Item Label
 * </li>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngTreeItem]',
  exportAs: 'ngTreeItem',
  host: {
    'class': 'ng-treeitem',
    '[attr.data-active]': 'active()',
    'role': 'treeitem',
    '[id]': '_pattern.id()',
    '[attr.aria-expanded]': '_expanded()',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-current]': '_pattern.current()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-level]': 'level()',
    '[attr.aria-setsize]': '_pattern.setsize()',
    '[attr.aria-posinset]': '_pattern.posinset()',
    '[attr.tabindex]': '_pattern.tabIndex()',
  },
})
export class TreeItem<V> extends DeferredContentAware implements OnInit, OnDestroy, HasElement {
  /** A reference to the tree item element. */
  private readonly _elementRef = inject(ElementRef);

  /** The owned tree item group. */
  private readonly _group = signal<TreeItemGroup<V> | undefined>(undefined);

  /** A unique identifier for the tree item. */
  readonly id = input<string>(inject(_IdGenerator).getId('ng-tree-item-', true));

  /** The host native element. */
  readonly element = computed(() => this._elementRef.nativeElement);

  /** The value of the tree item. */
  readonly value = input.required<V>();

  /** The parent tree root or tree item group. */
  readonly parent = input.required<Tree<V> | TreeItemGroup<V>>();

  /** Whether the tree item is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the tree item is selectable. */
  readonly selectable = input<boolean>(true);

  /** Whether the tree item is expanded. */
  readonly expanded = model<boolean>(false);

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

  /** Whether the item is active. */
  readonly active = computed(() => this._pattern.active());

  /** The level of the current item in a tree. */
  readonly level = computed(() => this._pattern.level());

  /** Whether the item is selected. */
  readonly selected = computed(() => this._pattern.selected());

  /** Whether this item is visible due to all of its parents being expanded. */
  readonly visible = computed(() => this._pattern.visible());

  /** Whether the tree is expanded. Use this value for aria-expanded. */
  protected readonly _expanded: Signal<boolean | undefined> = computed(() =>
    this._pattern.expandable() ? this._pattern.expanded() : undefined,
  );

  /** The UI pattern for this item. */
  _pattern: TreeItemPattern<V>;

  constructor() {
    super();
    afterNextRender(() => {
      if (this.tree()._pattern instanceof ComboboxTreePattern) {
        this.preserveContent.set(true);
      }
    });
    // Connect the group's hidden state to the DeferredContentAware's visibility.
    afterRenderEffect(() => {
      this.tree()._pattern instanceof ComboboxTreePattern
        ? this.contentVisible.set(true)
        : this.contentVisible.set(this._pattern.expanded());
    });
  }

  ngOnInit() {
    this.parent().register(this);
    this.tree().register(this);

    const treePattern = computed(() => this.tree()._pattern);
    const parentPattern = computed(() => {
      if (this.parent() instanceof Tree) {
        return treePattern();
      }
      return (this.parent() as TreeItemGroup<V>).ownedBy()._pattern;
    });
    this._pattern = new TreeItemPattern<V>({
      ...this,
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
 * Group that contains children tree items.
 *
 * The `ngTreeItemGroup` structural directive should be applied to an `ng-template` that
 * wraps the child `ngTreeItem` elements. It is used to define a group of children for an
 * expandable `ngTreeItem`. The `ownedBy` input links the group to its parent `ngTreeItem`.
 *
 * ```html
 * <li ngTreeItem [value]="'parent-id'">
 *   Parent Item
 *   <ul role="group">
 *     <ng-template ngTreeItemGroup [ownedBy]="parentTreeItemRef">
 *       <li ngTreeItem [value]="'child-id'">Child Item</li>
 *     </ng-template>
 *   </ul>
 * </li>
 * ```
 *
 * @developerPreview 21.0
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
    [...this._unorderedItems()].sort(sortDirectives).map(c => c._pattern),
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
