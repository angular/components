export declare type DateFilterFn<D> = (date: D | null) => boolean;

export declare const MAT_DATEPICKER_SCROLL_STRATEGY: InjectionToken<() => ScrollStrategy>;

export declare function MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy;

export declare const MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER: {
    provide: InjectionToken<() => ScrollStrategy>;
    deps: (typeof Overlay)[];
    useFactory: typeof MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY;
};

export declare const MAT_DATEPICKER_VALIDATORS: any;

export declare const MAT_DATEPICKER_VALUE_ACCESSOR: any;

export declare class MatCalendar<D> implements AfterContentInit, AfterViewChecked, OnDestroy, OnChanges {
    _calendarHeaderPortal: Portal<any>;
    readonly _userSelection: EventEmitter<void>;
    get activeDate(): D;
    set activeDate(value: D);
    comparisonEnd: D | null;
    comparisonStart: D | null;
    get currentView(): MatCalendarView;
    set currentView(value: MatCalendarView);
    dateClass: (date: D) => MatCalendarCellCssClasses;
    dateFilter: (date: D) => boolean;
    headerComponent: ComponentType<any>;
    get maxDate(): D | null;
    set maxDate(value: D | null);
    get minDate(): D | null;
    set minDate(value: D | null);
    readonly monthSelected: EventEmitter<D>;
    monthView: MatMonthView<D>;
    multiYearView: MatMultiYearView<D>;
    get selected(): DateRange<D> | D | null;
    set selected(value: DateRange<D> | D | null);
    readonly selectedChange: EventEmitter<D>;
    get startAt(): D | null;
    set startAt(value: D | null);
    startView: MatCalendarView;
    stateChanges: Subject<void>;
    readonly yearSelected: EventEmitter<D>;
    yearView: MatYearView<D>;
    constructor(_intl: MatDatepickerIntl, _dateAdapter: DateAdapter<D>, _dateFormats: MatDateFormats, _changeDetectorRef: ChangeDetectorRef, _model: MatDateSelectionModel<DateRange<D> | D | null>);
    _dateSelected(date: D | null): void;
    _goToDateInView(date: D, view: 'month' | 'year' | 'multi-year'): void;
    _monthSelectedInYearView(normalizedMonth: D): void;
    _userSelected(): void;
    _yearSelectedInMultiYearView(normalizedYear: D): void;
    focusActiveCell(): void;
    ngAfterContentInit(): void;
    ngAfterViewChecked(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    updateTodaysDate(): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatCalendar<any>, "mat-calendar", ["matCalendar"], { "headerComponent": "headerComponent"; "startAt": "startAt"; "startView": "startView"; "selected": "selected"; "minDate": "minDate"; "maxDate": "maxDate"; "dateFilter": "dateFilter"; "dateClass": "dateClass"; "comparisonStart": "comparisonStart"; "comparisonEnd": "comparisonEnd"; }, { "selectedChange": "selectedChange"; "yearSelected": "yearSelected"; "monthSelected": "monthSelected"; "_userSelection": "_userSelection"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatCalendar<any>>;
}

export declare class MatCalendarBody implements OnChanges, OnDestroy {
    _cellPadding: string;
    _cellWidth: string;
    _firstRowOffset: number;
    _hoveredValue: number;
    activeCell: number;
    cellAspectRatio: number;
    comparisonEnd: number | null;
    comparisonStart: number | null;
    endValue: number;
    label: string;
    labelMinRequiredCells: number;
    numCols: number;
    rows: MatCalendarCell[][];
    readonly selectedValueChange: EventEmitter<number>;
    startValue: number;
    todayValue: number;
    constructor(_elementRef: ElementRef<HTMLElement>, _changeDetectorRef: ChangeDetectorRef, _ngZone: NgZone);
    _cellClicked(cell: MatCalendarCell): void;
    _focusActiveCell(): void;
    _isActiveCell(rowIndex: number, colIndex: number): boolean;
    _isComparisonBridgeEnd(value: number, rowIndex: number, colIndex: number): boolean;
    _isComparisonBridgeStart(value: number, rowIndex: number, colIndex: number): boolean;
    _isComparisonEnd(value: number): boolean;
    _isComparisonStart(value: number): boolean;
    _isInComparisonRange(value: number): boolean | 0 | null;
    _isInRange(value: number): boolean;
    _isRangeEnd(value: number): boolean;
    _isRangeStart(value: number): boolean;
    _isSelected(cell: MatCalendarCell): boolean;
    _isSelectingRange(): boolean;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatCalendarBody, "[mat-calendar-body]", ["matCalendarBody"], { "label": "label"; "rows": "rows"; "todayValue": "todayValue"; "startValue": "startValue"; "endValue": "endValue"; "labelMinRequiredCells": "labelMinRequiredCells"; "numCols": "numCols"; "activeCell": "activeCell"; "cellAspectRatio": "cellAspectRatio"; "comparisonStart": "comparisonStart"; "comparisonEnd": "comparisonEnd"; }, { "selectedValueChange": "selectedValueChange"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatCalendarBody>;
}

export declare class MatCalendarCell {
    ariaLabel: string;
    compareValue: number;
    cssClasses: MatCalendarCellCssClasses;
    displayValue: string;
    enabled: boolean;
    value: number;
    constructor(value: number, displayValue: string, ariaLabel: string, enabled: boolean, cssClasses?: MatCalendarCellCssClasses, compareValue?: number);
}

export declare type MatCalendarCellCssClasses = string | string[] | Set<string> | {
    [key: string]: any;
};

export declare class MatCalendarHeader<D> {
    calendar: MatCalendar<D>;
    get nextButtonLabel(): string;
    get periodButtonLabel(): string;
    get periodButtonText(): string;
    get prevButtonLabel(): string;
    constructor(_intl: MatDatepickerIntl, calendar: MatCalendar<D>, _dateAdapter: DateAdapter<D>, _dateFormats: MatDateFormats, changeDetectorRef: ChangeDetectorRef);
    currentPeriodClicked(): void;
    nextClicked(): void;
    nextEnabled(): boolean;
    previousClicked(): void;
    previousEnabled(): boolean;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatCalendarHeader<any>, "mat-calendar-header", ["matCalendarHeader"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatCalendarHeader<any>>;
}

export declare type MatCalendarView = 'month' | 'year' | 'multi-year';

export declare class MatDatepicker<D> extends MatDatepickerBase<MatDatepickerInput<D>, D | null, D> {
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatDatepicker<any>, "mat-datepicker", ["matDatepicker"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatDatepicker<any>>;
}

export declare const matDatepickerAnimations: {
    readonly transformPanel: AnimationTriggerMetadata;
    readonly fadeInCalendar: AnimationTriggerMetadata;
};

export declare class MatDatepickerContent<S, D = ExtractDateTypeFromSelection<S>> extends _MatDatepickerContentMixinBase implements AfterViewInit, OnDestroy, CanColor {
    _animationDone: Subject<void>;
    _animationState: 'enter' | 'void';
    _calendar: MatCalendar<D>;
    _isAbove: boolean;
    comparisonEnd: D | null;
    comparisonStart: D | null;
    datepicker: MatDatepickerBase<any, S, D>;
    constructor(elementRef: ElementRef,
    _changeDetectorRef?: ChangeDetectorRef | undefined, _model?: MatDateSelectionModel<S, D> | undefined);
    _handleUserSelection(): void;
    _startExitAnimation(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatDatepickerContent<any, any>, "mat-datepicker-content", ["matDatepickerContent"], { "color": "color"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatDatepickerContent<any, any>>;
}

export declare class MatDatepickerInput<D> extends MatDatepickerInputBase<D | null, D> implements MatDatepickerControl<D | null> {
    _datepicker: MatDatepicker<D>;
    protected _outsideValueChanged: undefined;
    protected _validator: ValidatorFn | null;
    get dateFilter(): DateFilterFn<D | null>;
    set dateFilter(value: DateFilterFn<D | null>);
    set matDatepicker(datepicker: MatDatepicker<D>);
    get max(): D | null;
    set max(value: D | null);
    get min(): D | null;
    set min(value: D | null);
    constructor(elementRef: ElementRef<HTMLInputElement>, dateAdapter: DateAdapter<D>, dateFormats: MatDateFormats, _formField: MatFormField);
    protected _assignValueToModel(value: D | null): void;
    protected _getDateFilter(): DateFilterFn<D | null>;
    protected _getMaxDate(): D | null;
    protected _getMinDate(): D | null;
    protected _getValueFromModel(modelValue: D | null): D | null;
    protected _openPopup(): void;
    getConnectedOverlayOrigin(): ElementRef;
    getPopupConnectionElementRef(): ElementRef;
    getStartValue(): D | null;
    getThemePalette(): ThemePalette;
    static ngAcceptInputType_value: any;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatDatepickerInput<any>, "input[matDatepicker]", ["matDatepickerInput"], { "matDatepicker": "matDatepicker"; "min": "min"; "max": "max"; "dateFilter": "matDatepickerFilter"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatDatepickerInput<any>>;
}

export declare class MatDatepickerInputEvent<D, S = unknown> {
    target: MatDatepickerInputBase<S, D>;
    targetElement: HTMLElement;
    value: D | null;
    constructor(
    target: MatDatepickerInputBase<S, D>,
    targetElement: HTMLElement);
}

export declare class MatDatepickerIntl {
    calendarLabel: string;
    readonly changes: Subject<void>;
    nextMonthLabel: string;
    nextMultiYearLabel: string;
    nextYearLabel: string;
    openCalendarLabel: string;
    prevMonthLabel: string;
    prevMultiYearLabel: string;
    prevYearLabel: string;
    switchToMonthViewLabel: string;
    switchToMultiYearViewLabel: string;
    formatYearRange(start: string, end: string): string;
    static ɵfac: i0.ɵɵFactoryDef<MatDatepickerIntl>;
    static ɵprov: i0.ɵɵInjectableDef<MatDatepickerIntl>;
}

export declare class MatDatepickerModule {
    static ɵinj: i0.ɵɵInjectorDef<MatDatepickerModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatDatepickerModule, [typeof i1.MatCalendar, typeof i2.MatCalendarBody, typeof i3.MatDatepicker, typeof i4.MatDatepickerContent, typeof i5.MatDatepickerInput, typeof i6.MatDatepickerToggle, typeof i6.MatDatepickerToggleIcon, typeof i7.MatMonthView, typeof i8.MatYearView, typeof i9.MatMultiYearView, typeof i1.MatCalendarHeader, typeof i10.MatDateRangeInput, typeof i11.MatStartDate, typeof i11.MatEndDate, typeof i12.MatDateRangePicker], [typeof i13.CommonModule, typeof i14.MatButtonModule, typeof i15.MatDialogModule, typeof i16.OverlayModule, typeof i17.A11yModule, typeof i18.PortalModule], [typeof i1.MatCalendar, typeof i2.MatCalendarBody, typeof i3.MatDatepicker, typeof i4.MatDatepickerContent, typeof i5.MatDatepickerInput, typeof i6.MatDatepickerToggle, typeof i6.MatDatepickerToggleIcon, typeof i7.MatMonthView, typeof i8.MatYearView, typeof i9.MatMultiYearView, typeof i1.MatCalendarHeader, typeof i10.MatDateRangeInput, typeof i11.MatStartDate, typeof i11.MatEndDate, typeof i12.MatDateRangePicker]>;
}

export declare class MatDatepickerToggle<D> implements AfterContentInit, OnChanges, OnDestroy {
    _button: MatButton;
    _customIcon: MatDatepickerToggleIcon;
    _intl: MatDatepickerIntl;
    datepicker: MatDatepickerBase<MatDatepickerControl<any>, D>;
    disableRipple: boolean;
    get disabled(): boolean;
    set disabled(value: boolean);
    tabIndex: number | null;
    constructor(_intl: MatDatepickerIntl, _changeDetectorRef: ChangeDetectorRef, defaultTabIndex: string);
    _open(event: Event): void;
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatDatepickerToggle<any>, "mat-datepicker-toggle", ["matDatepickerToggle"], { "datepicker": "for"; "tabIndex": "tabIndex"; "disabled": "disabled"; "disableRipple": "disableRipple"; }, {}, ["_customIcon"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatDatepickerToggle<any>>;
}

export declare class MatDatepickerToggleIcon {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatDatepickerToggleIcon, "[matDatepickerToggleIcon]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatDatepickerToggleIcon>;
}

export declare class MatDateRangeInput<D> implements MatFormFieldControl<DateRange<D>>, MatDatepickerControl<D>, MatDateRangeInputParent<D>, AfterContentInit, OnDestroy {
    _ariaDescribedBy: string | null;
    _ariaLabelledBy: string | null;
    _disabledChange: Subject<boolean>;
    _endInput: MatEndDate<D>;
    _groupDisabled: boolean;
    _startInput: MatStartDate<D>;
    comparisonEnd: D | null;
    comparisonStart: D | null;
    controlType: string;
    get dateFilter(): DateFilterFn<D>;
    set dateFilter(value: DateFilterFn<D>);
    get disabled(): boolean;
    set disabled(value: boolean);
    get empty(): boolean;
    get errorState(): boolean;
    focused: boolean;
    id: string;
    get max(): D | null;
    set max(value: D | null);
    get min(): D | null;
    set min(value: D | null);
    ngControl: NgControl | null;
    placeholder: string;
    get rangePicker(): MatDateRangePicker<D>;
    set rangePicker(rangePicker: MatDateRangePicker<D>);
    get required(): boolean;
    set required(value: boolean);
    separator: string;
    get shouldLabelFloat(): boolean;
    stateChanges: Subject<void>;
    get value(): DateRange<D> | null;
    constructor(_changeDetectorRef: ChangeDetectorRef, _elementRef: ElementRef<HTMLElement>, control: ControlContainer, _dateAdapter: DateAdapter<D>, _formField?: MatFormField | undefined);
    _getInputMirrorValue(): string;
    _handleChildValueChange(): void;
    _openDatepicker(): void;
    _shouldHidePlaceholders(): boolean;
    getConnectedOverlayOrigin(): ElementRef;
    getStartValue(): D | null;
    getThemePalette(): ThemePalette;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    onContainerClick(): void;
    setDescribedByIds(ids: string[]): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_required: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatDateRangeInput<any>, "mat-date-range-input", ["matDateRangeInput"], { "rangePicker": "rangePicker"; "required": "required"; "dateFilter": "dateFilter"; "min": "min"; "max": "max"; "disabled": "disabled"; "separator": "separator"; "comparisonStart": "comparisonStart"; "comparisonEnd": "comparisonEnd"; }, {}, ["_startInput", "_endInput"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatDateRangeInput<any>>;
}

export declare class MatDateRangePicker<D> extends MatDatepickerBase<MatDateRangeInput<D>, DateRange<D>, D> {
    protected _forwardContentValues(instance: MatDatepickerContent<DateRange<D>, D>): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatDateRangePicker<any>, "mat-date-range-picker", ["matDateRangePicker"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatDateRangePicker<any>>;
}

export declare class MatEndDate<D> extends _MatDateRangeInputBase<D> implements CanUpdateErrorState {
    protected _validator: ValidatorFn | null;
    protected _assignValueToModel(value: D | null): void;
    protected _getValueFromModel(modelValue: DateRange<D>): D | null;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatEndDate<any>, "input[matEndDate]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatEndDate<any>>;
}

export declare class MatMonthView<D> implements AfterContentInit, OnDestroy {
    _comparisonRangeEnd: number | null;
    _comparisonRangeStart: number | null;
    _dateAdapter: DateAdapter<D>;
    _firstWeekOffset: number;
    _matCalendarBody: MatCalendarBody;
    _monthLabel: string;
    _rangeEnd: number | null;
    _rangeStart: number | null;
    _todayDate: number | null;
    readonly _userSelection: EventEmitter<void>;
    _weekdays: {
        long: string;
        narrow: string;
    }[];
    _weeks: MatCalendarCell[][];
    get activeDate(): D;
    set activeDate(value: D);
    readonly activeDateChange: EventEmitter<D>;
    comparisonEnd: D | null;
    comparisonStart: D | null;
    dateClass: (date: D) => MatCalendarCellCssClasses;
    dateFilter: (date: D) => boolean;
    get maxDate(): D | null;
    set maxDate(value: D | null);
    get minDate(): D | null;
    set minDate(value: D | null);
    get selected(): DateRange<D> | D | null;
    set selected(value: DateRange<D> | D | null);
    readonly selectedChange: EventEmitter<D | null>;
    constructor(_changeDetectorRef: ChangeDetectorRef, _dateFormats: MatDateFormats, _dateAdapter: DateAdapter<D>, _dir?: Directionality | undefined);
    _dateSelected(date: number): void;
    _focusActiveCell(): void;
    _handleCalendarBodyKeydown(event: KeyboardEvent): void;
    _init(): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatMonthView<any>, "mat-month-view", ["matMonthView"], { "activeDate": "activeDate"; "selected": "selected"; "minDate": "minDate"; "maxDate": "maxDate"; "dateFilter": "dateFilter"; "dateClass": "dateClass"; "comparisonStart": "comparisonStart"; "comparisonEnd": "comparisonEnd"; }, { "selectedChange": "selectedChange"; "_userSelection": "_userSelection"; "activeDateChange": "activeDateChange"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatMonthView<any>>;
}

export declare class MatMultiYearView<D> implements AfterContentInit, OnDestroy {
    _dateAdapter: DateAdapter<D>;
    _matCalendarBody: MatCalendarBody;
    _selectedYear: number | null;
    _todayYear: number;
    _years: MatCalendarCell[][];
    get activeDate(): D;
    set activeDate(value: D);
    readonly activeDateChange: EventEmitter<D>;
    dateFilter: (date: D) => boolean;
    get maxDate(): D | null;
    set maxDate(value: D | null);
    get minDate(): D | null;
    set minDate(value: D | null);
    get selected(): DateRange<D> | D | null;
    set selected(value: DateRange<D> | D | null);
    readonly selectedChange: EventEmitter<D>;
    readonly yearSelected: EventEmitter<D>;
    constructor(_changeDetectorRef: ChangeDetectorRef, _dateAdapter: DateAdapter<D>, _dir?: Directionality | undefined);
    _focusActiveCell(): void;
    _getActiveCell(): number;
    _handleCalendarBodyKeydown(event: KeyboardEvent): void;
    _init(): void;
    _yearSelected(year: number): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatMultiYearView<any>, "mat-multi-year-view", ["matMultiYearView"], { "activeDate": "activeDate"; "selected": "selected"; "minDate": "minDate"; "maxDate": "maxDate"; "dateFilter": "dateFilter"; }, { "selectedChange": "selectedChange"; "yearSelected": "yearSelected"; "activeDateChange": "activeDateChange"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatMultiYearView<any>>;
}

export declare class MatStartDate<D> extends _MatDateRangeInputBase<D> implements CanUpdateErrorState {
    protected _validator: ValidatorFn | null;
    protected _assignValueToModel(value: D | null): void;
    protected _formatValue(value: D | null): void;
    protected _getValueFromModel(modelValue: DateRange<D>): D | null;
    getMirrorValue(): string;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatStartDate<any>, "input[matStartDate]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatStartDate<any>>;
}

export declare class MatYearView<D> implements AfterContentInit, OnDestroy {
    _dateAdapter: DateAdapter<D>;
    _matCalendarBody: MatCalendarBody;
    _months: MatCalendarCell[][];
    _selectedMonth: number | null;
    _todayMonth: number | null;
    _yearLabel: string;
    get activeDate(): D;
    set activeDate(value: D);
    readonly activeDateChange: EventEmitter<D>;
    dateFilter: (date: D) => boolean;
    get maxDate(): D | null;
    set maxDate(value: D | null);
    get minDate(): D | null;
    set minDate(value: D | null);
    readonly monthSelected: EventEmitter<D>;
    get selected(): DateRange<D> | D | null;
    set selected(value: DateRange<D> | D | null);
    readonly selectedChange: EventEmitter<D>;
    constructor(_changeDetectorRef: ChangeDetectorRef, _dateFormats: MatDateFormats, _dateAdapter: DateAdapter<D>, _dir?: Directionality | undefined);
    _focusActiveCell(): void;
    _handleCalendarBodyKeydown(event: KeyboardEvent): void;
    _init(): void;
    _monthSelected(month: number): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatYearView<any>, "mat-year-view", ["matYearView"], { "activeDate": "activeDate"; "selected": "selected"; "minDate": "minDate"; "maxDate": "maxDate"; "dateFilter": "dateFilter"; }, { "selectedChange": "selectedChange"; "monthSelected": "monthSelected"; "activeDateChange": "activeDateChange"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatYearView<any>>;
}

export declare const yearsPerPage = 24;

export declare const yearsPerRow = 4;
