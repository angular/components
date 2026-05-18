/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MockedDataType} from './MockedDataType';
import {TableDataSource} from './table-data-source';
import {mockedData} from './data';
import {TableColumn} from './TableExampleColumn';
import {PagedTableDataSourceNextPageData} from './PagedTableDataSourceNextPageData';
import {Observable, of} from 'rxjs';
import {delay, map} from 'rxjs/operators';
import {PagedDataSource} from './paged-data-source';

export const TABLE_EXAMPLE_COLUMNS: readonly TableColumn[] = [
  TableColumn.ID,
  TableColumn.FIRST_NAME,
  TableColumn.LAST_NAME,
  // TableColumn.EMAIL,
  // TableColumn.GENDER,
  // TableColumn.IP_ADDRESS,
];

@Component({
  templateUrl: './table-demo.html',
  imports: [MatTableModule, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .example-container {
      height: 600px;
      overflow: auto;
    }

    .example-container table {
      width: 100%;
    }

    .loading {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      background: rgba(0, 0, 0, 0.8);
    }

    :host {
      position: relative;
    }

    td {
      white-space: nowrap;
    }

  `,
})
export class TableDemo {
  readonly TableExampleColumn = TableColumn;

  displayedColumns: string[] = [...TABLE_EXAMPLE_COLUMNS];
  dataSource!: TableDataSource<MockedDataType>;

  trackBy = (index: number, el: MockedDataType) => el.id;

  constructor() {
    this.initStaticDataSource(); // static data, comment the other one
    // this.initPagedDataSource(); // async data, comment the other one
  }

  initStaticDataSource(): void {
    this.dataSource = new TableDataSource();
    this.dataSource.setData(mockedData);
  }

  initPagedDataSource(): void {
    this.dataSource = new PagedDataSource<MockedDataType>({
      pageSize: 40,
      itemsUntilReq: 5,
      nextPageHandler: this._nextPageHandler.bind(this),
    });
  }

  private _nextPageHandler(
    pageSize: number,
    nextPageNumber: number,
    nextPageToken?: string,
  ): Observable<PagedTableDataSourceNextPageData<MockedDataType>> {
    return of(mockedData).pipe(
      delay(1000),
      map((data: MockedDataType[]) => ({
        content: data.slice(pageSize * (nextPageNumber - 1), pageSize * nextPageNumber),
        nextPageToken,
      })),
    );
  }
}
