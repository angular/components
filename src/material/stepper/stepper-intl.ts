/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

/** Stepper data that is required for internationalization. */
@Injectable({providedIn: 'root'})
export class MatStepperIntl {
  /**
   * Stream that emits whenever the labels here are changed. Use this to notify
   * components if the labels have changed after initialization.
   */
  readonly changes: Subject<void> = new Subject<void>();

  /** Label that is rendered below optional steps. */
  optionalLabel: string = 'Optional';

  /** Label that is used to indicate step as completed to screen readers. */
  completedLabel: string = 'Completed';

  /** Label that is used to indicate step as editable to screen readers. */
  editableLabel: string = 'Editable';
}
