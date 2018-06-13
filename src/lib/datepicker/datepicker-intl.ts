/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {CdkDatepickerIntl} from '@angular/cdk/datepicker/datepicker-intl';


/** Datepicker data that requires internationalization. */
@Injectable({providedIn: 'root'})
export class MatDatepickerIntl extends CdkDatepickerIntl {

    /** A label for the button used to open the calendar popup (used by screen readers). */
    openCalendarLabel: string = 'Open calendar';
}
