/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, OnInit, Optional} from '@angular/core';

import {FeatureHighlight} from './feature-highlight';
import {FeatureHighlightRef} from './feature-highlight-ref';

/**
 * Target featured element to be highlighted. Use it to style the z-index and
 * position correctly so that the target element is displayed on top of other
 * feature highlight elements.
 */
@Directive({
  selector: `[feature-highlight-target],
       [featureHighlightTarget],
       feature-highlight-target`,
  exportAs: 'featureHighlightTarget',
  host: {
    '[style.zIndex]': 'zIndex',
    '[style.position]': 'position',
  },
})
export class FeatureHighlightTarget {
  @Input() featureHighlightEnabled = true;

  /**
   * Return the zIndex value for the target element. When outer circle is not
   * bounded, zIndex of the target element needs to be 1001 as the overlay
   * container has zIndex of 1000. When outer circle is bounded, zIndex only
   * needs to be 3.
   */
  get zIndex(): string|null {
    return this.featureHighlightEnabled ? '1001' : null;
  }

  /**
   * Return the position value for the target element. This is a key hack to
   * make sure that our target element shows above the inner circle, as z-index
   * only works for non static positioned elements.
   */
  get position(): string|null {
    return this.featureHighlightEnabled ? 'relative' : null;
  }
}

/** Button that closes the feature highlight. */
@Directive({
  selector: 'button[feature-highlight-close], button[featureHighlightClose]',
  exportAs: 'featureHighlightClose',
  host: {
    '(click)': 'featureHighlightRef.dismiss()',
    'type': 'button',
  }
})
export class FeatureHighlightClose implements OnInit {
  constructor(
      @Optional() private _featureHighlightRef: FeatureHighlightRef,
      private readonly _featureHighlight: FeatureHighlight) {}


  ngOnInit() {
    this._featureHighlightRef = this._featureHighlightRef ||
        this._featureHighlight.getFeatureHighlightRef();
  }
}

/**
 * Title of the feature highlight. Use it to assign aria-labelledby attribute
 * to the container element.
 */
@Directive({
  selector: `[feature-highlight-title],
       [featureHighlightTitle],
       feature-highlight-title`,
  exportAs: 'featureHighlightTitle',
  host: {
    'class': 'feature-highlight-title',
    '[id]': 'id',
  },
})
export class FeatureHighlightTitle implements OnInit {
  @Input() id: string|null = 'feature-highlight-title-id';

  constructor(
      @Optional() private readonly _featureHighlightRef: FeatureHighlightRef,
      private readonly _featureHighlight: FeatureHighlight) {}


  ngOnInit() {
    const ref = this._featureHighlightRef ||
        this._featureHighlight.getFeatureHighlightRef();

    if (ref) {
      // Use Promise.resolve() to avoid setting aria attributes multile times
      // in the same life cycle hook.
      Promise.resolve().then(() => {
        ref.containerInstance.updateConfig({ariaLabelledBy: this.id});
      });
    }
  }
}

/**
 * Content of the feature highlight. Use it to assign aria-describedby attribute
 * to the container element.
 */
@Directive({
  selector: `[feature-highlight-content],
       [featureHighlightContent],
       feature-highlight-content`,
  host: {
    'class': 'feature-highlight-content',
    '[id]': 'id',
  },
})
export class FeatureHighlightContent implements OnInit {
  @Input() id: string|null = 'feature-highlight-content-id';

  constructor(
      @Optional() private readonly _featureHighlightRef: FeatureHighlightRef,
      private readonly _featureHighlight: FeatureHighlight) {}

  /** @override */
  ngOnInit() {
    const ref = this._featureHighlightRef ||
        this._featureHighlight.getFeatureHighlightRef();
    if (ref) {
      // Use Promise.resolve() to avoid setting aria attributes multile times
      // in the same life cycle hook.
      Promise.resolve().then(() => {
        ref.containerInstance.updateConfig({ariaDescribedBy: this.id});
      });
    }
  }
}
