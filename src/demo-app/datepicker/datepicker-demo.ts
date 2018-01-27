/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, Host} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {DateAdapter} from '@angular/material/core';
import {MatCalendar} from '@angular/material';


@Component({
    moduleId: module.id,
    selector: 'datepicker-demo',
    templateUrl: 'datepicker-demo.html',
    styleUrls: ['datepicker-demo.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDemo {
    touch: boolean;
    filterOdd: boolean;
    yearView: boolean;
    inputDisabled: boolean;
    datepickerDisabled: boolean;
    minDate: Date;
    maxDate: Date;
    startAt: Date;
    date: Date;
    lastDateInput: Date | null;
    lastDateChange: Date | null;

    dateFilter =
        (date: Date) => !(date.getFullYear() % 2) && (date.getMonth() % 2) && !(date.getDate() % 2)

    onDateInput = (e: MatDatepickerInputEvent<Date>) => this.lastDateInput = e.value;
    onDateChange = (e: MatDatepickerInputEvent<Date>) => this.lastDateChange = e.value;

    dateCtrl = new FormControl();

    // pass custom header component type as input
    customHeader = CustomHeader;
}

// Custom Header Component for DatePicker Calendar
@Component({
    selector: 'custom-header',
    template: '<select (change)="convertCalendarFormatTo($event.target.value)"><option>Gregorian</option><option>Julian</option></select>'
})
export class CustomHeader {
    constructor(@Host() public calendar: MatCalendar<any>,
                public adapter: DateAdapter<any>) {
        //console.log(this.calendar);
        //console.log(this.adapter);
    }

    convertCalendarFormatTo(format: string) {
        console.log(format);
    }
}
