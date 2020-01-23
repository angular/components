/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  Optional,
  OnDestroy,
  ContentChild,
  AfterContentInit,
  ChangeDetectorRef,
  Self,
} from '@angular/core';
import {MatFormFieldControl, MatFormField} from '@angular/material/form-field';
import {DateRange, MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER} from '@angular/material/core';
import {NgControl, ControlContainer} from '@angular/forms';
import {Subject} from 'rxjs';
import {coerceBooleanProperty, BooleanInput} from '@angular/cdk/coercion';
import {
  MatStartDate,
  MatEndDate,
  MatDateRangeInputParent,
  MAT_DATE_RANGE_INPUT_PARENT,
} from './date-range-input-parts';

let nextUniqueId = 0;

// TODO(crisbeto): when adding live examples, should how to use with `FormGroup`.

@Component({
  selector: 'mat-date-range-input',
  templateUrl: 'date-range-input.html',
  styleUrls: ['date-range-input.css'],
  exportAs: 'matDateRangeInput',
  host: {
    'class': 'mat-date-range-input',
    '[class.mat-date-range-input-hide-placeholders]': '_shouldHidePlaceholders()',
    '[attr.id]': 'null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {provide: MatFormFieldControl, useExisting: MatDateRangeInput},
    {provide: MAT_DATE_RANGE_INPUT_PARENT, useExisting: MatDateRangeInput},

    // TODO(crisbeto): this will be provided by the datepicker eventually.
    // We provide it here for the moment so we have something to test against.
    MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER,
  ]
})
export class MatDateRangeInput<D> implements MatFormFieldControl<DateRange<D>>,
  MatDateRangeInputParent, AfterContentInit, OnDestroy {
  /** Current value of the range input. */
  value: DateRange<D> | null = null;

  /** Emits when the input's state has changed. */
  stateChanges = new Subject<void>();

  /** Unique ID for the input. */
  id = `mat-date-range-input-${nextUniqueId++}`;

  /** Whether the control is focused. */
  focused = false;

  /** Whether the control's label should float. */
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  /** Name of the form control. */
  controlType = 'mat-date-range-input';

  /**
   * Implemented as a part of `MatFormFieldControl`, but not used.
   * Use `startPlaceholder` and `endPlaceholder` instead.
   * @docs-private
   */
  placeholder: string;

  /** Whether the input is required. */
  @Input()
  get required(): boolean { return !!this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
  }
  private _required: boolean;

  /** Whether the input is disabled. */
  get disabled(): boolean {
    if (this._startInput && this._endInput) {
      return this._startInput.disabled && this._endInput.disabled;
    }

    return false;
  }

  /** Whether the input is in an error state. */
  get errorState(): boolean {
    if (this._startInput && this._endInput) {
      return this._startInput.errorState || this._endInput.errorState;
    }

    return false;
  }

  /** Whether the datepicker input is empty. */
  get empty(): boolean {
    const startEmpty = this._startInput ? this._startInput.isEmpty() : false;
    const endEmpty = this._endInput ? this._endInput.isEmpty() : false;
    return startEmpty && endEmpty;
  }

  /** Value for the `aria-describedby` attribute of the inputs. */
  _ariaDescribedBy: string | null = null;

  /** Value for the `aria-labelledby` attribute of the inputs. */
  _ariaLabelledBy: string | null = null;

  /** Placeholder for the start input. */
  @Input() startPlaceholder: string;

  /** Placeholder for the end input. */
  @Input() endPlaceholder: string;

  /** Separator text to be shown between the inputs. */
  @Input() separator = '–';

  @ContentChild(MatStartDate) _startInput: MatStartDate<D>;
  @ContentChild(MatEndDate) _endInput: MatEndDate<D>;

  /**
   * Implemented as a part of `MatFormFieldControl`.
   * TODO(crisbeto): change type to `AbstractControlDirective` after #18206 lands.
   * @docs-private
   */
  ngControl: NgControl | null;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Self() control: ControlContainer,
    @Optional() formField?: MatFormField) {

    // TODO(crisbeto): remove `as any` after #18206 lands.
    this.ngControl = control as any;
    this._ariaLabelledBy = formField ? formField._labelId : null;
  }

  /**
   * Implemented as a part of `MatFormFieldControl`.
   * @docs-private
   */
  setDescribedByIds(ids: string[]): void {
    this._ariaDescribedBy = ids.length ? ids.join(' ') : null;
  }

  /**
   * Implemented as a part of `MatFormFieldControl`.
   * @docs-private
   */
  onContainerClick(): void {
    if (!this.focused) {
      // TODO(crisbeto): maybe this should go to end input if start has a value?
      this._startInput.focus();
    }
  }

  ngAfterContentInit() {
    if (!this._startInput) {
      throw Error('mat-date-range-input must contain a matStartDate input');
    }

    if (!this._endInput) {
      throw Error('mat-date-range-input must contain a matEndDate input');
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  /** Gets the value that is used to mirror the state input. */
  _getInputMirrorValue() {
    return this._startInput ? this._startInput.getMirrorValue() : '';
  }

  /** Whether the input placeholders should be hidden. */
  _shouldHidePlaceholders() {
    return this._startInput ? !this._startInput.isEmpty() : false;
  }

  /** Handles the value in one of the child inputs changing. */
  _handleChildValueChange() {
    this._changeDetectorRef.markForCheck();
  }

  /** Opens the datepicker associated with the input. */
  _openDatepicker() {
    // TODO(crisbeto): implement once the datepicker is in place.
  }

  static ngAcceptInputType_required: BooleanInput;
}
