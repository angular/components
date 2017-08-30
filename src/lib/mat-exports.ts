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
  MdAutocompleteTrigger,
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
  MdRaisedButtonCssMatStyler,
} from './button/index';
import {
  MD_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR,
  MdButtonToggle,
  MdButtonToggleChange,
  MdButtonToggleGroup,
  MdButtonToggleGroupBase,
  MdButtonToggleGroupMultiple,
  MdButtonToggleModule,
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
  MdCardXlImage,
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
  MdChipsModule,
} from './chips/index';
import {
  MD_CHECKBOX_CONTROL_VALUE_ACCESSOR,
  MD_CHECKBOX_REQUIRED_VALIDATOR,
  MdCheckbox,
  MdCheckboxBase,
  MdCheckboxChange,
  MdCheckboxModule,
  MdCheckboxRequiredValidator,
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
  MdYearView,
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
  MdDialogTitle,
} from './dialog/index';
import {
  MdError,
  MdFormField,
  MdFormFieldControl,
  MdFormFieldModule,
  MdHint,
  MdPlaceholder,
  MdPrefix,
  MdSuffix,
} from './form-field/index';
import {
  MdAccordion,
  MdAccordionDisplayMode,
  MdExpansionModule,
  MdExpansionPanel,
  MdExpansionPanelActionRow,
  MdExpansionPanelDescription,
  MdExpansionPanelHeader,
  MdExpansionPanelState,
  MdExpansionPanelTitle,
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
  MdSelectionListOptionEvent,
} from './list/index';
import {
  MD_DATE_FORMATS,
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
  MdPseudoCheckbox,
  MdPseudoCheckboxState,
  MdRipple,
  MdRippleModule,
} from './core';
import {MdPseudoCheckboxModule} from './core/selection/index';
import {
  MD_MENU_DEFAULT_OPTIONS,
  MdMenu,
  MdMenuDefaultOptions,
  MdMenuItem,
  MdMenuModule,
  MdMenuPanel,
  MdMenuTrigger,
} from './menu/index';
import {MdPaginator, MdPaginatorIntl, MdPaginatorModule} from './paginator/index';
import {MdProgressBar, MdProgressBarModule} from './progress-bar/index';
import {
  MdProgressSpinner,
  MdProgressSpinnerBase,
  MdProgressSpinnerCssMatStyler,
  MdProgressSpinnerModule,
  MdSpinner,
} from './progress-spinner/index';
import {
  MD_RADIO_GROUP_CONTROL_VALUE_ACCESSOR,
  MdRadioButton,
  MdRadioButtonBase,
  MdRadioChange,
  MdRadioGroup,
  MdRadioGroupBase,
  MdRadioModule,
} from './radio/index';
import {
  MD_SELECT_SCROLL_STRATEGY,
  MD_SELECT_SCROLL_STRATEGY_PROVIDER,
  MD_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MdSelect,
  MdSelectBase,
  MdSelectChange,
  MdSelectModule,
  MdSelectTrigger,
} from './select/index';
import {
  MdDrawer,
  MdDrawerContainer,
  MdDrawerToggleResult,
  MdSidenav,
  MdSidenavContainer,
  MdSidenavModule,
} from './sidenav/index';
import {
  MD_SLIDER_VALUE_ACCESSOR,
  MdSlider,
  MdSliderBase,
  MdSliderChange,
  MdSliderModule,
} from './slider/index';
import {
  MD_SLIDE_TOGGLE_VALUE_ACCESSOR,
  MdSlideToggle,
  MdSlideToggleBase,
  MdSlideToggleChange,
  MdSlideToggleModule,
} from './slide-toggle/index';
import {
  MD_SNACK_BAR_DATA,
  MdSnackBar,
  MdSnackBarConfig,
  MdSnackBarContainer,
  MdSnackBarModule,
  MdSnackBarRef,
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
  MdTableModule,
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
  MdTabsModule,
} from './tabs/index';
import {MdToolbar, MdToolbarBase, MdToolbarModule, MdToolbarRow} from './toolbar/index';
import {
  MD_TOOLTIP_SCROLL_STRATEGY,
  MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER,
  MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MdTooltip,
  MdTooltipModule,
} from './tooltip/index';

