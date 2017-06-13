/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  EventEmitter,
  Injectable,
  Optional,
  SkipSelf
} from '@angular/core';

export type Direction = 'ltr' | 'rtl';

/**
 * The directionality (LTR / RTL) context for the application (or a subtree of it).
 * Exposes the current direction and a stream of direction changes.
 */
@Injectable()
export class Directionality {
  value: Direction = 'ltr';
  public change = new EventEmitter<void>();

  constructor() {
    if (typeof document === 'object' && !!document) {
      // TODO: handle 'auto' value -
      // We still need to account for dir="auto".
      // It looks like HTMLElemenet.dir is also "auto" when that's set to the attribute,
      // but getComputedStyle return either "ltr" or "rtl". avoiding getComputedStyle for now
      // though, we're already calling it for the theming check.
      this.value = (document.body.dir || document.documentElement.dir || 'ltr') as Direction;
    }
  }
}

export function DIRECTIONALITY_PROVIDER_FACTORY(parentDirectionality) {
  return parentDirectionality || new Directionality();
}

export const DIRECTIONALITY_PROVIDER = {
  // If there is already a Directionality available, use that. Otherwise, provide a new one.
  provide: Directionality,
  deps: [[new Optional(), new SkipSelf(), Directionality]],
  useFactory: DIRECTIONALITY_PROVIDER_FACTORY
};
