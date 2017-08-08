/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DataSource} from '@angular/cdk/table';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {MdPaginator, PageEvent} from '../paginator/index';
import {MdSort, Sort, SortDirection} from '../sort/index';
import {Subject} from 'rxjs/Subject';
import {merge} from 'rxjs/observable/merge';
import {Subscription} from 'rxjs/Subscription';

/**
 * Array-based data source that can be used to connect to a CollectionViewer. Will trigger an
 * update to the CollectionViewer whenever a new data array is set.
 */
export class MdTableDataSource<T> implements DataSource<T> {
  /** Stream provided to the table that sends an event whenever new render data is evaluated. */
  private _renderDataChange = new BehaviorSubject<T[]>([]);

  /**
   * Stream provided to the table that sends an event whenever the ordered data has changed, either
   * through base data changes or sort changes.
   */
  private _orderedDataChange = new BehaviorSubject<T[]>([]);

  /** Subscription that listens for any change events in the ordered data. */
  private _orderedDataChangeSubscription: Subscription|null = null;

  /** Subscription that listens for any change events in the rendered paged data. */
  private _renderedDataChangeSubscription: Subscription|null = null;

  /** Stream that emits when a new data array is set on the data source. */
  private _data: BehaviorSubject<T[]>;
  set data(data: T[]) { this._data.next(data); }
  get data() { return this._data.value; }

  set sort(sort: MdSort) {
    this._sort = sort;
    this._subscribeToOrderedDataChanges();
  }

  set paginator(paginator: MdPaginator) {
    this._paginator = paginator;
    this._subscribeToRenderedDataChanges();
  }

  /**
   * Accessor function used to get a data object value assigned to a particular column. By default
   * the function uses the column name as the data property name. Used for sorting.
   */
  public dataAccessor = (data: T, columnName: string): string|number => {
    const property: number|string = data[columnName];
    return isNaN(+property) ? property : +property;
  }

  constructor(initialData: T[] = [],
              private _sort: MdSort|null = null,
              private _paginator: MdPaginator|null = null) {
    this._data = new BehaviorSubject<T[]>(initialData);
    this._subscribeToOrderedDataChanges();
    this._subscribeToRenderedDataChanges();
  }

  /**
   * Subscribes to all changes that affect the data and its order. Unsubscribes from the existing
   * subscription if one exists.
   */
  _subscribeToOrderedDataChanges() {
    if (this._orderedDataChangeSubscription) {
      this._orderedDataChangeSubscription.unsubscribe();
      this._orderedDataChangeSubscription = null;
    }

    const orderedDataChanges: Subject<T[]|Sort>[] = [this._data];
    if (this._sort) { orderedDataChanges.push(this._sort.mdSortChange); }
    this._orderedDataChangeSubscription = merge(...orderedDataChanges).subscribe(() => {
      let orderedData = this.data.slice();
      if (this._sort) {
        orderedData = this._sortData(orderedData, this._sort.active, this._sort.direction);
      }
      this._orderedDataChange.next(orderedData);
    });
  }

  /**
   * Subscribes to all changes that affect what data should be rendered to the table. Unsubscribes
   * from the existing subscription if one exists.
   */
  _subscribeToRenderedDataChanges() {
    if (this._renderedDataChangeSubscription) {
      this._renderedDataChangeSubscription.unsubscribe();
      this._renderedDataChangeSubscription = null;
    }

    const renderedDataChanges: Subject<T[]|PageEvent>[] = [this._orderedDataChange];
    if (this._paginator) { renderedDataChanges.push(this._paginator.page); }
    this._renderedDataChangeSubscription = merge(...renderedDataChanges).subscribe(() => {
      let pagedData = this._orderedDataChange.value.slice();

      if (this._paginator) {
        console.log('Paging data');
        const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
        pagedData = pagedData.splice(startIndex, this._paginator.pageSize);
      }

      this._renderDataChange.next(pagedData);
    });
  }

  _sortData(data: T[], active: string, direction: SortDirection): T[] {
    console.log('Sorting data');
    if (!active || direction == '') { return data; }

    return data.sort((a, b) => {
      let valueA = this.dataAccessor(a, active);
      let valueB = this.dataAccessor(b, active);
      return (valueA < valueB ? -1 : 1) * (direction == 'asc' ? 1 : -1);
    });
  }

  /**
   * Used by the CollectionViewer. Called when it connects to the data source.
   * @docs-private
   */
  connect() { return this._renderDataChange; }

  /**
   * Used by the CollectionViewer. Called when it is destroyed. No-op.
   * @docs-private
   */
  disconnect() { }
}
