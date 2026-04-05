/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {KeyboardEventManager, PointerEventManager} from '../behaviors/event-manager';
import {computed, signal, untracked} from '@angular/core';
import {SignalLike, WritableSignalLike} from '../behaviors/signal-like/signal-like';
import {ExpansionItem} from '../behaviors/expansion/expansion';

/** Represents the required inputs for a simple combobox. */
export interface SimpleComboboxInputs extends ExpansionItem {
  /** The value of the combobox. */
  value: WritableSignalLike<string>;

  /** The element that the combobox is attached to. */
  element: SignalLike<HTMLElement>;

  /** The popup associated with the combobox. */
  popup: SignalLike<SimpleComboboxPopupPattern | undefined>;

  /** An inline suggestion to be displayed in the input. */
  inlineSuggestion: SignalLike<string | undefined>;

  /** Whether the combobox is disabled. */
  disabled: SignalLike<boolean>;
}

/** Controls the state of a simple combobox. */
export class SimpleComboboxPattern {
  /** Whether the combobox is expanded. */
  readonly expanded: WritableSignalLike<boolean>;

  /** The value of the combobox. */
  readonly value: WritableSignalLike<string>;

  /** The element that the combobox is attached to. */
  readonly element = () => this.inputs.element();

  /** Whether the combobox is disabled. */
  readonly disabled = () => this.inputs.disabled();

  /** An inline suggestion to be displayed in the input. */
  readonly inlineSuggestion = () => this.inputs.inlineSuggestion();

  /** The ID of the active descendant in the popup. */
  readonly activeDescendant = computed(() => this.inputs.popup()?.activeDescendant());

  /** The ID of the popup. */
  readonly popupId = computed(() => this.inputs.popup()?.popupId());

  /** The type of the popup. */
  readonly popupType = computed(() => this.inputs.popup()?.popupType());

  /** The autocomplete behavior of the combobox. */
  readonly autocomplete = computed<'none' | 'inline' | 'list' | 'both'>(() => {
    const hasPopup = !!this.inputs.popup();
    const hasInlineSuggestion = !!this.inlineSuggestion();
    if (hasPopup && hasInlineSuggestion) {
      return 'both';
    }
    if (hasPopup) {
      return 'list';
    }
    if (hasInlineSuggestion) {
      return 'inline';
    }
    return 'none';
  });

  /** A relay for keyboard events to the popup. */
  readonly keyboardEventRelay = signal<KeyboardEvent | undefined>(undefined);

  /** Whether the combobox is focused. */
  readonly isFocused = signal(false);

  /** Whether the most recent input event was a deletion. */
  readonly isDeleting = signal(false);

  /** Whether the combobox is editable (i.e., an input or textarea). */
  readonly isEditable = computed(
    () =>
      this.element().tagName.toLowerCase() === 'input' ||
      this.element().tagName.toLowerCase() === 'textarea',
  );

  /** The keydown event manager for the combobox. */
  keydown = computed(() => {
    const manager = new KeyboardEventManager();

    if (!this.expanded()) {
      manager.on('ArrowDown', () => this.expanded.set(true));

      if (!this.isEditable()) {
        manager.on(/^(Enter| )$/, () => this.expanded.set(true));
      }

      return manager;
    }

    manager
      .on(
        'ArrowLeft',
        e => {
          this.keyboardEventRelay.set(e);
        },
        {preventDefault: this.popupType() !== 'listbox'},
      )
      .on(
        'ArrowRight',
        e => {
          this.keyboardEventRelay.set(e);
        },
        {preventDefault: this.popupType() !== 'listbox'},
      )
      .on('ArrowUp', e => this.keyboardEventRelay.set(e))
      .on('ArrowDown', e => this.keyboardEventRelay.set(e))
      .on('Home', e => this.keyboardEventRelay.set(e))
      .on('End', e => this.keyboardEventRelay.set(e))
      .on('Enter', e => this.keyboardEventRelay.set(e))
      .on('PageUp', e => this.keyboardEventRelay.set(e))
      .on('PageDown', e => this.keyboardEventRelay.set(e))
      .on('Escape', () => this.expanded.set(false));

    if (!this.isEditable()) {
      manager
        .on(' ', e => this.keyboardEventRelay.set(e))
        .on(/^.$/, e => {
          this.keyboardEventRelay.set(e);
        });
    }

    return manager;
  });

