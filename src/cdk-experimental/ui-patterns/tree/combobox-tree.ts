import {computed} from '@angular/core';
import {TreeInputs, TreePattern, TreeItemPattern} from './tree';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {ComboboxPattern, ComboboxTreeControls} from '../combobox/combobox';

export type ComboboxTreeInputs<V> = TreeInputs<V> & {
  /** The combobox controlling the tree. */
  combobox: SignalLike<ComboboxPattern<TreeItemPattern<V>, V> | undefined>;
};

export class ComboboxTreePattern<V>
  extends TreePattern<V>
  implements ComboboxTreeControls<TreeItemPattern<V>, V>
{
  /** The ARIA role for the tree. */
  role = () => 'tree' as const;

  /* The id of the active (focused) item in the tree. */
  activeId = computed(() => this.listBehavior.activedescendant());

  /** The tabindex for the tree. Always -1 because the combobox handles focus. */
  override tabindex: SignalLike<-1 | 0> = () => -1;

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

  /** Noop. The combobox handles pointerdown events. */
  override onPointerdown(_: PointerEvent): void {}

  /** Noop. The combobox controls the open state. */
  override setDefaultState(): void {
    console.log('setDefaultState');
  }

  /** Navigates to the next focusable item in the tree. */
  next = () => this.listBehavior.next();

  /** Navigates to the previous focusable item in the tree. */
  prev = () => this.listBehavior.prev();

  /** Navigates to the last focusable item in the tree. */
  last = () => this.listBehavior.last();

  /** Navigates to the first focusable item in the tree. */
  first = () => this.listBehavior.first();

  /** Unfocuses the currently focused item in the tree. */
  unfocus = () => this.listBehavior.unfocus();

  /** Selects the specified item in the tree or the current active item if not provided. */
  select = (item?: TreeItemPattern<V>) => this.listBehavior.select(item);

  /** Clears the selection in the tree. */
  clearSelection = () => this.listBehavior.deselectAll();

  /** Retrieves the TreeItemPattern associated with a pointer event. */
  getItem = (e: PointerEvent) => this._getItem(e);

  /** Retrieves the currently selected item in the tree */
  getSelectedItem = () => this.inputs.allItems().find(i => i.selected());

  /** Sets the value of the combobox tree. */
  setValue = (value: V | undefined) => this.inputs.value.set(value ? [value] : []);

  /** Expands the currently focused item if it is expandable. */
  expandItem = () => this.expand();

  /** Collapses the currently focused item if it is expandable. */
  collapseItem = () => this.collapse();

  /** Whether the specified item or the currently active item is expandable. */
  isItemExpandable = (item?: TreeItemPattern<V>) => {
    item = item || this.activeItem();
    return item ? item.expandable() : false;
  };

  /** Filters the items in the tree based on the provided text. */
  filter = (text: string) => {
    const filterFn = this.inputs.combobox()!.inputs.filter();
    this.inputs.allItems().forEach(i => i.expansion.close());

    this.inputs.allItems().forEach(i => {
      const isMatch = filterFn(text, i.searchTerm());

      if (isMatch) {
        let parent = i.parent();
        while (parent && parent instanceof TreeItemPattern) {
          parent.inert.set(null);
          parent = parent.parent();
        }
      }

      i.inert.set(isMatch ? null : true);
    });
  };
}
