import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

/**
 * Possible ordering for sorting.
 */
export type MdTableSortOrder = 'ascending' | 'descending';

/**
 * Event fired when sort changes.
 */
export interface MdTableSortData {
  sortColumn: string;
  sortOrder: MdTableSortOrder;
}

/**
 * Configures and keeps track of the table sort. The table listens to changes
 * in this service and stays in sync.
 */
@Injectable()
export class MdTableSortService {
  private sortSubject: BehaviorSubject<MdTableSortData>;

  /**
   * The default sort order for the table. If no default is provided, the table
   * will begin sorting in ascending order.
   */
  defaultSortOrder: MdTableSortOrder = 'ascending';

  /**
   * The initial column to sort the table by. If no column is set, the table
   * will be initialized without sorting.
   */
  set initialSortColumn(sortColumn: string) { this.sortColumn = sortColumn; }
  get initialSortColumn(): string { return this.sortColumn; }

  sortOrder: MdTableSortOrder = 'ascending';
  private _sortColumn: string;

  /**
   * Updates the sortColumn and sortDirection when the header cell is clicked.
   * If the sortColumn was already active, reverses the sortDirection.
   */
  set sortColumn(newSortColumn: string) {
    if (newSortColumn === this.sortColumn) {
      this.sortOrder =
          this.sortOrder === 'ascending' ? 'descending' : 'ascending';
    } else {
      this._sortColumn = newSortColumn;
      this.sortOrder = this.defaultSortOrder;
    }

    this.initSortSubject();
    this.sortSubject.next(
        {sortColumn: this._sortColumn, sortOrder: this.sortOrder});
  }

  get sortColumn(): string {
    return this._sortColumn;
  }

  getSortData(): Observable<MdTableSortData> {
    this.initSortSubject();
    return this.sortSubject.asObservable();
  }

  /**
   * Creates the sort subject on the first usage. If the subject was already
   * initialized, this is a no-op.
   */
  private initSortSubject() {
    if (!this.sortSubject) {
      this.sortSubject = new BehaviorSubject<MdTableSortData>(
          {sortOrder: this.sortOrder, sortColumn: this.sortColumn});
    }
  }
}