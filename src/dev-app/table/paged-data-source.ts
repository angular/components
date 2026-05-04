import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Observable} from 'rxjs';
import {PagedTableDataSourceNextPageData} from './PagedTableDataSourceNextPageData';
import {PagedTableDataSourceConfig} from './PagedTableDataSourceConfig';
import {CollectionViewer} from '@angular/cdk/collections';
import {TableDataSource} from './table-data-source';

export class PagedDataSource<T> extends TableDataSource<T> {
  protected _nextPageToken?: string;
  protected _nextPageHandler?: (
    pageSize: number,
    nextPageNumber: number,
    nextPageToken?: string,
  ) => Observable<PagedTableDataSourceNextPageData<T>>;

  private _pageSize: number;
  private _itemsUntilReq: number;
  private _currentPage: number = 0;

  constructor(config: PagedTableDataSourceConfig<T>) {
    super(config);
    this._pageSize = config?.pageSize ?? 40;
    this._itemsUntilReq = config.itemsUntilReq ?? 5;
    this.setNextPageHandler(config.nextPageHandler);
  }

  override connect(collectionViewer: CollectionViewer): Observable<T[]> {
    collectionViewer.viewChange.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(range => {
      if (!this._pageSize) {
        throw new Error(`[PagedDataSource][connect] pageSize is not defined`);
      }

      console.log(range);
      const nextPageThreshold = this._currentPage * this._pageSize - this._itemsUntilReq;
      const isNextPageThresholdReached = range.end > nextPageThreshold;

      if (isNextPageThresholdReached && !this.isListEndReached && !this.isLoading) {
        this.loadNextPage();
      }
    });

    return super.connect(collectionViewer);
  }

  loadNextPage(): void {
    if (!this._pageSize) {
      throw new Error(`[PagedDataSource][loadNextPage] pageSize is not defined`);
    }

    if (!this._nextPageHandler) {
      throw new Error(`[PagedDataSource][loadNextPage] _nextPageHandler is not defined`);
    }

    this.isLoading = true;
    this._nextPageHandler(this._pageSize, this._currentPage + 1, this._nextPageToken)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((nextPageData: PagedTableDataSourceNextPageData<T>) => {
        if (!this._pageSize) {
          throw new Error(`[PagedDataSource][_nextPageHandler] pageSize is not defined`);
        }

        this._currentPage++;
        this.setNextPageToken(nextPageData.nextPageToken);
        this.setData(this.getData().concat(nextPageData.content));

        this.isLoading = false;

        if (nextPageData.content.length < this._pageSize) {
          this.isListEndReached = true;
        }
      });
  }

  resetData(): void {
    this._currentPage = 0;
    this.isListEndReached = false;

    this.setData([]);
    delete this._nextPageToken;
  }

  setNextPageHandler(nextPageHandler: typeof this._nextPageHandler): void {
    this._nextPageHandler = nextPageHandler;
  }

  setNextPageToken(nextPageToken?: string): void {
    this._nextPageToken = nextPageToken;
  }
}
