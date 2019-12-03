export interface ActionListHarnessFilters extends BaseHarnessFilters {
}

export interface ActionListItemHarnessFilters extends BaseListItemHarnessFilters {
}

export interface BaseListItemHarnessFilters extends BaseHarnessFilters {
    text?: string | RegExp;
}

export interface ListHarnessFilters extends BaseHarnessFilters {
}

export interface ListItemHarnessFilters extends BaseListItemHarnessFilters {
}

export interface ListOptionHarnessFilters extends BaseListItemHarnessFilters {
    selected?: boolean;
}

export interface ListSection<I> {
    heading?: string;
    items: I[];
}

export declare class MatActionListHarness extends MatListHarnessBase<typeof MatActionListItemHarness, MatActionListItemHarness, ActionListItemHarnessFilters> {
    _itemHarness: typeof MatActionListItemHarness;
    static hostSelector: string;
    static with(options?: ActionListHarnessFilters): HarnessPredicate<MatActionListHarness>;
}

export declare class MatActionListItemHarness extends MatListItemHarnessBase {
    blur(): Promise<void>;
    click(): Promise<void>;
    focus(): Promise<void>;
    static hostSelector: string;
    static with(options?: ActionListItemHarnessFilters): HarnessPredicate<MatActionListItemHarness>;
}

export declare class MatListHarness extends MatListHarnessBase<typeof MatListItemHarness, MatListItemHarness, ListItemHarnessFilters> {
    _itemHarness: typeof MatListItemHarness;
    static hostSelector: string;
    static with(options?: ListHarnessFilters): HarnessPredicate<MatListHarness>;
}

export declare class MatListHarnessBase<T extends (ComponentHarnessConstructor<C> & {
    with: (options?: BaseHarnessFilters) => HarnessPredicate<C>;
}), C extends ComponentHarness, F extends BaseListItemHarnessFilters> extends ComponentHarness {
    protected _itemHarness: T;
    getItems(filters?: F): Promise<C[]>;
    getItemsBySubheader(filters?: F): Promise<ListSection<C>[]>;
    getItemsDivided(filters?: F): Promise<C[][]>;
    getItemsSubheadersAndDividers(filters: {
        item: false;
        subheader: false;
        divider: false;
    }): Promise<[]>;
    getItemsSubheadersAndDividers(filters: {
        item?: F | false;
        subheader: false;
        divider: false;
    }): Promise<C[]>;
    getItemsSubheadersAndDividers(filters: {
        item: false;
        subheader?: SubheaderHarnessFilters | false;
        divider: false;
    }): Promise<MatSubheaderHarness[]>;
    getItemsSubheadersAndDividers(filters: {
        item: false;
        subheader: false;
        divider?: DividerHarnessFilters | false;
    }): Promise<MatDividerHarness[]>;
    getItemsSubheadersAndDividers(filters: {
        item?: F | false;
        subheader?: SubheaderHarnessFilters | false;
        divider: false;
    }): Promise<(C | MatSubheaderHarness)[]>;
    getItemsSubheadersAndDividers(filters: {
        item?: F | false;
        subheader: false;
        divider?: false | DividerHarnessFilters;
    }): Promise<(C | MatDividerHarness)[]>;
    getItemsSubheadersAndDividers(filters: {
        item: false;
        subheader?: false | SubheaderHarnessFilters;
        divider?: false | DividerHarnessFilters;
    }): Promise<(MatSubheaderHarness | MatDividerHarness)[]>;
    getItemsSubheadersAndDividers(filters?: {
        item?: F | false;
        subheader?: SubheaderHarnessFilters | false;
        divider?: DividerHarnessFilters | false;
    }): Promise<(C | MatSubheaderHarness | MatDividerHarness)[]>;
}

export declare class MatListItemHarness extends MatListItemHarnessBase {
    static hostSelector: string;
    static with(options?: ListItemHarnessFilters): HarnessPredicate<MatListItemHarness>;
}

export declare class MatListItemHarnessBase extends ComponentHarness {
    getHarnessLoaderForContent(): Promise<HarnessLoader>;
    getLines(): Promise<string[]>;
    getText(): Promise<string>;
    hasAvatar(): Promise<boolean>;
    hasIcon(): Promise<boolean>;
}

export declare class MatListOptionHarness extends MatListItemHarnessBase {
    blur(): Promise<void>;
    check(): Promise<void>;
    focus(): Promise<void>;
    getCheckboxPosition(): Promise<'before' | 'after'>;
    isDisabled(): Promise<boolean>;
    isSelected(): Promise<boolean>;
    toggle(): Promise<void>;
    uncheck(): Promise<void>;
    static hostSelector: string;
    static with(options?: ListOptionHarnessFilters): HarnessPredicate<MatListOptionHarness>;
}

export declare class MatNavListHarness extends MatListHarnessBase<typeof MatNavListItemHarness, MatNavListItemHarness, NavListItemHarnessFilters> {
    _itemHarness: typeof MatNavListItemHarness;
    static hostSelector: string;
    static with(options?: NavListHarnessFilters): HarnessPredicate<MatNavListHarness>;
}

export declare class MatNavListItemHarness extends MatListItemHarnessBase {
    blur(): Promise<void>;
    click(): Promise<void>;
    focus(): Promise<void>;
    getHref(): Promise<string | null>;
    static hostSelector: string;
    static with(options?: NavListItemHarnessFilters): HarnessPredicate<MatNavListItemHarness>;
}

export declare class MatSelectionListHarness extends MatListHarnessBase<typeof MatListOptionHarness, MatListOptionHarness, ListOptionHarnessFilters> {
    _itemHarness: typeof MatListOptionHarness;
    checkItems(...filters: ListOptionHarnessFilters[]): Promise<void>;
    isDisabled(): Promise<boolean>;
    uncheckItems(...filters: ListItemHarnessFilters[]): Promise<void>;
    static hostSelector: string;
    static with(options?: SelectionListHarnessFilters): HarnessPredicate<MatSelectionListHarness>;
}

export declare class MatSubheaderHarness extends ComponentHarness {
    getText(): Promise<string>;
    static hostSelector: string;
    static with(options?: SubheaderHarnessFilters): HarnessPredicate<MatSubheaderHarness>;
}

export interface NavListHarnessFilters extends BaseHarnessFilters {
}

export interface NavListItemHarnessFilters extends BaseListItemHarnessFilters {
    href?: string | RegExp | null;
}

export interface SelectionListHarnessFilters extends BaseHarnessFilters {
}

export interface SubheaderHarnessFilters extends BaseHarnessFilters {
    text?: string | RegExp;
}
