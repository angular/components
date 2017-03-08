import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {MdTableDataSource} from './data-source';
import {MdTableInvalidDataSourceError} from './data-table-errors';
import {MdTableSortData, MdTableSortOrder, MdTableSortService} from './sort-service';

/**
 * Type for the mdRowContextWhen method. Takes in the current row in the ngFor
 * loop as well as the collection of ngFor properties. Returns whether to show
 * the given row.
 */
export interface MdRowContextWhenFunction {
  (row?: any, ngForContext?: NgForContext): boolean;
}

/**
 * Passed in values to the MdRowContextWhenFunction. These properties are
 * copied from the ngFor loop, which allow you access to loop variables when
 * determining to render a row template.
 */
export interface NgForContext {
  index: number;
  first: boolean;
  last: boolean;
  even: boolean;
  odd: boolean;
}

/**
 * A header cell in the md-data-table. Custom classes can be added to the
 * md-header-cell element to style the cell.
 */
@Directive({
  selector: 'md-header-cell',
  host: {
    '[class.mat-table-header-cell]': 'true',
    'role': 'columnheader',
    '(click)': 'updateSortColumn($event)',
    '[class.mat-table-sortable]': 'sortKey',
    '[class.mat-table-sort-descending]': 'isDescending',
    '[class.mat-table-sort-ascending]': 'isAscending',
  },
})
export class MdHeaderCell implements OnInit, OnDestroy {
  isDescending: boolean;
  isAscending: boolean;

  sortSubscription: Subscription;

  @Input() sortKey: string|undefined;

  constructor(private _sortService: MdTableSortService) {}

  ngOnInit() {
    this.sortSubscription =
        this._sortService.getSortData().subscribe(sortData => {
          const isActive = sortData.sortColumn === this.sortKey;
          this.isDescending = isActive && (sortData.sortOrder === 'descending');
          this.isAscending = isActive && (sortData.sortOrder === 'ascending');
        });
  }

  ngOnDestroy() {
    this.sortSubscription.unsubscribe();
  }

  updateSortColumn(event: Event) {
    if (this.sortKey) {
      this._sortService.sortColumn = this.sortKey;
    }
  }
}


/**
 * A header row in the md-data-table. Custom classes can be added to the
 * md-header-row element to style the header.
 */
@Directive({
  selector: 'md-header-row',
  host: {
    '[class.mat-table-header-row]': 'true',
    'role': 'row',
  },
})
export class MdHeaderRow {
  @ContentChildren(MdHeaderCell) cells: QueryList<MdHeaderCell>;
}


/**
 * A cell in the md-data-table. Custom classes can be added to the md-cell
 * element to style the cell.
 */
@Directive({
  selector: 'md-cell',
  host: {
    '[class.mat-table-cell]': 'true',
    'role': 'gridcell',
  },
})
export class MdCell {
}


/**
 * A row in the md-data-table. Custom classes can be added to the md-row
 * element to style the row.
 */
@Directive({
  selector: 'md-row',
  host: {
    '[class.mat-table-row]': 'true',
    'role': 'row',
  },
})
export class MdRow {
}


/**
 * The context directive for the `md-row` element. This template is stamped out
 * for the number of rows in the table.
 *
 * To customize the rows that are rendered, `MdRowContext` supports a
 * `when` option. This option tells the table when to render a row. If
 * multiple rowContexts match a given row, only the first will be rendered.
 */
@Directive({selector: '[mdRowContext]'})
export class MdRowContext {
  @ContentChildren(MdCell) cells: QueryList<MdCell>;

  private _when: MdRowContextWhenFunction;

  @Input()
  set mdRowContextWhen(value: MdRowContextWhenFunction) {
    this._when = value;
  }

  get mdRowContextWhen(): MdRowContextWhenFunction {
    return this._when;
  }

  constructor(public template: TemplateRef<MdRowContext>) {}
}


/**
 * A material design table component. In order to use the md-data-table, a
 * dataSource must be provided which implements the MdTableDataSource. The
 * table should contain md-row, mdRowContext, and md-cell directives.
 *
 * Example Use:
 * <md-data-table [dataSource]="dataSource">
 *   <md-header-row>
 *     <md-header-cell>Name</md-header-cell>
 *     <md-header-cell>Email</md-header-cell>
 *   <md-header-row>
 *   <md-row *mdRowContext="let row = row; when: mySuperCoolWhenFn">
 *     <md-cell>{{row.name}}</md-cell>
 *     <md-cell>{{row.email}}</md-cell>
 *   </md-row>
 * </md-data-table>
 */
@Component({
  moduleId: module.id,
  selector: 'md-data-table',
  templateUrl: 'data-table.html',
  host: {
    '[class.mat-table]': 'true',
    'role': 'grid',
  },
  styleUrls: ['data-table.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MdTableSortService],
})
export class MdDataTable implements OnInit, OnDestroy {
  /**
   * The dataSource for the table rows. Not passing in a dataSource will
   * result in an MdTableInvalidDataSourceError exception.
   */
  @Input() dataSource: MdTableDataSource<any>;

  /**
   * The sort order of the first click on a header. If no default is provided,
   * the table will sort in ascending order.
   */
  @Input()
  set defaultSortOrder(sortOrder: MdTableSortOrder) {
    this._sortService.defaultSortOrder = sortOrder;
  }
  get defaultSortOrder(): MdTableSortOrder { return this._sortService.defaultSortOrder; }

  /**
   * The initial column to sort the table by. If no column is set, the table
   * will be initialized without sorting.
   */
  @Input()
  set initialSortColumn(sortColumn: string) { this._sortService.initialSortColumn = sortColumn; }
  get initialSortColumn(): string { return this._sortService.initialSortColumn; }

  @ContentChildren(MdRowContext) rowContexts: QueryList<MdRowContext>;

  @Output() onReload = new EventEmitter<void>();
  @Output() onSort = new EventEmitter<MdTableSortData>();

  rows: any[];
  rowCount: number;
  rowSubscription: Subscription;
  sortSubscription: Subscription;

  constructor(
      private _changeDetectorRef: ChangeDetectorRef,
      private _sortService: MdTableSortService) {}

  ngOnInit() {
    if (!this.dataSource) {
      throw new MdTableInvalidDataSourceError();
    }

    this.rowSubscription = this.dataSource.getRows().subscribe(result => {
      this.rows = result.rows;
      this.rowCount = result.rowCount;
      this._changeDetectorRef.markForCheck();
      this.onReload.emit();
    });

    this.sortSubscription =
        this._sortService.getSortData().subscribe(sortData => {
          this.onSort.emit(sortData);
        });
  }

  ngOnDestroy() {
    this.rowSubscription.unsubscribe();
    this.sortSubscription.unsubscribe();
  }

  /**
   * Returns true if the row is the last one.
   */
  isLast(index: number): boolean {
    return index === this.rowCount - 1;
  }

  /**
   * Returns the first template that matches the row.
   */
  getTemplateForRow(
      row: any, index: number, first: boolean, even: boolean,
      odd: boolean): TemplateRef<MdRowContext> {
    const ngForContext: NgForContext = {
      index,
      first,
      even,
      odd,
      last: this.isLast(index),
    };

    return this.rowContexts
        .find(rowContext => {
          const whenFunction = rowContext.mdRowContextWhen;
          return whenFunction ? whenFunction(row, ngForContext) : true;
        })
        .template;
  }
}