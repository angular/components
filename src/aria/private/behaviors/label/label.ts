/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {computed} from '@angular/core';
import {SignalLike} from '../signal-like/signal-like';

/** Represents the required inputs for the label control. */
export interface LabelControlInputs {
  /** The default `aria-labelledby` ids. */
  defaultLabelledBy: SignalLike<string[]>;
}

/** Represents the optional inputs for the label control. */
export interface LabelControlOptionalInputs {
  /** The `aria-label`. */
  label?: SignalLike<string | undefined>;

  /** The user-provided `aria-labelledby` ids. */
  labelledBy?: SignalLike<string[]>;
}

/** Controls label and description of an element. */
export class LabelControl {
  /** The `aria-label`. */
  readonly label = computed(() => this.inputs.label?.());

  /** The `aria-labelledby` ids. */
  readonly labelledBy = computed(() => {
    const label = this.label();
    const labelledBy = this.inputs.labelledBy?.();
    const defaultLabelledBy = this.inputs.defaultLabelledBy();

    if (labelledBy && labelledBy.length > 0) {
      return labelledBy;
    }

    // If an aria-label is provided by developers, do not set aria-labelledby with the
    // defaultLabelledBy value because if both attributes are set, aria-labelledby will be used.
    if (label) {
      return [];
    }

    return defaultLabelledBy;
  });

  constructor(readonly inputs: LabelControlInputs & LabelControlOptionalInputs) {}
}
