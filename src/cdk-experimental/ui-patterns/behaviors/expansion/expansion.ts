/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {computed} from '@angular/core';
import {SignalLike} from '../signal-like/signal-like';

/** Inputs for an Expansion control. */
export interface ExpansionControlInputs {
  /** Whether an Expansion is visible. */
  visible: SignalLike<boolean>;

  /** The controlled Expansion panel. */
  expansionPanel: SignalLike<ExpansionPanel | undefined>;
}

/** Inputs for an Expansion panel. */
export interface ExpansionPanelInputs {
  /** A unique identifier for the panel. */
  id: SignalLike<string>;

  /** The Expansion control. */
  expansionControl: SignalLike<ExpansionControl | undefined>;
}

/**
 * An Expansion control.
 *
 * Use Expansion behavior if a pattern has a collapsible view that has two elements rely on the
 * states from each other. For example
 *
 * ```html
 * <button aria-controls="remote-content" aria-expanded="false">Toggle Content</button>
 *
 * ...
 *
 * <div id="remote-content" aria-hidden="true">
 *  Collapsible content
 * </div>
 * ```
 */
export class ExpansionControl {
  /** Whether an Expansion is visible. */
  visible: SignalLike<boolean>;

  /** The controllerd Expansion panel Id. */
  controls = computed(() => this.inputs.expansionPanel()?.id());

  constructor(readonly inputs: ExpansionControlInputs) {
    this.visible = inputs.visible;
  }
}

/** A Expansion panel. */
export class ExpansionPanel {
  /** A unique identifier for the panel. */
  id: SignalLike<string>;

  /** Whether the panel is hidden. */
  hidden = computed(() => !this.inputs.expansionControl()?.visible());

  constructor(readonly inputs: ExpansionPanelInputs) {
    this.id = inputs.id;
  }
}
