/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {KeyboardEventManager} from '../behaviors/event-manager/keyboard-event-manager';
import {PointerEventManager} from '../behaviors/event-manager/pointer-event-manager';
import {computed, SignalLike, WritableSignalLike} from '../behaviors/signal-like/signal-like';

/** Represents the required inputs for the DisclosurePattern. */
export interface DisclosureInputs {
  /** A unique identifier for the disclosure trigger. */
  id: SignalLike<string>;

  /** A reference to the trigger element. */
  element: SignalLike<HTMLElement | undefined>;

  /** Whether the disclosure content is expanded. */
  expanded: WritableSignalLike<boolean>;

  /** Whether the disclosure trigger is disabled. */
  disabled: SignalLike<boolean>;

  /** Whether the disclosure is always expanded and cannot be closed. */
  alwaysExpanded: SignalLike<boolean>;

  /** The ID of the controlled content element. */
  controls: SignalLike<string | undefined>;
}

/**
 * A pattern that controls the expansion state of a disclosure widget.
 *
 * A disclosure is a widget that enables content to be either collapsed (hidden)
 * or expanded (visible). It has a button that controls visibility of the content.
 */
export class DisclosurePattern {
  /** The unique identifier for this disclosure trigger. */
  readonly id: SignalLike<string>;

  /** A reference to the trigger element. */
  readonly element: SignalLike<HTMLElement | undefined>;

  /** Whether the disclosure content is expanded. */
  readonly expanded: WritableSignalLike<boolean>;

  /** Whether the disclosure trigger is disabled. */
  readonly disabled: SignalLike<boolean>;

  /** Whether the disclosure is always expanded and cannot be closed. */
  readonly alwaysExpanded: SignalLike<boolean>;

  /** The ID of the controlled content element. */
  readonly controls: SignalLike<string | undefined>;

  /** The tabindex for the trigger. */
  readonly tabIndex = computed(() => (this.disabled() ? -1 : 0));

  /** The keydown event manager for the disclosure trigger. */
  readonly keydown = computed(() => {
    return new KeyboardEventManager().on('Enter', () => this.toggle()).on(' ', () => this.toggle());
  });

  /** The pointerdown event manager for the disclosure trigger. */
  readonly pointerdown = computed(() => {
    return new PointerEventManager().on(() => this.toggle());
  });

  constructor(readonly inputs: DisclosureInputs) {
    this.id = inputs.id;
    this.element = inputs.element;
    this.expanded = inputs.expanded;
    this.disabled = inputs.disabled;
    this.alwaysExpanded = inputs.alwaysExpanded;
    this.controls = inputs.controls;
  }

  /** Checks that the internal state of the pattern is valid. */
  validate(): string[] {
    const errors: string[] = [];

    if (this.alwaysExpanded() && !this.expanded()) {
      errors.push('Disclosure: alwaysExpanded is true but expanded is false.');
    }

    return errors;
  }

  /** Sets the default initial state of the disclosure. */
  setDefaultState(): void {
    if (this.alwaysExpanded() && !this.expanded()) {
      this.expanded.set(true);
    }
  }

  /** Handles keydown events for the disclosure trigger. */
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    this.keydown().handle(event);
  }

  /** Handles pointer events for the disclosure trigger. */
  onPointerdown(event: PointerEvent): void {
    if (this.disabled()) return;
    this.pointerdown().handle(event);
  }

  /** Opens the disclosure content. */
  open(): void {
    if (this.disabled()) return;
    this.expanded.set(true);
  }

  /** Closes the disclosure content if not always expanded. */
  close(): void {
    if (this.disabled()) return;
    if (this.alwaysExpanded()) return;
    this.expanded.set(false);
  }
  /** Toggles the disclosure content visibility. */
  toggle(): void {
    if (this.disabled()) return;

    if (this.expanded()) {
      this.close();
    } else {
      this.open();
    }
  }
}
