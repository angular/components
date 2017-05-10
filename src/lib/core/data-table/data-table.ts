import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  Input,
  IterableChangeRecord,
  IterableChanges,
  IterableDiffer,
  IterableDiffers,
  QueryList,
  Renderer,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/combineLatest';
import {DataSource} from './data-source';

/**
 * Template to be used for the data cells of a particular column.
 */
@Directive({selector: '[cdkRowCellDef]'})
export class CdkRowCellDef {
  constructor(public template: TemplateRef<any>) { }
}

/**
 * Template to be used for the header cell of a particular column.
 */
@Directive({selector: '[cdkHeaderCellDef], cdk-column-def'})
export class CdkHeaderCellDef {
  constructor(public template: TemplateRef<any>) { }
}

/**
 * Column definition defined by the user. Contains the template definitions for the header cell
 * and data cells.
 */
@Directive({selector: '[cdkColumnDef]'})
export class CdkColumnDef {
  @Input('cdkColumnDef') name: string;

  @ContentChild(CdkRowCellDef) cell: CdkRowCellDef;
  @ContentChild(CdkHeaderCellDef) headerCell: CdkHeaderCellDef;
}

/**
 * Provides the template to use for the header row.
 */
@Directive({selector: '[cdkHeaderDef]'})
export class CdkHeaderDef {
  @Input('cdkHeaderDef') columns: string[];

  constructor(public template: TemplateRef<any>) { }
}

/** Provides the template to use for the data rows. */
@Directive({selector: '[cdkRowDef]'})
export class CdkRowDef {
  @Input('cdkRowDefColumns') columns: string[];

  // TODO: Add an input for providing a switch function to determine
  // if this template should be used.

  constructor(public template: TemplateRef<any>) { }
}

/** Header template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'cdk-header',
  template: '<ng-container cdkCellOutlet></ng-container>',
  host: {
    'class': 'mat-header',
    'role': 'row',
  },
})
export class CdkHeaderRow { }

/** Data row template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'cdk-row',
  template: '<ng-container cdkCellOutlet></ng-container>',
  host: {
    'class': 'mat-row',
    'role': 'row',
  },
})
export class CdkRow { }

/** Header cell template container that adds the right classes and role. */
@Directive({
  selector: 'cdk-header-cell',
  host: {
    'class': 'mat-header-cell',
    'role': 'columnheader',
  },
})
export class CdkHeaderCell {
  constructor(private columnDef: CdkColumnDef,
              private elementRef: ElementRef,
              private renderer: Renderer) {
    this.renderer.setElementClass(elementRef.nativeElement, `mat-column-${columnDef.name}`, true);
  }
}

/** Cell template container that adds the right classes and role. */
@Directive({
  selector: 'cdk-row-cell',
  host: {
    'class': 'mat-row-cell',
    'role': 'gridcell',
  },
})
export class CdkRowCell {
  constructor(private columnDef: CdkColumnDef,
              private elementRef: ElementRef,
              private renderer: Renderer) {
    this.renderer.setElementClass(elementRef.nativeElement, `mat-column-${columnDef.name}`, true);
  }
}

/**
 * Outlet used by the header and data rows that has the right column cells and holds the context.
 */
@Directive({selector: '[cdkCellOutlet]'})
export class CdkCellOutlet {
  cells: CdkRowCellDef[];
  context: any;

  static mostRecentCellOutlet: CdkCellOutlet = null;

  /**
   * Sets the most recently constructed CdkCellOutlet with the provided set of cells and context.
   */
  static setMostRecentCellOutletData(cells: CdkRowCellDef[], context: any = {}) {
    CdkCellOutlet.mostRecentCellOutlet.cells = cells;
    CdkCellOutlet.mostRecentCellOutlet.context = context;
  }

  constructor(private _viewContainer: ViewContainerRef) {
    CdkCellOutlet.mostRecentCellOutlet = this;
  }

  ngOnInit() {
    this.cells.forEach(cell => {
      this._viewContainer.createEmbeddedView(cell.template, this.context);
    });
  }
}

/**
 * Provides a handle for the table to grab the view container's ng-container to insert data rows.
 */
@Directive({selector: '[cdkRowPlaceholder]'})
export class CdkRowPlaceholder {
  constructor(public viewContainer: ViewContainerRef) { }
}

/**
 * Provides a handle for the table to grab the view container's ng-container to insert the header.
 */
@Directive({selector: '[cdkHeaderRowPlaceholder]'})
export class CdkHeaderRowPlaceholder {
  constructor(public viewContainer: ViewContainerRef) { }
}

export interface CdkTableViewData {
  start: number;
  end: number;
}

