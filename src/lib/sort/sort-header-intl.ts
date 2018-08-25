/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defineInjectable, Optional, SkipSelf} from '@angular/core';
import {Subject} from 'rxjs';


/**
 * To modify the labels and text displayed, create a new instance of MatSortHeaderIntl and
 * include it in a custom provider.
 * @dynamic
 */
export class MatSortHeaderIntl {
  // This is what the Angular compiler would generate for the @Injectable decorator. See #23917.
  /** @nocollapse */
  static ngInjectableDef = defineInjectable({
    providedIn: 'root',
    factory: () => new MatSortHeaderIntl(),
  });

  /**
   * Stream that emits whenever the labels here are changed. Use this to notify
   * components if the labels have changed after initialization.
   */
  readonly changes: Subject<void> = new Subject<void>();

  /** ARIA label for the sorting button. */
  sortButtonLabel = (id: string) => {
    return `Change sorting for ${id}`;
  };
}
/** @docs-private */
export function MAT_SORT_HEADER_INTL_PROVIDER_FACTORY(parentIntl: MatSortHeaderIntl) {
  return parentIntl || new MatSortHeaderIntl();
}

/** @docs-private */
export const MAT_SORT_HEADER_INTL_PROVIDER = {
  // If there is already an MatSortHeaderIntl available, use that. Otherwise, provide a new one.
  provide: MatSortHeaderIntl,
  deps: [[new Optional(), new SkipSelf(), MatSortHeaderIntl]],
  useFactory: MAT_SORT_HEADER_INTL_PROVIDER_FACTORY,
};

