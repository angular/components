/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, NgZone, OnDestroy, Renderer2, inject} from '@angular/core';

/** Class added when the line ripple is active. */
const ACTIVATE_CLASS = 'mdc-line-ripple--active';

/** Class added when the line ripple is being deactivated. */
const DEACTIVATING_CLASS = 'mdc-line-ripple--deactivating';

/**
 * Internal directive that creates an instance of the MDC line-ripple component. Using a
 * directive allows us to conditionally render a line-ripple in the template without having
 * to manually create and destroy the `MDCLineRipple` component whenever the condition changes.
 *
 * The directive sets up the styles for the line-ripple and provides an API for activating
 * and deactivating the line-ripple.
 */
@Directive({
  selector: 'div[matFormFieldLineRipple]',
  host: {
    'class': 'mdc-line-ripple',
  },
})
export class MatFormFieldLineRipple implements OnDestroy {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _cleanupTransitionEnd: () => void;

  constructor(...args: unknown[]);

  constructor() {
    const ngZone = inject(NgZone);
    const renderer = inject(Renderer2);

    ngZone.runOutsideAngular(() => {
      this._cleanupTransitionEnd = renderer.listen(
        this._elementRef.nativeElement,
        'transitionend',
        this._handleTransitionEnd,
      );
    });
  }

  activate() {
    const classList = this._elementRef.nativeElement.classList;
    classList.remove(DEACTIVATING_CLASS);
    classList.add(ACTIVATE_CLASS);
  }

  deactivate() {
    this._elementRef.nativeElement.classList.add(DEACTIVATING_CLASS);
  }

  private _handleTransitionEnd = (event: TransitionEvent) => {
    const classList = this._elementRef.nativeElement.classList;
    const isDeactivating = classList.contains(DEACTIVATING_CLASS);

    if (event.propertyName === 'opacity' && isDeactivating) {
      classList.remove(ACTIVATE_CLASS, DEACTIVATING_CLASS);
    }
  };

  ngOnDestroy() {
    this._cleanupTransitionEnd();
  }
}
