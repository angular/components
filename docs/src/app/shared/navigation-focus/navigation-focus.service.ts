/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, OnDestroy, inject} from '@angular/core';
import {Event, NavigationEnd, Router} from '@angular/router';
import {filter, skip} from 'rxjs/operators';
import {Subscription} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationFocusService implements OnDestroy {
  private _router = inject(Router);
  private _subscriptions = new Subscription();
  private _navigationFocusRequests: HTMLElement[] = [];
  private _skipLinkFocusRequests: HTMLElement[] = [];
  private _skipLinkHref: string | null | undefined;

  readonly navigationEndEvents = this._router.events.pipe(
    filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd),
  );
  readonly softNavigations = this.navigationEndEvents.pipe(skip(1));

  constructor() {
    this._subscriptions.add(
      this.softNavigations.subscribe(() => {
        // focus if url does not have fragment
        if (!this._router.url.split('#')[1]) {
          setTimeout(() => {
            if (this._navigationFocusRequests.length) {
              this._navigationFocusRequests[this._navigationFocusRequests.length - 1].focus({
                preventScroll: true,
              });
            }
          }, 100);
        }
      }),
    );
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  requestFocusOnNavigation(el: HTMLElement) {
    this._navigationFocusRequests.push(el);
  }

  relinquishFocusOnNavigation(el: HTMLElement) {
    this._navigationFocusRequests.splice(this._navigationFocusRequests.indexOf(el), 1);
  }

  requestSkipLinkFocus(el: HTMLElement) {
    this._skipLinkFocusRequests.push(el);
    this.setSkipLinkHref(el);
  }

  relinquishSkipLinkFocus(el: HTMLElement) {
    this._skipLinkFocusRequests.splice(this._skipLinkFocusRequests.indexOf(el), 1);
    const skipLinkFocusTarget = this._skipLinkFocusRequests[this._skipLinkFocusRequests.length - 1];
    this.setSkipLinkHref(skipLinkFocusTarget);
  }

  setSkipLinkHref(el: HTMLElement | null) {
    const baseUrl = this._router.url.split('#')[0];
    this._skipLinkHref = el ? `${baseUrl}#${el.id}` : null;
  }

  getSkipLinkHref(): string | null | undefined {
    return this._skipLinkHref;
  }

  isNavigationWithinComponentView(previousUrl: string, newUrl: string) {
    const componentViewExpression = /(components|cdk)\/([^\/]+)/;

    const previousUrlMatch = previousUrl.match(componentViewExpression);
    const newUrlMatch = newUrl.match(componentViewExpression);

    return (
      previousUrl &&
      newUrl &&
      previousUrlMatch &&
      newUrlMatch &&
      previousUrlMatch[0] === newUrlMatch[0] &&
      previousUrlMatch[1] === newUrlMatch[1]
    );
  }
}
