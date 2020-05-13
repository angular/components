/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs';
import {NgControl} from '@angular/forms';
import {Directive} from '@angular/core';


/** An interface which allows a control to work inside of a `MatFormField`. */
@Directive()
export abstract class MatFormFieldControl<T> {
  /** The value of the control. */
  // TODO(issue/13329): Attempt to remove "!".
  value!: T | null;

  /**
   * Stream that emits whenever the state of the control changes such that the parent `MatFormField`
   * needs to run change detection.
   */
  // TODO(issue/13329): Attempt to remove "!".
  readonly stateChanges!: Observable<void>;

  /** The element ID for this control. */
  // TODO(issue/13329): Attempt to remove "!".
  readonly id!: string;

  /** The placeholder for this control. */
  // TODO(issue/13329): Attempt to remove "!".
  readonly placeholder!: string;

  /** Gets the NgControl for this control. */
  // TODO(issue/13329): Attempt to remove "!".
  readonly ngControl!: NgControl | null;

  /** Whether the control is focused. */
  // TODO(issue/13329): Attempt to remove "!".
  readonly focused!: boolean;

  /** Whether the control is empty. */
  // TODO(issue/13329): Attempt to remove "!".
  readonly empty!: boolean;

  /** Whether the `MatFormField` label should try to float. */
  // TODO(issue/13329): Attempt to remove "!".
  readonly shouldLabelFloat!: boolean;

  /** Whether the control is required. */
  // TODO(issue/13329): Attempt to remove "!".
  readonly required!: boolean;

  /** Whether the control is disabled. */
  // TODO(issue/13329): Attempt to remove "!".
  readonly disabled!: boolean;

  /** Whether the control is in an error state. */
  // TODO(issue/13329): Attempt to remove "!".
  readonly errorState!: boolean;

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
