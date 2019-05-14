export declare type ArrowViewState = SortDirection | 'hint' | 'active';

export interface ArrowViewStateTransition {
    fromState?: ArrowViewState;
    toState: ArrowViewState;
}

export declare const MAT_SORT_HEADER_INTL_PROVIDER: {
    provide: typeof MatSortHeaderIntl;
    deps: Optional[][];
    useFactory: typeof MAT_SORT_HEADER_INTL_PROVIDER_FACTORY;
};

export declare function MAT_SORT_HEADER_INTL_PROVIDER_FACTORY(parentIntl: MatSortHeaderIntl): MatSortHeaderIntl;

export declare class MatSort extends _MatSortMixinBase implements CanDisable, HasInitialized, OnChanges, OnDestroy, OnInit, MatSortContainer<MatSortSortableState> {
    active: string;
    direction: SortDirection;
    disableClear: boolean;
    readonly sortChange: EventEmitter<Sort>;
    sortables: Map<string, MatSortable>;
    start: 'asc' | 'desc';
    readonly stateChanges: Subject<void>;
    deregister(sortable: MatSortable): void;
    getNextSortDirection(sortable: MatSortable): SortDirection;
    getSortableState(sortable: MatSortable): MatSortSortableState;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    register(sortable: MatSortable): void;
    sort(sortable: MatSortable): void;
}

export declare const matSortAnimations: {
    readonly indicator: AnimationTriggerMetadata;
    readonly leftPointer: AnimationTriggerMetadata;
    readonly rightPointer: AnimationTriggerMetadata;
    readonly arrowOpacity: AnimationTriggerMetadata;
    readonly arrowPosition: AnimationTriggerMetadata;
    readonly allowChildren: AnimationTriggerMetadata;
};

export declare class MatSortHeader extends _MatSortHeaderMixinBase implements CanDisable, MatSortable, OnDestroy, OnInit {
    _arrowDirection: SortDirection;
    _columnDef: MatSortHeaderColumnDef;
    _disableViewStateAnimation: boolean;
    _intl: MatSortHeaderIntl;
    _showIndicatorHint: boolean;
    _viewState: ArrowViewStateTransition;
    arrowPosition: 'before' | 'after';
    disableClear: boolean;
    id: string;
    protected sortContainer: MatSortContainer<SortableState>;
    start: 'asc' | 'desc';
    constructor(_intl: MatSortHeaderIntl, changeDetectorRef: ChangeDetectorRef, _columnDef: MatSortHeaderColumnDef, sortContainer: MatSortContainer<SortableState>);
    _getAriaSortAttribute(): "ascending" | "descending" | null;
    _getArrowDirectionState(): string;
    _getArrowViewState(): string;
    _handleClick(): void;
    _isDisabled(): boolean;
    _isSorted(): boolean;
    _renderArrow(): boolean;
    _setAnimationTransitionState(viewState: ArrowViewStateTransition): void;
    _setIndicatorHintVisible(visible: boolean): void;
    _updateArrowDirection(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
}

export declare class MatSortHeaderIntl {
    readonly changes: Subject<void>;
    sortButtonLabel: (id: string) => string;
}

export declare class MatSortModule {
}

export interface MatSortSortableState extends SortableState {
    active: string;
}

export interface Sort {
    active: string;
    direction: SortDirection;
}

export declare type SortDirection = 'asc' | 'desc' | '';
