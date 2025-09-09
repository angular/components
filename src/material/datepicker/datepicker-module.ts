/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {A11yModule} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '../button';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MatCalendar, MatCalendarHeader} from './calendar';
import {MatCalendarBody} from './calendar-body';
import {MatDatepicker} from './datepicker';
import {MatDatepickerContent} from './datepicker-base';
import {MatDatepickerInput} from './datepicker-input';
import {MatDatepickerIntl} from './datepicker-intl';
import {MatDatepickerToggle, MatDatepickerToggleIcon} from './datepicker-toggle';
import {MatMonthView} from './month-view';
import {MatMultiYearView} from './multi-year-view';
import {MatYearView} from './year-view';
import {MatDateRangeInput} from './date-range-input';
import {MatStartDate, MatEndDate} from './date-range-input-parts';
import {MatDateRangePicker} from './date-range-picker';
import {MatDatepickerActions, MatDatepickerApply, MatDatepickerCancel} from './datepicker-actions';
import {BidiModule} from '@angular/cdk/bidi';

@NgModule({
  imports: [
    MatButtonModule,
    OverlayModule,
    A11yModule,
    PortalModule,
    MatCalendar,
    MatCalendarBody,
    MatDatepicker,
    MatDatepickerContent,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepickerToggleIcon,
    MatMonthView,
    MatYearView,
    MatMultiYearView,
    MatCalendarHeader,
    MatDateRangeInput,
    MatStartDate,
    MatEndDate,
    MatDateRangePicker,
    MatDatepickerActions,
    MatDatepickerCancel,
    MatDatepickerApply,
  ],
  exports: [
    BidiModule,
    CdkScrollableModule,
    MatCalendar,
    MatCalendarBody,
    MatDatepicker,
    MatDatepickerContent,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepickerToggleIcon,
    MatMonthView,
    MatYearView,
    MatMultiYearView,
    MatCalendarHeader,
    MatDateRangeInput,
    MatStartDate,
    MatEndDate,
    MatDateRangePicker,
    MatDatepickerActions,
    MatDatepickerCancel,
    MatDatepickerApply,
  ],
  providers: [MatDatepickerIntl],
})
export class MatDatepickerModule {}
