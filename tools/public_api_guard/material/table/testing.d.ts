export interface CellHarnessFilters extends BaseHarnessFilters {
    text?: string | RegExp;
}

export declare class MatCellHarness extends ComponentHarness {
    getColumnName(): Promise<string>;
    getText(): Promise<string>;
    static hostSelector: string;
    static with(options?: CellHarnessFilters): HarnessPredicate<MatCellHarness>;
}

export declare class MatFooterCellHarness extends MatCellHarness {
    static hostSelector: string;
    static with(options?: CellHarnessFilters): HarnessPredicate<MatFooterCellHarness>;
}

export declare class MatFooterRowHarness extends ComponentHarness {
    getCells(filter?: CellHarnessFilters): Promise<MatFooterCellHarness[]>;
    getData(filter?: CellHarnessFilters): Promise<MatRowHarnessData>;
    static hostSelector: string;
    static with(options?: RowHarnessFilters): HarnessPredicate<MatFooterRowHarness>;
}

export declare class MatHeaderCellHarness extends MatCellHarness {
    static hostSelector: string;
    static with(options?: CellHarnessFilters): HarnessPredicate<MatHeaderCellHarness>;
}

export declare class MatHeaderRowHarness extends ComponentHarness {
    getCells(filter?: CellHarnessFilters): Promise<MatHeaderCellHarness[]>;
    getData(filter?: CellHarnessFilters): Promise<MatRowHarnessData>;
    static hostSelector: string;
    static with(options?: RowHarnessFilters): HarnessPredicate<MatHeaderRowHarness>;
}

export declare class MatRowHarness extends ComponentHarness {
    getCells(filter?: CellHarnessFilters): Promise<MatCellHarness[]>;
    getData(filter?: CellHarnessFilters): Promise<MatRowHarnessData>;
    static hostSelector: string;
    static with(options?: RowHarnessFilters): HarnessPredicate<MatRowHarness>;
}

export declare type MatRowHarnessData = {
    columnName: string;
    text: string;
}[];

export declare class MatTableHarness extends ComponentHarness {
    getColumnsData(): Promise<MatTableHarnessColumnsData>;
    getFooterRows(filter?: RowHarnessFilters): Promise<MatFooterRowHarness[]>;
    getHeaderRows(filter?: RowHarnessFilters): Promise<MatHeaderRowHarness[]>;
    getRows(filter?: RowHarnessFilters): Promise<MatRowHarness[]>;
    getRowsData(): Promise<MatTableHarnessRowsData>;
    static hostSelector: string;
    static with(options?: TableHarnessFilters): HarnessPredicate<MatTableHarness>;
}

export interface MatTableHarnessColumnsData {
    [columnName: string]: {
        text: string[];
        headerText: string;
        footerText: string;
    };
}

export declare type MatTableHarnessRowsData = {
    columnName: string;
    text: string;
}[][];

export interface RowHarnessFilters extends BaseHarnessFilters {
}

export interface TableHarnessFilters extends BaseHarnessFilters {
}
