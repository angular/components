/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter, OnDestroy} from "@angular/core";

/**
 * An abstract calendar that is used as part of the datepicker. This abstract calendar class
 * contains all necessary parts needed for a generic datepicker component.
 */
export abstract class CalendarView<D> implements OnDestroy {

  /** The date representing when to start the calendar. */
  abstract activeDate: D;

  /** The minimum selectable date. */
  abstract minDate: D | null;

  /** The maximum selectable date. */
  abstract maxDate: D | null;

  /** The currently selected date. */
  abstract selected: D | null;

  /** Emits when a new date is selected. */
  readonly selectedChange = new EventEmitter<D | null>();

  /** Destroys change detection. */
  ngOnDestroy() {
    this.selectedChange.complete();
  }
}
