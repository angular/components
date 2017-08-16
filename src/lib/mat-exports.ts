/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  MD_AUTOCOMPLETE_SCROLL_STRATEGY,
  MD_AUTOCOMPLETE_SCROLL_STRATEGY_PROVIDER,
  MD_AUTOCOMPLETE_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MD_AUTOCOMPLETE_VALUE_ACCESSOR,
  MdAutocomplete,
  MdAutocompleteModule,
  MdAutocompleteTrigger
} from './autocomplete/index';
import {
  MdAnchor,
  MdButton,
  MdButtonBase,
  MdButtonCssMatStyler,
  MdButtonModule,
  MdFab,
  MdIconButtonCssMatStyler,
  MdMiniFab,
  MdRaisedButtonCssMatStyler
} from './button/index';
import {
  MD_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR,
  MdButtonToggle,
  MdButtonToggleChange,
  MdButtonToggleGroup,
  MdButtonToggleGroupBase,
  MdButtonToggleGroupMultiple,
  MdButtonToggleModule
} from './button-toggle/index';
import {
  MdCard,
  MdCardActions,
  MdCardAvatar,
  MdCardContent,
  MdCardFooter,
  MdCardHeader,
  MdCardImage,
  MdCardLgImage,
  MdCardMdImage,
  MdCardModule,
  MdCardSmImage,
  MdCardSubtitle,
  MdCardTitle,
  MdCardTitleGroup,
  MdCardXlImage
} from './card/index';
import {
  MdBasicChip,
  MdChip,
  MdChipBase,
  MdChipEvent,
  MdChipInput,
  MdChipInputEvent,
  MdChipList,
  MdChipRemove,
  MdChipsModule
} from './chips/index';
import {
  MD_CHECKBOX_CONTROL_VALUE_ACCESSOR,
  MD_CHECKBOX_REQUIRED_VALIDATOR,
  MdCheckbox,
  MdCheckboxBase,
  MdCheckboxChange,
  MdCheckboxModule,
  MdCheckboxRequiredValidator
} from './checkbox/index';
import {
  MD_DATEPICKER_SCROLL_STRATEGY,
  MD_DATEPICKER_SCROLL_STRATEGY_PROVIDER,
  MD_DATEPICKER_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MD_DATEPICKER_VALIDATORS,
  MD_DATEPICKER_VALUE_ACCESSOR,
  MdCalendar,
  MdCalendarBody,
  MdCalendarCell,
  MdDatepicker,
  MdDatepickerContent,
  MdDatepickerInput,
  MdDatepickerInputEvent,
  MdDatepickerIntl,
  MdDatepickerModule,
  MdDatepickerToggle,
  MdMonthView,
  MdYearView
} from './datepicker/index';
import {
  MD_DIALOG_DATA,
  MD_DIALOG_SCROLL_STRATEGY,
  MD_DIALOG_SCROLL_STRATEGY_PROVIDER,
  MD_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MdDialog,
  MdDialogActions,
  MdDialogClose,
  MdDialogConfig,
  MdDialogContainer,
  MdDialogContent,
  MdDialogModule,
  MdDialogRef,
  MdDialogTitle
} from './dialog/index';
import {
  MdAccordion,
  MdAccordionDisplayMode,
  MdExpansionModule,
  MdExpansionPanel,
  MdExpansionPanelActionRow,
  MdExpansionPanelDescription,
  MdExpansionPanelHeader,
  MdExpansionPanelState,
  MdExpansionPanelTitle
} from './expansion/index';
import {MdGridList, MdGridListModule, MdGridTile} from './grid-list/index';
import {MdIcon, MdIconBase, MdIconModule, MdIconRegistry} from './icon/index';
import {MdInput, MdInputModule, MdTextareaAutosize} from './input/index';
import {
  MdDividerCssMatStyler,
  MdList,
  MdListAvatarCssMatStyler,
  MdListBase,
  MdListCssMatStyler,
  MdListDivider,
  MdListIconCssMatStyler,
  MdListItem,
  MdListItemBase,
  MdListModule,
  MdListOption,
  MdListSubheaderCssMatStyler,
  MdNavListCssMatStyler,
  MdSelectionList,
  MdSelectionListBase,
  MdSelectionListOptionEvent
} from './list/index';
import {
  MD_DATE_FORMATS,
  MD_ELEMENTS_SELECTOR,
  MD_ERROR_GLOBAL_OPTIONS,
  MD_NATIVE_DATE_FORMATS,
  MD_PLACEHOLDER_GLOBAL_OPTIONS,
  MD_RIPPLE_GLOBAL_OPTIONS,
  MdCommonModule,
  MdCoreModule,
  MdDateFormats,
  MdLine,
  MdLineModule,
  MdLineSetter,
  MdNativeDateModule,
  MdOptgroup,
  MdOptgroupBase,
  MdOption,
  MdOptionModule,
  MdOptionSelectionChange,
  MdPrefixRejector,
  MdPseudoCheckbox,
  MdPseudoCheckboxState,
  MdRipple,
  MdRippleModule,
  MdSelectionModule
} from './core';
import {
  MD_MENU_DEFAULT_OPTIONS,
  MdMenu,
  MdMenuDefaultOptions,
  MdMenuItem,
  MdMenuModule,
  MdMenuPanel,
  MdMenuTrigger
} from './menu/index';
import {MdPaginator, MdPaginatorIntl, MdPaginatorModule} from './paginator/index';
import {MdProgressBar, MdProgressBarModule} from './progress-bar/index';
import {
  MdProgressSpinner,
  MdProgressSpinnerBase,
  MdProgressSpinnerCssMatStyler,
  MdProgressSpinnerModule,
  MdSpinner
} from './progress-spinner/index';
import {
  MD_RADIO_GROUP_CONTROL_VALUE_ACCESSOR,
  MdRadioButton,
  MdRadioButtonBase,
  MdRadioChange,
  MdRadioGroup,
  MdRadioGroupBase,
  MdRadioModule
} from './radio/index';
import {
  MD_SELECT_SCROLL_STRATEGY,
  MD_SELECT_SCROLL_STRATEGY_PROVIDER,
  MD_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MdSelect,
  MdSelectBase,
  MdSelectChange,
  MdSelectModule,
  MdSelectTrigger
} from './select/index';
import {
  MdSidenav,
  MdSidenavContainer,
  MdSidenavModule,
  MdSidenavToggleResult
} from './sidenav/index';
import {
  MD_SLIDER_VALUE_ACCESSOR,
  MdSlider,
  MdSliderBase,
  MdSliderChange,
  MdSliderModule
} from './slider/index';
import {
  MD_SLIDE_TOGGLE_VALUE_ACCESSOR,
  MdSlideToggle,
  MdSlideToggleBase,
  MdSlideToggleChange,
  MdSlideToggleModule
} from './slide-toggle/index';
import {
  MD_SNACK_BAR_DATA,
  MdSnackBar,
  MdSnackBarConfig,
  MdSnackBarContainer,
  MdSnackBarModule,
  MdSnackBarRef
} from './snack-bar/index';
import {MdSort, MdSortable, MdSortHeader, MdSortHeaderIntl, MdSortModule} from './sort/index';
import {
  MdCell,
  MdCellDef,
  MdColumnDef,
  MdHeaderCell,
  MdHeaderCellDef,
  MdHeaderRow,
  MdHeaderRowDef,
  MdRow,
  MdRowDef,
  MdTable,
  MdTableModule
} from './table/index';
import {
  MdInkBar,
  MdTab,
  MdTabBody,
  MdTabBodyOriginState,
  MdTabBodyPositionState,
  MdTabChangeEvent,
  MdTabGroup,
  MdTabGroupBase,
  MdTabHeader,
  MdTabHeaderPosition,
  MdTabLabel,
  MdTabLabelWrapper,
  MdTabLink,
  MdTabNav,
  MdTabsModule
} from './tabs/index';
import {MdToolbar, MdToolbarBase, MdToolbarModule, MdToolbarRow} from './toolbar/index';
import {
  MD_TOOLTIP_SCROLL_STRATEGY,
  MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER,
  MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MdTooltip,
  MdTooltipModule
} from './tooltip/index';

