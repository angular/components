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
  untracked,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {ComboboxTreePattern, TreeItemPattern, TreePattern} from '../private';
import {ComboboxPopup} from '../combobox';
import type {TreeItem} from './tree-item';
import {sortDirectives} from './utils';

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
    'role': 'tree',
    '[attr.id]': 'id()',
    '[attr.aria-orientation]': '_pattern.orientation()',
    '[attr.aria-multiselectable]': '_pattern.multi()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-activedescendant]': '_pattern.activeDescendant()',
    '[tabindex]': '_pattern.tabIndex()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
    '(focusin)': '_onFocus()',
  },
  hostDirectives: [ComboboxPopup],
})
export class Tree<V> {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** A reference to the parent combobox popup, if one exists. */
  private readonly _popup = inject<ComboboxPopup<V>>(ComboboxPopup, {
    optional: true,
  });

  /** All TreeItem instances within this tree. */
  private readonly _unorderedItems = signal(new Set<TreeItem<V>>());

  /** A unique identifier for the tree. */
  readonly id = input(inject(_IdGenerator).getId('ng-tree-', true));

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
  readonly nav = input(false, {transform: booleanAttribute});

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
      element: () => this.element,
    };

    this._pattern = this._popup?.combobox
      ? new ComboboxTreePattern<V>(inputs)
      : new TreePattern<V>(inputs);

    if (this._popup?.combobox) {
      this._popup?._controls?.set(this._pattern as ComboboxTreePattern<V>);
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
      if (!(this._pattern instanceof ComboboxTreePattern)) return;

      const items = inputs.allItems();
      const values = untracked(() => this.values());

      if (items && values.some(v => !items.some(i => i.value() === v))) {
        this.values.set(values.filter(v => items.some(i => i.value() === v)));
      }
    });
  }

  _onFocus() {
    this._hasFocused.set(true);
  }

  _register(child: TreeItem<V>) {
    this._unorderedItems().add(child);
    this._unorderedItems.set(new Set(this._unorderedItems()));
  }

  _unregister(child: TreeItem<V>) {
    this._unorderedItems().delete(child);
    this._unorderedItems.set(new Set(this._unorderedItems()));
  }

  scrollActiveItemIntoView(options: ScrollIntoViewOptions = {block: 'nearest'}) {
    this._pattern.inputs.activeItem()?.element()?.scrollIntoView(options);
  }
}
