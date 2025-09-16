import {computed} from '@angular/core';
import {ListboxInputs, ListboxPattern} from './listbox';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {OptionPattern} from './option';
import {ComboboxPattern, ComboboxPopupControls} from '../combobox/combobox';

export type ComboboxListboxInputs<V> = ListboxInputs<V> & {
  /** The combobox controlling the listbox. */
  combobox: SignalLike<ComboboxPattern<OptionPattern<V>, V> | undefined>;
};

export class ComboboxListboxPattern<V> extends ListboxPattern<V> {
  override tabindex: SignalLike<-1 | 0> = () => -1;

  constructor(override readonly inputs: ComboboxListboxInputs<V>) {
    if (inputs.combobox()) {
      inputs.multi = () => false;
      inputs.focusMode = () => 'activedescendant';
      inputs.element = inputs.combobox()!.inputs.inputEl;
    }

    super(inputs);
  }

  override onKeydown(_: KeyboardEvent): void {}
  override onPointerdown(_: PointerEvent): void {}
  override setDefaultState(): void {}

  /** The actions that can be performed on a combobox popup listbox. */
  comboboxActions: ComboboxPopupControls<OptionPattern<V>, V> = {
    activeId: computed(() => this.listBehavior.activedescendant()),
    next: () => this.listBehavior.next(),
    prev: () => this.listBehavior.prev(),
    last: () => this.listBehavior.last(),
    first: () => this.listBehavior.first(),
    unfocus: () => this.listBehavior.unfocus(),
    select: item => this.listBehavior.select(item),
    clearSelection: () => this.listBehavior.deselectAll(),
    getItem: e => this._getItem(e),
    getSelectedItem: () => this.inputs.items().find(i => i.selected()),
    setValue: (value: V | undefined) => this.inputs.value.set(value ? [value] : []),
    filter: (text: string) => {
      const filterFn = this.inputs.combobox()!.inputs.filter();

      this.inputs.items().forEach(i => {
        const isMatch = filterFn(text, i.searchTerm());
        i.inert.set(isMatch ? null : true);
      });
    },
  };
}
