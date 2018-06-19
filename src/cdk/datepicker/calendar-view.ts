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
 * contains all necessary parts needed for a generic datepicker component. The material calendar,
 * month, year, and multi-year views will all extend this abstract calendar to provide overall
 * functionality of a datepicker component.
 * @docs-private
 */
export abstract class CalendarView<D> {

    /** A date representing when to start the calendar. */
    abstract set activeDate(value: D);

    /** The minimum selectable date. */
    abstract set minDate(value: D | null);

    /** The maximum selectable date. */
    abstract set maxDate(value: D | null);

    /** The currently selected date. */
    abstract set selected(value: D | null);

    /**
     * Emits whenever there is a state change that needs to be responded to.
     */
    changes = new Subject<D>();
}
