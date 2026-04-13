/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TreeInputs, TreePattern, TreeItemPattern} from './tree';
import {computed, SignalLike} from '../behaviors/signal-like/signal-like';
import {ComboboxPattern, ComboboxTreeControls} from '../combobox/combobox';

export type ComboboxTreeInputs<V> = TreeInputs<V> & {
  /** The combobox controlling the tree. */
  combobox: SignalLike<ComboboxPattern<TreeItemPattern<V>, V> | undefined>;
};

export class ComboboxTreePattern<V>
  extends TreePattern<V>
  implements ComboboxTreeControls<TreeItemPattern<V>, V>
{
  /** Toggles to expand or collapse a tree item. */
  readonly toggleExpansion = (item?: TreeItemPattern<V>) => this.treeBehavior.toggleExpansion(item);

  /** Whether the currently focused item is collapsible. */
  readonly isItemCollapsible = () => this.inputs.activeItem()?.parent() instanceof TreeItemPattern;

  /** The ARIA role for the tree. */
  readonly role = () => 'tree' as const;

  /* The id of the active (focused) item in the tree. */
  readonly activeId = computed(() => this.treeBehavior.activeDescendant());

  /** Returns the currently active (focused) item in the tree. */
  readonly getActiveItem = () => this.inputs.activeItem();

  /** The list of items in the tree. */
  override items = computed(() => this.inputs.items());

  /** The tab index for the tree. Always -1 because the combobox handles focus. */
  override readonly tabIndex: SignalLike<-1 | 0> = () => -1;

  constructor(override readonly inputs: ComboboxTreeInputs<V>) {
    if (inputs.combobox()) {
      inputs.multi = () => false;
      inputs.focusMode = () => 'activedescendant';
      inputs.element = inputs.combobox()!.inputs.inputEl;
    }

    super(inputs);
  }

  /** Noop. The combobox handles keydown events. */
  override onKeydown(_: KeyboardEvent): void {}

  /** Noop. The combobox handles click events. */
  override onClick(_: PointerEvent): void {}

  /** Noop. The combobox controls the open state. */
  override setDefaultState(): void {}

  /** Navigates to the specified item in the tree. */
  readonly focus = (item: TreeItemPattern<V>) => this.treeBehavior.goto(item);

  /** Navigates to the next focusable item in the tree. */
  readonly next = () => this.treeBehavior.next();

  /** Navigates to the previous focusable item in the tree. */
  readonly prev = () => this.treeBehavior.prev();

  /** Navigates to the last focusable item in the tree. */
  readonly last = () => this.treeBehavior.last();

  /** Navigates to the first focusable item in the tree. */
  readonly first = () => this.treeBehavior.first();

  /** Unfocuses the currently focused item in the tree. */
  readonly unfocus = () => this.treeBehavior.unfocus();

  // TODO: handle non-selectable parent nodes.
  /** Selects the specified item in the tree or the current active item if not provided. */
  readonly select = (item?: TreeItemPattern<V>) => this.treeBehavior.select(item);

  /** Toggles the selection state of the given item in the tree or the current active item if not provided. */
  readonly toggle = (item?: TreeItemPattern<V>) => this.treeBehavior.toggle(item);

  /** Clears the selection in the tree. */
  readonly clearSelection = () => this.treeBehavior.deselectAll();

  /** Retrieves the TreeItemPattern associated with a pointer event. */
  readonly getItem = (e: PointerEvent) => this._getItem(e);

  /** Retrieves the currently selected items in the tree */
  readonly getSelectedItems = () => this.inputs.items().filter(item => item.selected());

  /** Sets the value of the combobox tree. */
  readonly setValue = (value: V | undefined) => this.inputs.value.set(value ? [value] : []);

  /** Expands the currently focused item if it is expandable, or navigates to the first child. */
  readonly expandItem = () => this._expandOrFirstChild();

  /** Collapses the currently focused item if it is expandable, or navigates to the parent. */
  readonly collapseItem = () => this._collapseOrParent();

  /** Whether the specified item or the currently active item is expandable. */
  isItemExpandable(item: TreeItemPattern<V> | undefined = this.inputs.activeItem()) {
    return item ? item.expandable() : false;
  }

  /** Expands all of the tree items. */
  readonly expandAll = () => this.treeBehavior.expandAll();

  /** Collapses all of the tree items. */
  readonly collapseAll = () => this.treeBehavior.collapseAll();

  /** Whether the currently active item is selectable. */
  readonly isItemSelectable = (item: TreeItemPattern<V> | undefined = this.inputs.activeItem()) => {
    return item ? item.selectable() : false;
  };
}
