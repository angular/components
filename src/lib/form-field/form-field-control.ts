/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs';
import {NgControl} from '@angular/forms';


/** An interface which allows a control to work inside of a `MatFormField`. */
export abstract class MatFormFieldControl<T> {
  /** The value of the control. */
  value: T | null = null;

  /**
   * Stream that emits whenever the state of the control changes such that the parent `MatFormField`
   * needs to run change detection.
   */
  readonly stateChanges!: Observable<void>;

  /** The element ID for this control. */
  readonly id!: string;

  /** The placeholder for this control. */
  readonly placeholder: string = '';

  /** Gets the NgControl for this control. */
  readonly ngControl: NgControl | null = null;

  /** Whether the control is focused. */
  readonly focused: boolean = false;

  /** Whether the control is empty. */
  readonly empty: boolean = false;

  /** Whether the `MatFormField` label should try to float. */
  readonly shouldLabelFloat: boolean = true;

  /** Whether the control is required. */
  readonly required: boolean = false;

  /** Whether the control is disabled. */
  readonly disabled: boolean = false;

  /** Whether the control is in an error state. */
  readonly errorState: boolean = false;

  /**
   * An optional name for the control type that can be used to distinguish `mat-form-field` elements
   * based on their control type. The form field will add a class,
   * `mat-form-field-type-{{controlType}}` to its root element.
   */
  readonly controlType?: string;

  /**
   * Whether the input is currently in an autofilled state. If property is not present on the
   * control it is assumed to be false.
   */
  readonly autofilled?: boolean;

  /** Sets the list of element IDs that currently describe this control. */
  abstract setDescribedByIds(ids: string[]): void;

  /** Handles a click on the control's container. */
  abstract onContainerClick(event: MouseEvent): void;
}
