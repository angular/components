/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewContainerRef} from '@angular/core';

/**
 * Type for callout position, relative to the target element. 'start' and 'end'
 * refer to left and right in an LTR context and vice versa in an RTL context.
 */
export type FeatureHighlightCalloutPosition =
    'top_start'|'top_end'|'bottom_start'|'bottom_end';

/**
 * Configurations for enabling feature highlight with the FeatureHighlight
 * service.
 */
export class FeatureHighlightConfig<D = unknown> {
  /**
   * Determines where the callout is positioned relative to the target element.
   * Used only when isOuterCircleBounded is true.
   */
  readonly calloutPosition?: FeatureHighlightCalloutPosition = 'top_start';

  /**
   * Left value of the callout, relative to the target element. Used only when
   * isOuterCircleBounded is not true.
   */
  readonly calloutLeft?: string|number;

  /**
   * Top value of the callout, relative to the target element. Used only when
   * isOuterCircleBounded is not true.
   */
  readonly calloutTop?: string|number;

  /** Diameter for the inner circle. */
  readonly innerCircleDiameter?: string|number;

  /**
   * Diameter for the outer circle. If not set, the diameter will be auto
   * calculated based on the size and position of the callout.
   */
  readonly outerCircleDiameter?: string|number;

  /**
   * True if the outer circle is bounded by a parent element. False if feature
   * highlight is opened in an overlay on the screen.
   */
  readonly isOuterCircleBounded?: boolean;

  /**
   * View container ref for the target element. Used for creating a sibling
   * container element for the target.
   */
  readonly targetViewContainerRef!: ViewContainerRef;

  /** Data being used in the child components. */
  readonly data?: D;

  /**
   * ID of the element that describes the feature highlight container element.
   */
  readonly ariaDescribedBy?: string|null = null;

  /** Aria label to assign to the feature highlight container element. */
  readonly ariaLabel?: string|null = null;

  /** ID of the element that labels the feature highlight container element. */
  readonly ariaLabelledBy?: string|null = null;

  constructor(config?: FeatureHighlightConfig<D>) {
    if (config) {
      for (const k of Object.keys(config)) {
        const key = k as keyof FeatureHighlightConfig<D>;

        if (typeof config[key] !== 'undefined') {
          (this as any)[key] = config[key];
        }
      }
    }
  }
}