  /** The pointerdown event manager for the combobox. */
  pointerdown = computed(() => {
    const manager = new PointerEventManager();

    if (this.isEditable()) return manager;

    manager.on(() => this.expanded.update(v => !v));

    return manager;
  });

  constructor(readonly inputs: SimpleComboboxInputs) {
    this.expanded = inputs.expanded;
    this.value = inputs.value;
  }

  /** Handles keydown events for the combobox. */
  onKeydown(event: KeyboardEvent) {
    if (!this.inputs.disabled()) {
      this.keydown().handle(event);
    }
  }

  /** Handles pointerdown events for the combobox. */
  onPointerdown(event: PointerEvent) {
    if (!this.disabled()) {
      this.pointerdown().handle(event);
    }
  }

  /** Handles focus in events for the combobox. */
  onFocusin() {
    this.isFocused.set(true);
  }

  /** Handles focus out events for the combobox. */
  onFocusout(event: FocusEvent) {
    const focusTarget = event.relatedTarget as Element | null;
    if (this.element().contains(focusTarget)) return;

    this.isFocused.set(false);
  }

  /** Handles input events for the combobox. */
  onInput(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) return;
    if (this.disabled()) return;

    this.expanded.set(true);
    this.value.set(event.target.value);
    this.isDeleting.set(event instanceof InputEvent && !!event.inputType.match(/^delete/));
  }

  /** Highlights the currently selected item in the combobox. */
  highlightEffect() {
    const value = this.value();
    const inlineSuggestion = this.inlineSuggestion();

    const isDeleting = untracked(() => this.isDeleting());
    const isFocused = untracked(() => this.isFocused());
    const isExpanded = untracked(() => this.expanded());

    if (!inlineSuggestion || !isFocused || !isExpanded || isDeleting) return;

    const inputEl = this.element() as HTMLInputElement;
    const isHighlightable = inlineSuggestion.toLowerCase().startsWith(value.toLowerCase());

    if (isHighlightable) {
      inputEl.value = value + inlineSuggestion.slice(value.length);
      inputEl.setSelectionRange(value.length, inlineSuggestion.length);
    }
  }

  /** Relays keyboard events to the popup. */
  keyboardEventRelayEffect() {
    const event = this.keyboardEventRelay();
    if (event === undefined) return;

    const popup = untracked(() => this.inputs.popup());
    const popupExpanded = untracked(() => this.expanded());
    if (popupExpanded) {
      popup?.controlTarget()?.dispatchEvent(event);
    }
  }

  /** Closes the popup when focus leaves the combobox and popup. */
  closePopupOnBlurEffect() {
    const expanded = this.expanded();
    const comboboxFocused = this.isFocused();
    const popupFocused = !!this.inputs.popup()?.isFocused();
    if (expanded && !comboboxFocused && !popupFocused) {
      this.expanded.set(false);
    }
  }
}

/** Represents the required inputs for a simple combobox popup. */
export interface SimpleComboboxPopupInputs {
  /** The type of the popup. */
  popupType: SignalLike<'listbox' | 'tree' | 'grid' | 'dialog'>;

  /** The element that serves as the control target for the popup. */
  controlTarget: SignalLike<HTMLElement | undefined>;

  /** The ID of the active descendant in the popup. */
  activeDescendant: SignalLike<string | undefined>;

  /** The ID of the popup. */
  popupId: SignalLike<string | undefined>;
}

/** Controls the state of a simple combobox popup. */
export class SimpleComboboxPopupPattern {
  /** The type of the popup. */
  readonly popupType = () => this.inputs.popupType();

  /** The element that serves as the control target for the popup. */
  readonly controlTarget = () => this.inputs.controlTarget();

  /** The ID of the active descendant in the popup. */
  readonly activeDescendant = () => this.inputs.activeDescendant();

  /** The ID of the popup. */
  readonly popupId = () => this.inputs.popupId();

  /** Whether the popup is focused. */
  readonly isFocused = signal(false);

  constructor(readonly inputs: SimpleComboboxPopupInputs) {}

  /** Handles focus in events for the popup. */
  onFocusin() {
    this.isFocused.set(true);
  }

  /** Handles focus out events for the popup. */
  onFocusout(event: FocusEvent) {
    const focusTarget = event.relatedTarget as Element | null;
    if (this.controlTarget()?.contains(focusTarget)) return;

    this.isFocused.set(false);
  }
}
