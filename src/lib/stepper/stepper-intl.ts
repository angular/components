/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defineInjectable} from '@angular/core';
import {Subject} from 'rxjs';


/**
  * Stepper data that is required for internationalization.
  * @dynamic
  */
export class MatStepperIntl {
  // This is what the Angular compiler would generate for the @Injectable decorator. See #23917.
  /** @nocollapse */
  static ngInjectableDef = defineInjectable({
    providedIn: 'root',
    factory: () => new MatStepperIntl(),
  });

  /**
   * Stream that emits whenever the labels here are changed. Use this to notify
   * components if the labels have changed after initialization.
   */
  readonly changes: Subject<void> = new Subject<void>();

  /** Label that is rendered below optional steps. */
  optionalLabel: string = 'Optional';
}
