/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {KeyboardEventManager} from '../behaviors/event-manager/keyboard-event-manager';
import {ModifierKey as Modifier} from '../behaviors/event-manager/event-manager';
import {MouseEventManager} from '../behaviors/event-manager/mouse-event-manager';
import {ListboxPattern} from './listbox';

/** The selection operations that the listbox can perform. */
interface SelectOptions {
  select?: boolean;
  toggle?: boolean;
  toggleOne?: boolean;
  selectOne?: boolean;
  selectAll?: boolean;
  selectFromAnchor?: boolean;
  selectFromActive?: boolean;
}

/** Controls selection for a list of items. */
export class ListboxController {
  followFocus = computed(() => this.state.inputs.selectionMode() === 'follow');

  /** The key used to navigate to the previous item in the list. */
  prevKey = computed(() => {
    if (this.state.inputs.orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.state.inputs.directionality() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key used to navigate to the next item in the list. */
  nextKey = computed(() => {
    if (this.state.inputs.orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.state.inputs.directionality() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The regexp used to decide if a key should trigger typeahead. */
  typeaheadRegexp = /^.$/; // TODO: Ignore spaces?

  /** The keydown event manager for the listbox. */
  keydown = computed(() => {
    const manager = new KeyboardEventManager();

    if (!this.followFocus()) {
      manager
        .on(this.prevKey, () => this.prev())
        .on(this.nextKey, () => this.next())
        .on('Home', () => this.first())
        .on('End', () => this.last())
        .on(this.typeaheadRegexp, e => this.typeahead(e.key));
    }

    if (this.followFocus()) {
      manager
        .on(this.prevKey, () => this.prev({selectOne: true}))
        .on(this.nextKey, () => this.next({selectOne: true}))
        .on('Home', () => this.first({selectOne: true}))
        .on('End', () => this.last({selectOne: true}))
        .on(this.typeaheadRegexp, e => this.typeahead(e.key, {selectOne: true}));
    }

    if (this.state.inputs.multiselectable()) {
      manager
        .on(Modifier.Shift, ' ', () => this._updateSelection({selectFromAnchor: true}))
        .on(Modifier.Shift, this.prevKey, () => this.prev({toggle: true}))
        .on(Modifier.Shift, this.nextKey, () => this.next({toggle: true}))
        .on(Modifier.Ctrl | Modifier.Shift, 'Home', () => this.first({selectFromActive: true}))
        .on(Modifier.Ctrl | Modifier.Shift, 'End', () => this.last({selectFromActive: true}))
        .on(Modifier.Ctrl, 'A', () => this._updateSelection({selectAll: true}));
    }

    if (!this.followFocus() && this.state.inputs.multiselectable()) {
      manager.on(' ', () => this._updateSelection({toggle: true}));
    }

    if (!this.followFocus() && !this.state.inputs.multiselectable()) {
      manager.on(' ', () => this._updateSelection({toggleOne: true}));
    }

    if (this.state.inputs.multiselectable() && this.followFocus()) {
      manager
        .on(Modifier.Ctrl, this.prevKey, () => this.prev())
        .on(Modifier.Ctrl, this.nextKey, () => this.next())
        .on(Modifier.Ctrl, 'Home', () => this.first()) // TODO: Not in spec but prob should be.
        .on(Modifier.Ctrl, 'End', () => this.last()); // TODO: Not in spec but prob should be.
    }

    return manager;
  });

  /** The mousedown event manager for the listbox. */
  mousedown = computed(() => {
    const manager = new MouseEventManager();

    if (!this.followFocus()) {
      manager.on((e: MouseEvent) => this.goto(e));
    }

    if (this.followFocus()) {
      manager.on((e: MouseEvent) => this.goto(e, {selectOne: true}));
    }

    if (this.state.inputs.multiselectable() && this.followFocus()) {
      manager.on(Modifier.Ctrl, (e: MouseEvent) => this.goto(e));
    }

    if (this.state.inputs.multiselectable()) {
      manager.on(Modifier.Shift, (e: MouseEvent) => this.goto(e, {selectFromActive: true}));
    }

    return manager;
  });

  constructor(readonly state: ListboxPattern) {}

  /** Handles keydown events for the listbox. */
  onKeydown(event: KeyboardEvent) {
    if (!this.state.disabled()) {
      this.keydown().handle(event);
    }
  }

  onMousedown(event: MouseEvent) {
    if (!this.state.disabled()) {
      this.mousedown().handle(event);
    }
  }

  /** Navigates to the first option in the listbox. */
  async first(opts?: SelectOptions) {
    await this.state.navigation.first();
    await this.state.focus.focus();
    await this._updateSelection(opts);
  }

  /** Navigates to the last option in the listbox. */
  async last(opts?: SelectOptions) {
    await this.state.navigation.last();
    await this.state.focus.focus();
    await this._updateSelection(opts);
  }

  /** Navigates to the next option in the listbox. */
  async next(opts?: SelectOptions) {
    await this.state.navigation.next();
    await this.state.focus.focus();
    await this._updateSelection(opts);
  }

  /** Navigates to the previous option in the listbox. */
  async prev(opts?: SelectOptions) {
    await this.state.navigation.prev();
    await this.state.focus.focus();
    await this._updateSelection(opts);
  }

  /** Navigates to the given item in the listbox. */
  async goto(event: MouseEvent, opts?: SelectOptions) {
    const item = this._getItem(event);

    if (item) {
      await this.state.navigation.goto(item);
      await this.state.focus.focus();
      await this._updateSelection(opts);
    }
  }

  /** Handles typeahead navigation for the listbox. */
  async typeahead(char: string, opts?: SelectOptions) {
    await this.state.typeahead.search(char);
    await this.state.focus.focus();
    await this._updateSelection(opts);
  }

  /** Handles updating selection for the listbox. */
  private async _updateSelection(opts?: SelectOptions) {
    if (opts?.select) {
      await this.state.selection.select();
    }
    if (opts?.toggle) {
      await this.state.selection.toggle();
    }
    if (opts?.toggleOne) {
      await this.state.selection.toggleOne();
    }
    if (opts?.selectOne) {
      await this.state.selection.selectOne();
    }
    if (opts?.selectAll) {
      await this.state.selection.selectAll();
    }
    if (opts?.selectFromAnchor) {
      await this.state.selection.selectFromAnchor();
    }
    if (opts?.selectFromActive) {
      await this.state.selection.selectFromActive();
    }
  }

  private _getItem(e: MouseEvent) {
    if (!(e.target instanceof HTMLElement)) {
      return;
    }

    const element = e.target.closest('[cdkoption]'); // TODO: Use a different identifier.
    return this.state.inputs.items().find(i => i.element() === element);
  }
}
