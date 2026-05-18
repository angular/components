import {Observable} from 'rxjs';
import {PagedTableDataSourceNextPageData} from './PagedTableDataSourceNextPageData';
import {TableDataSourceConfig} from './TableDataSourceConfig';

export interface PagedTableDataSourceConfig<T> extends TableDataSourceConfig<T> {
  pageSize?: number;
  itemsUntilReq?: number;
  nextPageHandler: (
    pageSize: number,
    nextPageNumber: number,
    nextPageToken?: string,
  ) => Observable<PagedTableDataSourceNextPageData<T>>;
}
