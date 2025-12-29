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
  afterNextRender,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {ComboboxTreePattern, TreeItemPattern, DeferredContentAware} from '../private';
import {Tree} from './tree';
import {TreeItemGroup} from './tree-item-group';
import {HasElement} from './utils';

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
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The owned tree item group. */
  private readonly _group = signal<TreeItemGroup<V> | undefined>(undefined);

  /** A unique identifier for the tree item. */
  readonly id = input(inject(_IdGenerator).getId('ng-tree-item-', true));

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
  readonly searchTerm = computed(() => this.label() ?? this.element.textContent);

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
    this.parent()._register(this);
    this.tree()._register(this);

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
      children: computed(() => this._group()?._childPatterns()),
      hasChildren: computed(() => !!this._group()),
      element: () => this.element,
      searchTerm: () => this.searchTerm() ?? '',
    });
  }

  ngOnDestroy() {
    this.parent()._unregister(this);
    this.tree()._unregister(this);
  }

  _register(group: TreeItemGroup<V>) {
    this._group.set(group);
  }

  _unregister() {
    this._group.set(undefined);
  }
}
