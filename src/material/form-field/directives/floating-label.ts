/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  ElementRef,
  inject,
  Input,
  NgZone,
  OnDestroy,
  InjectionToken,
} from '@angular/core';
import {SharedResizeObserver} from '@angular/cdk/observers/private';
import {Subscription} from 'rxjs';

/** An interface that the parent form-field should implement to receive resize events. */
export interface FloatingLabelParent {
  _handleLabelResized(): void;
}

/** An injion token for the parent form-field. */
export const FLOATING_LABEL_PARENT = new InjectionToken<FloatingLabelParent>('FloatingLabelParent');

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
    'class': 'mdc-floating-label mat-mdc-floating-label',
    '[class.mdc-floating-label--float-above]': 'floating',
  },
})
export class MatFormFieldFloatingLabel implements OnDestroy {
  /** Whether the label is floating. */
  @Input()
  get floating() {
    return this._floating;
  }
  set floating(value: boolean) {
    this._floating = value;
    if (this.monitorResize) {
      this._handleResize();
    }
  }
  private _floating = false;

  /** Whether to monitor for resize events on the floating label. */
  @Input()
  get monitorResize() {
    return this._monitorResize;
  }
  set monitorResize(value: boolean) {
    this._monitorResize = value;
    if (this._monitorResize) {
      this._subscribeToResize();
    } else {
      this._resizeSubscription.unsubscribe();
    }
  }
  private _monitorResize = false;

  /** The shared ResizeObserver. */
  private _resizeObserver = inject(SharedResizeObserver);

  /** The Angular zone. */
  private _ngZone = inject(NgZone);

  /** The parent form-field. */
  private _parent = inject(FLOATING_LABEL_PARENT);

  /** The current resize event subscription. */
  private _resizeSubscription = new Subscription();

  constructor(private _elementRef: ElementRef<HTMLElement>) {}

  ngOnDestroy() {
    this._resizeSubscription.unsubscribe();
  }

  /** Gets the width of the label. Used for the outline notch. */
  getWidth(): number {
    return estimateScrollWidth(this._elementRef.nativeElement);
  }

  /** Gets the HTML element for the floating label. */
  get element(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /** Handles resize events from the ResizeObserver. */
  private _handleResize() {
    // In the case where the label grows in size, the following sequence of events occurs:
    // 1. The label grows by 1px triggering the ResizeObserver
    // 2. The notch is expanded to accommodate the entire label
    // 3. The label expands to its full width, triggering the ResizeObserver again
    //
    // This is expected, but If we allow this to all happen within the same macro task it causes an
    // error: `ResizeObserver loop limit exceeded`. Therefore we push the notch resize out until
    // the next macro task.
    setTimeout(() => this._parent._handleLabelResized());
  }

  /** Subscribes to resize events. */
  private _subscribeToResize() {
    this._resizeSubscription.unsubscribe();
    this._ngZone.runOutsideAngular(() => {
      this._resizeSubscription = this._resizeObserver
        .observe(this._elementRef.nativeElement, {box: 'border-box'})
        .subscribe(() => this._handleResize());
    });
  }
}

/**
 * Estimates the scroll width of an element.
 * via https://github.com/material-components/material-components-web/blob/c0a11ef0d000a098fd0c372be8f12d6a99302855/packages/mdc-dom/ponyfill.ts
 */
function estimateScrollWidth(element: HTMLElement): number {
  // Check the offsetParent. If the element inherits display: none from any
  // parent, the offsetParent property will be null (see
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent).
  // This check ensures we only clone the node when necessary.
  const htmlEl = element as HTMLElement;
  if (htmlEl.offsetParent !== null) {
    return htmlEl.scrollWidth;
  }

  const clone = htmlEl.cloneNode(true) as HTMLElement;
  clone.style.setProperty('position', 'absolute');
  clone.style.setProperty('transform', 'translate(-9999px, -9999px)');
  document.documentElement.appendChild(clone);
  const scrollWidth = clone.scrollWidth;
  clone.remove();
  return scrollWidth;
}
