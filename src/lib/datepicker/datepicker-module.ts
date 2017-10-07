/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@uiux/cdk/a11y';
import {OverlayModule} from '@uiux/cdk/overlay';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@uiux/material/button';
import {MatDialogModule} from '@uiux/material/dialog';
import {MatIconModule} from '@uiux/material/icon';
import {MatCalendar} from './calendar';
import {MatCalendarBody} from './calendar-body';
import {
  MAT_DATEPICKER_SCROLL_STRATEGY_PROVIDER,
  MatDatepicker,
  MatDatepickerContent,
} from './datepicker';
import {MatDatepickerInput} from './datepicker-input';
import {MatDatepickerIntl} from './datepicker-intl';
import {MatDatepickerToggle} from './datepicker-toggle';
import {MatMonthView} from './month-view';
import {MatYearView} from './year-view';


@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    OverlayModule,
    A11yModule,
  ],
  exports: [
    MatCalendar,
    MatCalendarBody,
    MatDatepicker,
    MatDatepickerContent,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatMonthView,
    MatYearView,
  ],
  declarations: [
    MatCalendar,
    MatCalendarBody,
    MatDatepicker,
    MatDatepickerContent,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatMonthView,
    MatYearView,
  ],
  providers: [
    MatDatepickerIntl,
    MAT_DATEPICKER_SCROLL_STRATEGY_PROVIDER,
  ],
  entryComponents: [
    MatDatepickerContent,
  ]
})
export class MatDatepickerModule {}
