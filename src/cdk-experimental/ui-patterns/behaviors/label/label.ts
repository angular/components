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

  /** The default `aria-describedby` ids. */
  defaultDescribedBy: SignalLike<string[]>;
}

/** Represents the optional inputs for the label control. */
export interface LabelControlOptionalInputs {
  /** The `aria-label`. */
  label?: SignalLike<string | undefined>;

  /** The user-provided `aria-labelledby` ids. */
  labelledBy?: SignalLike<string[]>;

  /** Whether the user-provided `aria-labelledby` should be appended to the default. */
  labelledByAppend?: SignalLike<boolean>;

  /** The user-provided `aria-describedby` ids. */
  describedBy?: SignalLike<string[]>;

  /** Whether the user-provided `aria-describedby` should be appended to the default. */
  describedByAppend?: SignalLike<boolean>;
}

/** Controls label and description of an element. */
export class LabelControl {
  /** The `aria-label`. */
  readonly label = computed(() => this.inputs.label?.());

  /** The `aria-labelledby` ids. */
  readonly labelledBy = computed(() => {
    // If an aria-label is provided by developers, do not set aria-labelledby because
    // if both attributes are set, aria-labelledby will be used.
    const label = this.label();
    if (label) {
      return [];
    }

    const defaultLabelledBy = this.inputs.defaultLabelledBy();
    const labelledBy = this.inputs.labelledBy?.();
    const labelledByAppend = this.inputs.labelledByAppend?.();

    if (!labelledBy || labelledBy.length === 0) {
      return defaultLabelledBy;
    }

    if (labelledByAppend) {
      return [...defaultLabelledBy, ...labelledBy];
    }

    return labelledBy;
  });

  /** The `aria-describedby` ids. */
  readonly describedBy = computed(() => {
    const defaultDescribedBy = this.inputs.defaultDescribedBy();
    const describedBy = this.inputs.describedBy?.();
    const describedByAppend = this.inputs.describedByAppend?.();

    if (!describedBy || describedBy.length === 0) {
      return defaultDescribedBy;
    }

    if (describedByAppend) {
      return [...defaultDescribedBy, ...describedBy];
    }

    return describedBy;
  });

  constructor(readonly inputs: LabelControlInputs & LabelControlOptionalInputs) {}
}
