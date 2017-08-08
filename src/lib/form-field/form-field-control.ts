/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {NgControl} from '@angular/forms';


/** An interface which allows a control to work inside of a `MdFormField`. */
export abstract class MdFormFieldControl {
  /**
   * Stream that emits whenever the state of the control changes such that the parent `MdFormField`
   * needs to run change detection.
   */
  stateChanges: Observable<void>;

  /** The value of the control. */
  value: any;

  /** Gets the element ID for this control. */
  abstract getId(): string;

  /** Gets the placeholder for this control. */
  abstract getPlaceholder(): string;

  /** Gets the NgControl for this control. */
  abstract getNgControl(): NgControl | null;

  /** Whether the control is focused. */
  abstract isFocused(): boolean;

  /** Whether the control is empty. */
  abstract isEmpty(): boolean;

  /** Whether the control is required. */
  abstract isRequired(): boolean;

  /** Whether the control is disabled. */
  abstract isDisabled(): boolean;

  /** Whether the control is in an error state. */
  abstract isErrorState(): boolean;

  /** Sets the list of element IDs that currently describe this control. */
  abstract setDescribedByIds(ids: string[]): void;

  /** Focuses this control. */
  abstract focus(): void;
}
