/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MatCommonModule} from '@angular/material/core';
import {MatCalendar, _MAT_CALENDAR_DYNAMIC_COMPONENTS} from './calendar';
import {MatCalendarBody} from './calendar-body';
import {MatDatepicker} from './datepicker';
import {
  MatDatepickerContent,
  MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER,
} from './datepicker-base';
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
import {MatDatepickerCloseButton} from './datepicker-close-button';
import {MatCalendarHeader} from './calendar-header';

/** @docs-private */
@NgModule({
  imports: [CommonModule, OverlayModule, A11yModule, PortalModule],
  exports: [
    CdkScrollableModule,
    MatCalendar,
    MatCalendarBody,
    MatDatepicker,
    MatDatepickerContent,
    MatDatepickerInput,
    MatDatepickerToggleIcon,
    MatMonthView,
    MatYearView,
    MatMultiYearView,
    MatDateRangeInput,
    MatStartDate,
    MatEndDate,
    MatDateRangePicker,
    MatDatepickerActions,
    MatDatepickerCancel,
    MatDatepickerApply,
  ],
  declarations: [
    MatCalendar,
    MatCalendarBody,
    MatDatepicker,
    MatDatepickerContent,
    MatDatepickerInput,
    MatDatepickerToggleIcon,
    MatMonthView,
    MatYearView,
    MatMultiYearView,
    MatDateRangeInput,
    MatStartDate,
    MatEndDate,
    MatDateRangePicker,
    MatDatepickerActions,
    MatDatepickerCancel,
    MatDatepickerApply,
  ],
  providers: [MatDatepickerIntl, MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER],
})
export class _MatDatepickerBaseModule {}

@NgModule({
  imports: [CommonModule, MatCommonModule, MatButtonModule, _MatDatepickerBaseModule],
  exports: [_MatDatepickerBaseModule, MatCalendarHeader, MatDatepickerToggle],
  declarations: [MatDatepickerCloseButton, MatCalendarHeader, MatDatepickerToggle],
  providers: [
    {
      provide: _MAT_CALENDAR_DYNAMIC_COMPONENTS,
      useValue: {
        calendarHeader: MatCalendarHeader,
        closeButton: MatDatepickerCloseButton,
      },
    },
  ],
})
export class MatDatepickerModule {}