@Component({
  selector: 'cdk-table',
  template: `
    <ng-container cdkHeaderRowPlaceholder></ng-container>
    <ng-container cdkRowPlaceholder></ng-container>
  `,
  host: {
    'class': 'mat-table',
    'role': 'grid' // TODO: Allow the user to choose either grid or treegrid
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkTable {
  /**
   * Provides a stream containing the latest data array to render. Influenced by the table's
   * stream of view window (what rows are currently on screen).
   */
  @Input() dataSource: DataSource<any>;

  /**
   * Stream containing the latest information on what rows are being displayed on screen. Offered
   * to the data source as a hueristic of what data should be provided.
   */
  // TODO: Remove max value as the end index and instead calculate the view on init and scroll.
  viewChange = new BehaviorSubject<CdkTableViewData>({start: 0, end: Number.MAX_VALUE});

  /**
   * Map of all the user's defined columns identified by name.
   * Contains the header and data-cell templates.
   */
  private _columnMap = new Map<ConstrainDOMString,  CdkColumnDef>();

  // Placeholders within the table's template where the header and data rows will be inserted.
  @ViewChild(CdkRowPlaceholder) rowPlaceholder: CdkRowPlaceholder;
  @ViewChild(CdkHeaderRowPlaceholder) headerRowPlaceholder: CdkHeaderRowPlaceholder;

  /**
   * The column definitions provided by the user that contain what the header and cells should
   * render for each column.
   */
  @ContentChildren(CdkColumnDef) columnDefinitions: QueryList<CdkColumnDef>;

  /** Template used as the header container. */
  @ContentChild(CdkHeaderDef) headerDefinition: CdkHeaderDef;

  /** Set of templates that used as the data row containers. */
  @ContentChildren(CdkRowDef) rowDefinitions: QueryList<CdkRowDef>;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {}

  ngOnDestroy() {
    // TODO: Disconnect from the data source so that it can unsubscribe from its streams.
  }

  ngOnInit() {
    // TODO: Setup a listener for scroll events and emit the calculated view to this.viewChange
  }

  ngAfterContentInit() {
    this.columnDefinitions.forEach(columnDef => this._columnMap.set(columnDef.name, columnDef));
  }

  ngAfterViewInit() {
    // TODO: Re-render the header when the header's columns change.
    this.renderHeaderRow();

    // TODO: Re-render rows when their list of columns change.
    // TODO: If the data source is not present after view init, connect it when it is defined.
    const connectFn = this.dataSource.connectTable.bind(this.dataSource);
    this.viewChange.let(connectFn).subscribe((rowsData: any[]) => {
      // TODO: Add a differ that will check if the data has changed,
      // rather than re-rendering all rows
      this.rowPlaceholder.viewContainer.clear();
      rowsData.forEach(rowData => this.insertRow(rowData));
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Create the embedded view for the header template and place it in the header row view container.
   */
  renderHeaderRow() {
    const cells = this.getHeaderCellTemplatesForRow(this.headerDefinition);

    // TODO: add some code to enforce that exactly one CdkCellOutlet was instantiated as a result
    // of `createEmbeddedView`.
    this.headerRowPlaceholder.viewContainer
        .createEmbeddedView(this.headerDefinition.template, {cells});
    CdkCellOutlet.setMostRecentCellOutletData(cells);
  }

  /**
   * Create the embedded view for the data row template and place it in the correct index location
   * within the data row view container.
   */
  insertRow(rowData: any) {
    // TODO: Add when predicates to the row definitions to find the right template to used based on
    // the data rather than choosing the first row definition.
    const row = this.rowDefinitions.first;

    const context = {$implicit: rowData};

    // TODO: add some code to enforce that exactly one CdkCellOutlet was instantiated as a result
    // of `createEmbeddedView`.
    this.rowPlaceholder.viewContainer.createEmbeddedView(row.template, context);

    // Insert empty cells if there is no data to improve rendering time.
    const cells = rowData ? this.getCellTemplatesForRow(row) : [];
    CdkCellOutlet.setMostRecentCellOutletData(cells, context);
  }

  /**
   * Returns the cell template definitions to insert into the header
   * as defined by its list of columns to display.
   */
  getHeaderCellTemplatesForRow(headerDef: CdkHeaderDef): CdkHeaderCellDef[] {
    return headerDef.columns.map(columnId => this._columnMap.get(columnId).headerCell);
  }

  /**
   * Returns the cell template definitions to insert in the provided row
   * as defined by its list of columns to display.
   */
  getCellTemplatesForRow(rowDef: CdkRowDef): CdkRowCellDef[] {
    return rowDef.columns.map(columnId => this._columnMap.get(columnId).cell);
  }
}
