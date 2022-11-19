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
  EventEmitter,
  inject,
  Input,
  NgZone,
  OnDestroy,
  Output,
} from '@angular/core';
import {SharedResizeObserver} from '../resize-observer';
import {Platform} from '@angular/cdk/platform';

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
      this.resized.emit();
    }
  }
  private _floating = false;

  @Input()
  get monitorResize() {
    return this._monitorResize;
  }
  set monitorResize(value: boolean) {
    this._monitorResize = value;
    if (this._monitorResize) {
      this._startResizeObserver();
    } else {
      this._stopResizeObserver();
    }
  }
  private _monitorResize = false;

  @Output() resized = new EventEmitter<void>();

  private _ngZone = inject(NgZone);

  private _platform = inject(Platform);

  private _resizeObserver = inject(SharedResizeObserver);

  private _stopResizeObserver = () => {};

  constructor(private _elementRef: ElementRef<HTMLElement>) {}

  ngOnDestroy() {
    this._stopResizeObserver();
  }

  /** Gets the width of the label. Used for the outline notch. */
  getWidth(): number {
    return estimateScrollWidth(this._elementRef.nativeElement);
  }

  /** Gets the HTML element for the floating label. */
  get element(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  private _startResizeObserver() {
    if (this._platform.isBrowser) {
      this._stopResizeObserver();
      this._stopResizeObserver = this._ngZone.runOutsideAngular(() =>
        this._resizeObserver.observe(this._elementRef.nativeElement, () => this.resized.emit(), {
          box: 'border-box',
        }),
      );
    }
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