/**
 * This file contains re-exports of all Md-prefixed classes and types that are exported by the
 * public-api. Used for mat-compatible projects that reference selectors with the mat-prefix.
 */

export {MdAutocompleteModule as MatAutocompleteModule};
export {MdAutocomplete as MatAutocomplete};
export {MD_AUTOCOMPLETE_SCROLL_STRATEGY as MAT_AUTOCOMPLETE_SCROLL_STRATEGY};
export {MD_AUTOCOMPLETE_SCROLL_STRATEGY_PROVIDER_FACTORY as MAT_AUTOCOMPLETE_SCROLL_STRATEGY_PROVIDER_FACTORY};
export {MD_AUTOCOMPLETE_SCROLL_STRATEGY_PROVIDER as MAT_AUTOCOMPLETE_SCROLL_STRATEGY_PROVIDER};
export {MD_AUTOCOMPLETE_VALUE_ACCESSOR as MAT_AUTOCOMPLETE_VALUE_ACCESSOR};
export {MdAutocompleteTrigger as MatAutocompleteTrigger};
export {MdButtonModule as MatButtonModule};
export {MdButtonCssMatStyler as MatButtonCssMatStyler};
export {MdRaisedButtonCssMatStyler as MatRaisedButtonCssMatStyler};
export {MdIconButtonCssMatStyler as MatIconButtonCssMatStyler};
export {MdFab as MatFab};
export {MdMiniFab as MatMiniFab};
export {MdButtonBase as MatButtonBase};
export {MdButton as MatButton};
export {MdAnchor as MatAnchor};
export {MdButtonToggleModule as MatButtonToggleModule};
export {MdButtonToggleGroupBase as MatButtonToggleGroupBase};
export {MD_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR as MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR};
export {MdButtonToggleChange as MatButtonToggleChange};
export {MdButtonToggleGroup as MatButtonToggleGroup};
export {MdButtonToggleGroupMultiple as MatButtonToggleGroupMultiple};
export {MdButtonToggle as MatButtonToggle};
export {MdCardModule as MatCardModule};
export {MdCardContent as MatCardContent};
export {MdCardTitle as MatCardTitle};
export {MdCardSubtitle as MatCardSubtitle};
export {MdCardActions as MatCardActions};
export {MdCardFooter as MatCardFooter};
export {MdCardImage as MatCardImage};
export {MdCardSmImage as MatCardSmImage};
export {MdCardMdImage as MatCardMdImage};
export {MdCardLgImage as MatCardLgImage};
export {MdCardXlImage as MatCardXlImage};
export {MdCardAvatar as MatCardAvatar};
export {MdCard as MatCard};
export {MdCardHeader as MatCardHeader};
export {MdCardTitleGroup as MatCardTitleGroup};
export {MdCheckboxModule as MatCheckboxModule};
export {MD_CHECKBOX_CONTROL_VALUE_ACCESSOR as MAT_CHECKBOX_CONTROL_VALUE_ACCESSOR};
export {MdCheckboxChange as MatCheckboxChange};
export {MdCheckboxBase as MatCheckboxBase};
export {MdCheckbox as MatCheckbox};
export {MD_CHECKBOX_REQUIRED_VALIDATOR as MAT_CHECKBOX_REQUIRED_VALIDATOR};
export {MdCheckboxRequiredValidator as MatCheckboxRequiredValidator};
export {MdChipsModule as MatChipsModule};
export {MdChipList as MatChipList};
export {MdChipEvent as MatChipEvent};
export {MdChipBase as MatChipBase};
export {MdBasicChip as MatBasicChip};
export {MdChip as MatChip};
export {MdChipRemove as MatChipRemove};
export {MdChipInputEvent as MatChipInputEvent};
export {MdChipInput as MatChipInput};
export {MdLineModule as MatLineModule};
export {MdLine as MatLine};
export {MdLineSetter as MatLineSetter};
export {MdCommonModule as MatCommonModule};
export {MD_PLACEHOLDER_GLOBAL_OPTIONS as MAT_PLACEHOLDER_GLOBAL_OPTIONS};
export {MD_ERROR_GLOBAL_OPTIONS as MAT_ERROR_GLOBAL_OPTIONS};
export {MdCoreModule as MatCoreModule};
export {MdOptionModule as MatOptionModule};
export {MdOptionSelectionChange as MatOptionSelectionChange};
export {MdOption as MatOption};
export {MdOptgroupBase as MatOptgroupBase};
export {MdOptgroup as MatOptgroup};
export {MdRipple as MatRipple};
export {MD_RIPPLE_GLOBAL_OPTIONS as MAT_RIPPLE_GLOBAL_OPTIONS};
export {MdRippleModule as MatRippleModule};
export {MdSelectionModule as MatSelectionModule};
export {MdPseudoCheckboxState as MatPseudoCheckboxState};
export {MdPseudoCheckbox as MatPseudoCheckbox};
export {MdNativeDateModule as MatNativeDateModule};
export {MdDateFormats as MatDateFormats};
export {MD_DATE_FORMATS as MAT_DATE_FORMATS};
export {MD_NATIVE_DATE_FORMATS as MAT_NATIVE_DATE_FORMATS};
export {MdDatepickerModule as MatDatepickerModule};
export {MdCalendar as MatCalendar};
export {MdCalendarCell as MatCalendarCell};
export {MdCalendarBody as MatCalendarBody};
export {MD_DATEPICKER_SCROLL_STRATEGY as MAT_DATEPICKER_SCROLL_STRATEGY};
export {MD_DATEPICKER_SCROLL_STRATEGY_PROVIDER_FACTORY as MAT_DATEPICKER_SCROLL_STRATEGY_PROVIDER_FACTORY};
export {MD_DATEPICKER_SCROLL_STRATEGY_PROVIDER as MAT_DATEPICKER_SCROLL_STRATEGY_PROVIDER};
export {MdDatepickerContent as MatDatepickerContent};
export {MdDatepicker as MatDatepicker};
export {MD_DATEPICKER_VALUE_ACCESSOR as MAT_DATEPICKER_VALUE_ACCESSOR};
export {MD_DATEPICKER_VALIDATORS as MAT_DATEPICKER_VALIDATORS};
export {MdDatepickerInputEvent as MatDatepickerInputEvent};
export {MdDatepickerInput as MatDatepickerInput};
export {MdDatepickerIntl as MatDatepickerIntl};
export {MdDatepickerToggle as MatDatepickerToggle};
export {MdMonthView as MatMonthView};
export {MdYearView as MatYearView};
export {MdDialogModule as MatDialogModule};
export {MD_DIALOG_DATA as MAT_DIALOG_DATA};
export {MD_DIALOG_SCROLL_STRATEGY as MAT_DIALOG_SCROLL_STRATEGY};
export {MD_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY as MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY};
export {MD_DIALOG_SCROLL_STRATEGY_PROVIDER as MAT_DIALOG_SCROLL_STRATEGY_PROVIDER};
export {MdDialog as MatDialog};
export {MdDialogContainer as MatDialogContainer};
export {MdDialogClose as MatDialogClose};
export {MdDialogTitle as MatDialogTitle};
export {MdDialogContent as MatDialogContent};
export {MdDialogActions as MatDialogActions};
export {MdDialogConfig as MatDialogConfig};
export {MdDialogRef as MatDialogRef};
export {MdExpansionModule as MatExpansionModule};
export {MdAccordion as MatAccordion};
export {MdAccordionDisplayMode as MatAccordionDisplayMode};
export {MdExpansionPanel as MatExpansionPanel};
export {MdExpansionPanelState as MatExpansionPanelState};
export {MdExpansionPanelActionRow as MatExpansionPanelActionRow};
export {MdExpansionPanelHeader as MatExpansionPanelHeader};
export {MdExpansionPanelDescription as MatExpansionPanelDescription};
export {MdExpansionPanelTitle as MatExpansionPanelTitle};
export {MdGridListModule as MatGridListModule};
export {MdGridTile as MatGridTile};
export {MdGridList as MatGridList};
export {MdIconModule as MatIconModule};
export {MdIconBase as MatIconBase};
export {MdIcon as MatIcon};
export {MdIconRegistry as MatIconRegistry};
export {MdInputModule as MatInputModule};
export {MdTextareaAutosize as MatTextareaAutosize};
export {MdInput as MatInput};
export {MdListModule as MatListModule};
export {MdListBase as MatListBase};
export {MdListItemBase as MatListItemBase};
export {MdListDivider as MatListDivider};
export {MdList as MatList};
export {MdListCssMatStyler as MatListCssMatStyler};
export {MdNavListCssMatStyler as MatNavListCssMatStyler};
export {MdDividerCssMatStyler as MatDividerCssMatStyler};
export {MdListAvatarCssMatStyler as MatListAvatarCssMatStyler};
export {MdListIconCssMatStyler as MatListIconCssMatStyler};
export {MdListSubheaderCssMatStyler as MatListSubheaderCssMatStyler};
export {MdListItem as MatListItem};
export {MdSelectionListBase as MatSelectionListBase};
export {MdSelectionListOptionEvent as MatSelectionListOptionEvent};
export {MdListOption as MatListOption};
export {MdSelectionList as MatSelectionList};
export {MdMenuModule as MatMenuModule};
export {MdMenu as MatMenu};
export {MdMenuDefaultOptions as MatMenuDefaultOptions};
export {MD_MENU_DEFAULT_OPTIONS as MAT_MENU_DEFAULT_OPTIONS};
export {MdMenuItem as MatMenuItem};
export {MdMenuTrigger as MatMenuTrigger};
export {MdMenuPanel as MatMenuPanel};
export {MdPaginatorModule as MatPaginatorModule};
export {MdPaginator as MatPaginator};
export {MdPaginatorIntl as MatPaginatorIntl};
export {MdProgressBarModule as MatProgressBarModule};
export {MdProgressBar as MatProgressBar};
export {MdProgressSpinnerModule as MatProgressSpinnerModule};
export {MdProgressSpinnerCssMatStyler as MatProgressSpinnerCssMatStyler};
export {MdProgressSpinnerBase as MatProgressSpinnerBase};
export {MdProgressSpinner as MatProgressSpinner};
export {MdSpinner as MatSpinner};
export {MdRadioModule as MatRadioModule};
export {MD_RADIO_GROUP_CONTROL_VALUE_ACCESSOR as MAT_RADIO_GROUP_CONTROL_VALUE_ACCESSOR};
export {MdRadioChange as MatRadioChange};
export {MdRadioGroupBase as MatRadioGroupBase};
export {MdRadioGroup as MatRadioGroup};
export {MdRadioButtonBase as MatRadioButtonBase};
export {MdRadioButton as MatRadioButton};
export {MdSelectModule as MatSelectModule};
export {MD_SELECT_SCROLL_STRATEGY as MAT_SELECT_SCROLL_STRATEGY};
export {MD_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY as MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY};
export {MD_SELECT_SCROLL_STRATEGY_PROVIDER as MAT_SELECT_SCROLL_STRATEGY_PROVIDER};
export {MdSelectChange as MatSelectChange};
export {MdSelectBase as MatSelectBase};
export {MdSelectTrigger as MatSelectTrigger};
export {MdSelect as MatSelect};
export {MdSidenavModule as MatSidenavModule};
export {MdSidenavToggleResult as MatSidenavToggleResult};
export {MdSidenav as MatSidenav};
export {MdSidenavContainer as MatSidenavContainer};
export {MdSlideToggleModule as MatSlideToggleModule};
export {MD_SLIDE_TOGGLE_VALUE_ACCESSOR as MAT_SLIDE_TOGGLE_VALUE_ACCESSOR};
export {MdSlideToggleChange as MatSlideToggleChange};
export {MdSlideToggleBase as MatSlideToggleBase};
export {MdSlideToggle as MatSlideToggle};
export {MdSliderModule as MatSliderModule};
export {MD_SLIDER_VALUE_ACCESSOR as MAT_SLIDER_VALUE_ACCESSOR};
export {MdSliderChange as MatSliderChange};
export {MdSliderBase as MatSliderBase};
export {MdSlider as MatSlider};
export {MdSnackBarModule as MatSnackBarModule};
export {MdSnackBar as MatSnackBar};
export {MdSnackBarContainer as MatSnackBarContainer};
export {MD_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA};
export {MdSnackBarConfig as MatSnackBarConfig};
export {MdSnackBarRef as MatSnackBarRef};
export {MdSortModule as MatSortModule};
export {MdSortHeader as MatSortHeader};
export {MdSortHeaderIntl as MatSortHeaderIntl};
export {MdSortable as MatSortable};
export {MdSort as MatSort};
export {MdTableModule as MatTableModule};
export {MdCellDef as MatCellDef};
export {MdHeaderCellDef as MatHeaderCellDef};
export {MdColumnDef as MatColumnDef};
export {MdHeaderCell as MatHeaderCell};
export {MdCell as MatCell};
export {MdTable as MatTable};
export {MdHeaderRowDef as MatHeaderRowDef};
export {MdRowDef as MatRowDef};
export {MdHeaderRow as MatHeaderRow};
export {MdRow as MatRow};
export {MdTabsModule as MatTabsModule};
export {MdInkBar as MatInkBar};
export {MdTabBody as MatTabBody};
export {MdTabBodyOriginState as MatTabBodyOriginState};
export {MdTabBodyPositionState as MatTabBodyPositionState};
export {MdTabHeader as MatTabHeader};
export {MdTabLabelWrapper as MatTabLabelWrapper};
export {MdTab as MatTab};
export {MdTabLabel as MatTabLabel};
export {MdTabNav as MatTabNav};
export {MdTabLink as MatTabLink};
export {MdTabChangeEvent as MatTabChangeEvent};
export {MdTabHeaderPosition as MatTabHeaderPosition};
export {MdTabGroupBase as MatTabGroupBase};
export {MdTabGroup as MatTabGroup};
export {MdToolbarModule as MatToolbarModule};
export {MdToolbarRow as MatToolbarRow};
export {MdToolbarBase as MatToolbarBase};
export {MdToolbar as MatToolbar};
export {MdTooltipModule as MatTooltipModule};
export {MD_TOOLTIP_SCROLL_STRATEGY as MAT_TOOLTIP_SCROLL_STRATEGY};
export {MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER_FACTORY as MAT_TOOLTIP_SCROLL_STRATEGY_PROVIDER_FACTORY};
export {MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER as MAT_TOOLTIP_SCROLL_STRATEGY_PROVIDER};
export {MdTooltip as MatTooltip};
