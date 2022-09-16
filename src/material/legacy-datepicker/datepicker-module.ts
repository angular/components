/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCommonModule} from '@angular/material/legacy-core';
import {
  _MatDatepickerBaseModule,
  _MAT_CALENDAR_DYNAMIC_COMPONENTS,
} from '@angular/material/datepicker';
import {MatLegacyCalendarHeader} from './calendar-header';
import {MatLegacyDatepickerCloseButton} from './datepicker-close-button';
import {MatLegacyDatepickerToggle} from './datepicker-toggle';

/**
 * @deprecated Use `MatDatepickerModule` from `@angular/material/datepicker` instead.
 * See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@NgModule({
  imports: [CommonModule, MatLegacyCommonModule, MatLegacyButtonModule, _MatDatepickerBaseModule],
  exports: [MatLegacyCalendarHeader, MatLegacyDatepickerToggle, _MatDatepickerBaseModule],
  declarations: [
    MatLegacyDatepickerCloseButton,
    MatLegacyCalendarHeader,
    MatLegacyDatepickerToggle,
  ],
  providers: [
    {
      provide: _MAT_CALENDAR_DYNAMIC_COMPONENTS,
      useValue: {
        calendarHeader: MatLegacyCalendarHeader,
        closeButton: MatLegacyDatepickerCloseButton,
      },
    },
  ],
})
export class MatLegacyDatepickerModule {}
