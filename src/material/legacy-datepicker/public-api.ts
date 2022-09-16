/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './datepicker-module';
export * from './calendar-header';
export * from './datepicker-close-button';
export * from './datepicker-toggle';

export {
  /**
   * @deprecated Use `MAT_DATEPICKER_SCROLL_STRATEGY` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_DATEPICKER_SCROLL_STRATEGY as MAT_LEGACY_DATEPICKER_SCROLL_STRATEGY,
  /**
   * @deprecated Use `MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY as MAT_LEGACY_DATEPICKER_SCROLL_STRATEGY_FACTORY,
  /**
   * @deprecated Use `MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER as MAT_LEGACY_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER,
  /**
   * @deprecated Use `MatDatepickerContent` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDatepickerContent as MatLegacyDatepickerContent,
  /**
   * @deprecated Use `DatepickerDropdownPositionX` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  DatepickerDropdownPositionX as LegacyDatepickerDropdownPositionX,
  /**
   * @deprecated Use `DatepickerDropdownPositionY` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  DatepickerDropdownPositionY as LegacyDatepickerDropdownPositionY,
  /**
   * @deprecated Use `MatDatepickerControl` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDatepickerControl as MatLegacyDatepickerControl,
  /**
   * @deprecated Use `MatDatepickerPanel` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDatepickerPanel as MatLegacyDatepickerPanel,
  /**
   * @deprecated Use `MAT_DATE_RANGE_SELECTION_STRATEGY` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_DATE_RANGE_SELECTION_STRATEGY as MAT_LEGACY_DATE_RANGE_SELECTION_STRATEGY,
  /**
   * @deprecated Use `MatDateRangeSelectionStrategy` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDateRangeSelectionStrategy as MatLegacyDateRangeSelectionStrategy,
  /**
   * @deprecated Use `DefaultMatCalendarRangeStrategy` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  DefaultMatCalendarRangeStrategy as LegacyDefaultMatCalendarRangeStrategy,
  /**
   * @deprecated Use `matDatepickerAnimations` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  matDatepickerAnimations as matLegacyDatepickerAnimations,
  /**
   * @deprecated Use `MAT_DATEPICKER_VALUE_ACCESSOR` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_DATEPICKER_VALUE_ACCESSOR as MAT_LEGACY_DATEPICKER_VALUE_ACCESSOR,
  /**
   * @deprecated Use `MAT_DATEPICKER_VALIDATORS` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_DATEPICKER_VALIDATORS as MAT_LEGACY_DATEPICKER_VALIDATORS,
  /**
   * @deprecated Use `MatDatepickerInput` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDatepickerInput as MatLegacyDatepickerInput,
  /**
   * @deprecated Use `MatDatepickerInputEvent` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDatepickerInputEvent as MatLegacyDatepickerInputEvent,
  /**
   * @deprecated Use `DateFilterFn` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  DateFilterFn as LegacyDateFilterFn,
  /**
   * @deprecated Use `MatDateRangePicker` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDateRangePicker as MatLegacyDateRangePicker,
  /**
   * @deprecated Use `MatStartDate` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatStartDate as MatLegacyStartDate,
  /**
   * @deprecated Use `MatEndDate` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatEndDate as MatLegacyEndDate,
  /**
   * @deprecated Use `MatMultiYearView` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatMultiYearView as MatLegacyMultiYearView,
  /**
   * @deprecated Use `yearsPerPage` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  yearsPerPage as legacyYearsPerPage,
  /**
   * @deprecated Use `yearsPerRow` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  yearsPerRow as legacyYearsPerRow,
  /**
   * @deprecated Use `MatCalendarView` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatCalendarView as MatLegacyCalendarView,
  /**
   * @deprecated Use `MatCalendar` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatCalendar as MatLegacyCalendar,
  /**
   * @deprecated Use `MatCalendarCellCssClasses` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatCalendarCellCssClasses as MatLegacyCalendarCellCssClasses,
  /**
   * @deprecated Use `MatCalendarCellClassFunction` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatCalendarCellClassFunction as MatLegacyCalendarCellClassFunction,
  /**
   * @deprecated Use `MatCalendarCell` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatCalendarCell as MatLegacyCalendarCell,
  /**
   * @deprecated Use `MatCalendarUserEvent` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatCalendarUserEvent as MatLegacyCalendarUserEvent,
  /**
   * @deprecated Use `MatCalendarBody` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatCalendarBody as MatLegacyCalendarBody,
  /**
   * @deprecated Use `MatDatepicker` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDatepicker as MatLegacyDatepicker,
  /**
   * @deprecated Use `MatDatepickerIntl` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDatepickerIntl as MatLegacyDatepickerIntl,
  /**
   * @deprecated Use `MatDatepickerToggleIcon` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDatepickerToggleIcon as MatLegacyDatepickerToggleIcon,
  /**
   * @deprecated Use `MatMonthView` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatMonthView as MatLegacyMonthView,
  /**
   * @deprecated Use `MatYearView` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatYearView as MatLegacyYearView,
  /**
   * @deprecated Use `MatDateRangeInput` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDateRangeInput as MatLegacyDateRangeInput,
  /**
   * @deprecated Use `DateRange` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  DateRange as LegacyDateRange,
  /**
   * @deprecated Use `ExtractDateTypeFromSelection` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  ExtractDateTypeFromSelection as LegacyExtractDateTypeFromSelection,
  /**
   * @deprecated Use `DateSelectionModelChange` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  DateSelectionModelChange as LegacyDateSelectionModelChange,
  /**
   * @deprecated Use `MatDateSelectionModel` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDateSelectionModel as MatLegacyDateSelectionModel,
  /**
   * @deprecated Use `MatSingleDateSelectionModel` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatSingleDateSelectionModel as MatLegacySingleDateSelectionModel,
  /**
   * @deprecated Use `MatRangeDateSelectionModel` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatRangeDateSelectionModel as MatLegacyRangeDateSelectionModel,
  /**
   * @deprecated Use `MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY as MAT_LEGACY_SINGLE_DATE_SELECTION_MODEL_FACTORY,
  /**
   * @deprecated Use `MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER as MAT_LEGACY_SINGLE_DATE_SELECTION_MODEL_PROVIDER,
  /**
   * @deprecated Use `MAT_RANGE_DATE_SELECTION_MODEL_FACTORY` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_RANGE_DATE_SELECTION_MODEL_FACTORY as MAT_LEGACY_RANGE_DATE_SELECTION_MODEL_FACTORY,
  /**
   * @deprecated Use `MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER as MAT_LEGACY_RANGE_DATE_SELECTION_MODEL_PROVIDER,
  /**
   * @deprecated Use `MatDatepickerApply` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDatepickerApply as MatLegacyDatepickerApply,
  /**
   * @deprecated Use `MatDatepickerCancel` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDatepickerCancel as MatLegacyDatepickerCancel,
  /**
   * @deprecated Use `MatDatepickerActions` from `@angular/material/datepicker` instead.
   * See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDatepickerActions as MatLegacyDatepickerActions,
} from '@angular/material/datepicker';
