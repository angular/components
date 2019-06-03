/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectFlags, InjectionToken, inject} from '@angular/core';
import {Location} from '@angular/common';
import {SubscriptionLike, Subscription} from 'rxjs';

/** Stream that signals whenever a navigation event has occurred. */
export interface NavigationSignal {
  subscribe(onNext: () => void): SubscriptionLike;
}

/** @docs-private */
export function defaultNavigationSignalFactory(): NavigationSignal {
  return inject(Location, InjectFlags.Optional) || {
    subscribe: () => Subscription.EMPTY
  };
}

/** Injection token that can be used to configure the stream that signals the navigation events. */
export const NAVIGATION_SIGNAL = new InjectionToken<NavigationSignal>('NAVIGATION_SIGNAL', {
  providedIn: 'root',
  factory: defaultNavigationSignalFactory
});
