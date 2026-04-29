/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {computed, SignalLike} from '../signal-like/signal-like';

/** The required inputs for the label control. */
export interface LabelControlInputs {
  /** The default `aria-labelledby` id to use if no other inputs specified. */
  defaultLabelledBy: SignalLike<string | undefined>;

  /** The `aria-label` to use instead of the default id. */
  label: SignalLike<string | undefined>;

  /** The `aria-labelledby` id(s) to use instead of the default id (or label). */
  labelledBy: SignalLike<string[] | undefined>;
}

/** Controls label for an element. */
export class LabelControl {
  /** Use this value to set the `aria-label` attribute on the element. */
  readonly label = computed(() => this.inputs.label());

  /** Use this value to set the `aria-labelledby` attribute on the element. */
  readonly labelledBy = computed(() => {
    const defaultLabelledBy = this.inputs.defaultLabelledBy();
    const label = this.label();
    const labelledBy = this.inputs.labelledBy();

    // Always use any specified labelledby ids.
    if (labelledBy && labelledBy.length > 0) {
      return labelledBy.join(' ');
    }

    // If an aria-label is provided, do not set aria-labelledby with the defaultLabelledBy value
    // because if both attributes are set, aria-labelledby will be used.
    if (!label && defaultLabelledBy) {
      return defaultLabelledBy;
    }

    return undefined;
  });

  constructor(readonly inputs: LabelControlInputs) {}
}
