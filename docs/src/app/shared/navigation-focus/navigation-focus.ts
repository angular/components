/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, OnDestroy, inject} from '@angular/core';
import {NavigationFocusService} from './navigation-focus.service';

let uid = 0;
@Directive({
  selector: '[focusOnNavigation]',
  host: {
    'tabindex': '-1',
    '[style.outline]': '"none"',
  },
})
export class NavigationFocus implements OnDestroy {
  private _element: HTMLElement;
  private _navigationFocusService = inject(NavigationFocusService);

  constructor() {
    const element = (this._element = inject(ElementRef).nativeElement as HTMLElement);

    if (!element.id) {
      element.id = `skip-link-target-${uid++}`;
    }
    this._navigationFocusService.requestFocusOnNavigation(element);
    this._navigationFocusService.requestSkipLinkFocus(element);
  }

  ngOnDestroy() {
    this._navigationFocusService.relinquishFocusOnNavigation(this._element);
    this._navigationFocusService.relinquishSkipLinkFocus(this._element);
  }
}