export {MD_AUTOCOMPLETE_SCROLL_STRATEGY as MAT_AUTOCOMPLETE_SCROLL_STRATEGY};
export {MD_AUTOCOMPLETE_SCROLL_STRATEGY_PROVIDER as MAT_AUTOCOMPLETE_SCROLL_STRATEGY_PROVIDER};
export {MD_AUTOCOMPLETE_SCROLL_STRATEGY_PROVIDER_FACTORY as MAT_AUTOCOMPLETE_SCROLL_STRATEGY_PROVIDER_FACTORY};
export {MD_AUTOCOMPLETE_VALUE_ACCESSOR as MAT_AUTOCOMPLETE_VALUE_ACCESSOR};
export {MD_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR as MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR};
export {MD_CHECKBOX_CONTROL_VALUE_ACCESSOR as MAT_CHECKBOX_CONTROL_VALUE_ACCESSOR};
export {MD_CHECKBOX_REQUIRED_VALIDATOR as MAT_CHECKBOX_REQUIRED_VALIDATOR};
export {MD_DATE_FORMATS as MAT_DATE_FORMATS};
export {MD_DATEPICKER_SCROLL_STRATEGY as MAT_DATEPICKER_SCROLL_STRATEGY};
export {MD_DATEPICKER_SCROLL_STRATEGY_PROVIDER as MAT_DATEPICKER_SCROLL_STRATEGY_PROVIDER};
export {MD_DATEPICKER_SCROLL_STRATEGY_PROVIDER_FACTORY as MAT_DATEPICKER_SCROLL_STRATEGY_PROVIDER_FACTORY};
export {MD_DATEPICKER_VALIDATORS as MAT_DATEPICKER_VALIDATORS};
export {MD_DATEPICKER_VALUE_ACCESSOR as MAT_DATEPICKER_VALUE_ACCESSOR};
export {MD_DIALOG_DATA as MAT_DIALOG_DATA};
export {MD_DIALOG_SCROLL_STRATEGY as MAT_DIALOG_SCROLL_STRATEGY};
export {MD_DIALOG_SCROLL_STRATEGY_PROVIDER as MAT_DIALOG_SCROLL_STRATEGY_PROVIDER};
export {MD_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY as MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY};
export {MD_ERROR_GLOBAL_OPTIONS as MAT_ERROR_GLOBAL_OPTIONS};
export {MD_MENU_DEFAULT_OPTIONS as MAT_MENU_DEFAULT_OPTIONS};
export {MD_NATIVE_DATE_FORMATS as MAT_NATIVE_DATE_FORMATS};
export {MD_PLACEHOLDER_GLOBAL_OPTIONS as MAT_PLACEHOLDER_GLOBAL_OPTIONS};
export {MD_RADIO_GROUP_CONTROL_VALUE_ACCESSOR as MAT_RADIO_GROUP_CONTROL_VALUE_ACCESSOR};
export {MD_RIPPLE_GLOBAL_OPTIONS as MAT_RIPPLE_GLOBAL_OPTIONS};
export {MD_SELECT_SCROLL_STRATEGY as MAT_SELECT_SCROLL_STRATEGY};
export {MD_SELECT_SCROLL_STRATEGY_PROVIDER as MAT_SELECT_SCROLL_STRATEGY_PROVIDER};
export {MD_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY as MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY};
export {MD_SLIDE_TOGGLE_VALUE_ACCESSOR as MAT_SLIDE_TOGGLE_VALUE_ACCESSOR};
export {MD_SLIDER_VALUE_ACCESSOR as MAT_SLIDER_VALUE_ACCESSOR};
export {MD_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA};
export {MD_TOOLTIP_SCROLL_STRATEGY as MAT_TOOLTIP_SCROLL_STRATEGY};
export {MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER as MAT_TOOLTIP_SCROLL_STRATEGY_PROVIDER};
export {MD_TOOLTIP_SCROLL_STRATEGY_PROVIDER_FACTORY as MAT_TOOLTIP_SCROLL_STRATEGY_PROVIDER_FACTORY};
export {MdAccordion as MatAccordion};
export {MdAccordionDisplayMode as MatAccordionDisplayMode};
export {MdAnchor as MatAnchor};
export {MdAutocomplete as MatAutocomplete};
export {MdAutocompleteModule as MatAutocompleteModule};
export {MdAutocompleteTrigger as MatAutocompleteTrigger};
export {MdBasicChip as MatBasicChip};
export {MdButton as MatButton};
export {MdButtonBase as MatButtonBase};
export {MdButtonCssMatStyler as MatButtonCssMatStyler};
export {MdButtonModule as MatButtonModule};
export {MdButtonToggle as MatButtonToggle};
export {MdButtonToggleChange as MatButtonToggleChange};
export {MdButtonToggleGroup as MatButtonToggleGroup};
export {MdButtonToggleGroupBase as MatButtonToggleGroupBase};
export {MdButtonToggleGroupMultiple as MatButtonToggleGroupMultiple};
export {MdButtonToggleModule as MatButtonToggleModule};
export {MdCalendar as MatCalendar};
export {MdCalendarBody as MatCalendarBody};
export {MdCalendarCell as MatCalendarCell};
export {MdCard as MatCard};
export {MdCardActions as MatCardActions};
export {MdCardAvatar as MatCardAvatar};
export {MdCardContent as MatCardContent};
export {MdCardFooter as MatCardFooter};
export {MdCardHeader as MatCardHeader};
export {MdCardImage as MatCardImage};
export {MdCardLgImage as MatCardLgImage};
export {MdCardMdImage as MatCardMatImage};
export {MdCardModule as MatCardModule};
export {MdCardSmImage as MatCardSmImage};
export {MdCardSubtitle as MatCardSubtitle};
export {MdCardTitle as MatCardTitle};
export {MdCardTitleGroup as MatCardTitleGroup};
export {MdCardXlImage as MatCardXlImage};
export {MdCell as MatCell};
export {MdCellDef as MatCellDef};
export {MdCheckbox as MatCheckbox};
export {MdCheckboxBase as MatCheckboxBase};
export {MdCheckboxChange as MatCheckboxChange};
export {MdCheckboxModule as MatCheckboxModule};
export {MdCheckboxRequiredValidator as MatCheckboxRequiredValidator};
export {MdChip as MatChip};
export {MdChipBase as MatChipBase};
export {MdChipEvent as MatChipEvent};
export {MdChipInput as MatChipInput};
export {MdChipInputEvent as MatChipInputEvent};
export {MdChipList as MatChipList};
export {MdChipRemove as MatChipRemove};
export {MdChipsModule as MatChipsModule};
export {MdColumnDef as MatColumnDef};
export {MdCommonModule as MatCommonModule};
export {MdCoreModule as MatCoreModule};
export {MdDateFormats as MatDateFormats};
export {MdDatepicker as MatDatepicker};
export {MdDatepickerContent as MatDatepickerContent};
export {MdDatepickerInput as MatDatepickerInput};
export {MdDatepickerInputEvent as MatDatepickerInputEvent};
export {MdDatepickerIntl as MatDatepickerIntl};
export {MdDatepickerModule as MatDatepickerModule};
export {MdDatepickerToggle as MatDatepickerToggle};
export {MdDialog as MatDialog};
export {MdDialogActions as MatDialogActions};
export {MdDialogClose as MatDialogClose};
export {MdDialogConfig as MatDialogConfig};
export {MdDialogContainer as MatDialogContainer};
export {MdDialogContent as MatDialogContent};
export {MdDialogModule as MatDialogModule};
export {MdDialogRef as MatDialogRef};
export {MdDialogTitle as MatDialogTitle};
export {MdDividerCssMatStyler as MatDividerCssMatStyler};
export {MdDrawerToggleResult as MatDrawerToggleResult};
export {MdDrawer as MatDrawer};
export {MdDrawerContainer as MatDrawerContainer};
export {MdExpansionModule as MatExpansionModule};
export {MdExpansionPanel as MatExpansionPanel};
export {MdExpansionPanelActionRow as MatExpansionPanelActionRow};
export {MdExpansionPanelDescription as MatExpansionPanelDescription};
export {MdExpansionPanelHeader as MatExpansionPanelHeader};
export {MdExpansionPanelState as MatExpansionPanelState};
export {MdExpansionPanelTitle as MatExpansionPanelTitle};
export {MdFab as MatFab};
export {MdGridList as MatGridList};
export {MdGridListModule as MatGridListModule};
export {MdGridTile as MatGridTile};
export {MdHeaderCell as MatHeaderCell};
export {MdHeaderCellDef as MatHeaderCellDef};
export {MdHeaderRow as MatHeaderRow};
export {MdHeaderRowDef as MatHeaderRowDef};
export {MdIcon as MatIcon};
export {MdIconBase as MatIconBase};
export {MdIconButtonCssMatStyler as MatIconButtonCssMatStyler};
export {MdIconModule as MatIconModule};
export {MdIconRegistry as MatIconRegistry};
export {MdInkBar as MatInkBar};
export {MdInput as MatInput};
export {MdInputModule as MatInputModule};
export {MdLine as MatLine};
export {MdLineModule as MatLineModule};
export {MdLineSetter as MatLineSetter};
export {MdList as MatList};
export {MdListAvatarCssMatStyler as MatListAvatarCssMatStyler};
export {MdListBase as MatListBase};
export {MdListCssMatStyler as MatListCssMatStyler};
export {MdListDivider as MatListDivider};
export {MdListIconCssMatStyler as MatListIconCssMatStyler};
export {MdListItem as MatListItem};
export {MdListItemBase as MatListItemBase};
export {MdListModule as MatListModule};
export {MdListOption as MatListOption};
export {MdListSubheaderCssMatStyler as MatListSubheaderCssMatStyler};
export {MdMenu as MatMenu};
export {MdMenuDefaultOptions as MatMenuDefaultOptions};
export {MdMenuItem as MatMenuItem};
export {MdMenuModule as MatMenuModule};
export {MdMenuPanel as MatMenuPanel};
export {MdMenuTrigger as MatMenuTrigger};
export {MdMiniFab as MatMiniFab};
export {MdMonthView as MatMonthView};
export {MdNativeDateModule as MatNativeDateModule};
export {MdNavListCssMatStyler as MatNavListCssMatStyler};
export {MdOptgroup as MatOptgroup};
export {MdOptgroupBase as MatOptgroupBase};
export {MdOption as MatOption};
export {MdOptionModule as MatOptionModule};
export {MdOptionSelectionChange as MatOptionSelectionChange};
export {MdPaginator as MatPaginator};
export {MdPaginatorIntl as MatPaginatorIntl};
export {MdPaginatorModule as MatPaginatorModule};
export {MdProgressBar as MatProgressBar};
export {MdProgressBarModule as MatProgressBarModule};
export {MdProgressSpinner as MatProgressSpinner};
export {MdProgressSpinnerBase as MatProgressSpinnerBase};
export {MdProgressSpinnerCssMatStyler as MatProgressSpinnerCssMatStyler};
export {MdProgressSpinnerModule as MatProgressSpinnerModule};
export {MdPseudoCheckbox as MatPseudoCheckbox};
export {MdPseudoCheckboxModule as MatPseudoCheckboxModule};
export {MdPseudoCheckboxState as MatPseudoCheckboxState};
export {MdRadioButton as MatRadioButton};
export {MdRadioButtonBase as MatRadioButtonBase};
export {MdRadioChange as MatRadioChange};
export {MdRadioGroup as MatRadioGroup};
export {MdRadioGroupBase as MatRadioGroupBase};
export {MdRadioModule as MatRadioModule};
export {MdRaisedButtonCssMatStyler as MatRaisedButtonCssMatStyler};
export {MdRipple as MatRipple};
export {MdRippleModule as MatRippleModule};
export {MdRow as MatRow};
export {MdRowDef as MatRowDef};
export {MdSelect as MatSelect};
export {MdSelectBase as MatSelectBase};
export {MdSelectChange as MatSelectChange};
export {MdSelectionList as MatSelectionList};
export {MdSelectionListBase as MatSelectionListBase};
export {MdSelectionListOptionEvent as MatSelectionListOptionEvent};
export {MdSelectModule as MatSelectModule};
export {MdSelectTrigger as MatSelectTrigger};
export {MdSidenav as MatSidenav};
export {MdSidenavContainer as MatSidenavContainer};
export {MdSidenavModule as MatSidenavModule};
export {MdSlider as MatSlider};
export {MdSliderBase as MatSliderBase};
export {MdSliderChange as MatSliderChange};
export {MdSliderModule as MatSliderModule};
export {MdSlideToggle as MatSlideToggle};
export {MdSlideToggleBase as MatSlideToggleBase};
export {MdSlideToggleChange as MatSlideToggleChange};
export {MdSlideToggleModule as MatSlideToggleModule};
export {MdSnackBar as MatSnackBar};
export {MdSnackBarConfig as MatSnackBarConfig};
export {MdSnackBarContainer as MatSnackBarContainer};
export {MdSnackBarModule as MatSnackBarModule};
export {MdSnackBarRef as MatSnackBarRef};
export {MdSort as MatSort};
export {MdSortable as MatSortable};
export {MdSortHeader as MatSortHeader};
export {MdSortHeaderIntl as MatSortHeaderIntl};
export {MdSortModule as MatSortModule};
export {MdSpinner as MatSpinner};
export {MdTab as MatTab};
export {MdTabBody as MatTabBody};
export {MdTabBodyOriginState as MatTabBodyOriginState};
export {MdTabBodyPositionState as MatTabBodyPositionState};
export {MdTabChangeEvent as MatTabChangeEvent};
export {MdTabGroup as MatTabGroup};
export {MdTabGroupBase as MatTabGroupBase};
export {MdTabHeader as MatTabHeader};
export {MdTabHeaderPosition as MatTabHeaderPosition};
export {MdTabLabel as MatTabLabel};
export {MdTabLabelWrapper as MatTabLabelWrapper};
export {MdTable as MatTable};
export {MdTableModule as MatTableModule};
export {MdTabLink as MatTabLink};
export {MdTabNav as MatTabNav};
export {MdTabsModule as MatTabsModule};
export {MdTextareaAutosize as MatTextareaAutosize};
export {MdToolbar as MatToolbar};
export {MdToolbarBase as MatToolbarBase};
export {MdToolbarModule as MatToolbarModule};
export {MdToolbarRow as MatToolbarRow};
export {MdTooltip as MatTooltip};
export {MdTooltipModule as MatTooltipModule};
export {MdYearView as MatYearView};
export {MdFormFieldModule as MatFormFieldModule};
export {MdError as MatError};
export {MdFormField as MatFormField};
export {MdFormFieldControl as MatFormFieldControl};
export {MdHint as MatHint};
export {MdPlaceholder as MatPlaceholder};
export {MdPrefix as MatPrefix};
export {MdSuffix as MatSuffix};