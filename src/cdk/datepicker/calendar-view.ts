/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs';

/**
 * An abstract calendar that is used as part of the datepicker. This abstract calendar class
 * contains all necessary parts needed for a generic datepicker component.
 */
export abstract class CalendarView<D> {

    /** The date representing when to start the calendar. */
    abstract get activeDate();
    abstract set activeDate(value: D);

    /** The minimum selectable date. */
    abstract get minDate();
    abstract set minDate(value: D | null);

    /** The maximum selectable date. */
    abstract get maxDate();
    abstract set maxDate(value: D | null);

    /** The currently selected date. */
    abstract get selected();
    abstract set selected(value: D | null);

    /**
     * Emits whenever there is a state change that needs to be responded to.
     */
    readonly changes = new Subject<D>();
}
