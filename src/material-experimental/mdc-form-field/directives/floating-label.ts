/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Input} from '@angular/core';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {ponyfill} from '@material/dom';

/**
 * Internal directive that maintains a MDC floating label. This directive does not
 * use the `MDCFloatingLabelFoundation` class, as it is not worth the size cost of
 * including it just to measure the label width and toggle some classes.
 *
 * The use of a directive allows us to conditionally render a floating label in the
 * template without having to manually manage instantiation and destruction of the
 * floating label component based on.
 *
 * The component is responsible for setting up the floating label styles, measuring label
 * width for the outline notch, and providing inputs that can be used to toggle the
 * label's floating or required state.
 */
@Directive({
  selector: 'label[matFormFieldFloatingLabel]',
  host: {
    'class': 'mdc-floating-label',
    '[class.mdc-floating-label--required]': 'required',
    '[class.mdc-floating-label--float-above]': 'floating',
  },
})
export class MatFormFieldFloatingLabel {
  private _floating = false;
  private _required = false;

  /** Whether the label is floating. */
  @Input()
  get floating(): boolean { return this._floating; }
  set floating(value: boolean) { this._floating = coerceBooleanProperty(value); }

  /** Whether the label is required. */
  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) { this._required = coerceBooleanProperty(value); }

  /** Gets the HTML element for the floating label. */
  get element(): HTMLElement { return this._elementRef.nativeElement; }

  constructor(private _elementRef: ElementRef) {}

  /** Gets the width of the label. Used for the outline notch. */
  getWidth(): number {
    return ponyfill.estimateScrollWidth(this._elementRef.nativeElement);
  }

  static ngAcceptInputType_floating: BooleanInput;
  static ngAcceptInputType_required: BooleanInput;
}
