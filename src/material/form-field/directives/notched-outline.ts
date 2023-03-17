/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, Input, NgZone, ViewEncapsulation} from '@angular/core';

import {MatFormFieldFloatingLabel} from './floating-label';

/**
 * Internal component that creates an instance of the MDC notched-outline component.
 *
 * The component sets up the HTML structure and styles for the notched-outline. It provides
 * inputs to toggle the notch state and width.
 */
@Component({
  selector: 'div[matFormFieldNotchedOutline]',
  templateUrl: './notched-outline.html',
  host: {
    'class': 'mdc-notched-outline',
    // Besides updating the notch state through the MDC component, we toggle
    // this class through a host binding in order to ensure that the
    // notched-outline renders correctly on the server.
    '[class.mdc-notched-outline--notched]': 'open',
    '[class.mdc-notched-outline--upgraded]': 'label != null',
    '[class.mdc-notched-outline--no-label]': 'label == null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatFormFieldNotchedOutline {
  _label: MatFormFieldFloatingLabel | undefined;

  get label() {
    return this._label;
  }
  /** Label element */
  @Input('matFormFieldNotchedOutlineLabel')
  set label(value: MatFormFieldFloatingLabel | undefined) {
    this._label = value;
    const label = this.label?.element;
    if (label && typeof requestAnimationFrame === 'function') {
      label.style.transitionDuration = '0s';
      this._ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => (label.style.transitionDuration = ''));
      });
    }
  }

  /** Width of the label (original scale) */
  @Input('matFormFieldNotchedOutlineLabelWidth') labelWidth: number = 0;

  /** Whether the notch should be opened. */
  @Input('matFormFieldNotchedOutlineOpen') open: boolean = false;

  constructor(private _ngZone: NgZone) {}

  _getNotchWidth(open: boolean, labelWidth: number) {
    if (open) {
      const NOTCH_ELEMENT_PADDING = 8;
      const NOTCH_ELEMENT_BORDER = 1;
      return labelWidth > 0
        ? `calc(${labelWidth}px * var(--mat-mdc-form-field-floating-label-scale, 0.75) + ${
            NOTCH_ELEMENT_PADDING + NOTCH_ELEMENT_BORDER
          }px)`
        : '0px';
    }

    return null;
  }
}
