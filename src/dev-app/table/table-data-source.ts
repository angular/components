import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, Observable} from 'rxjs';
import {DestroyRef, inject} from '@angular/core';
import {TableDataSourceConfig} from './TableDataSourceConfig';

export class TableDataSource<T> extends DataSource<T> {
  protected readonly _destroyRef: DestroyRef = inject(DestroyRef);

  data$ = new BehaviorSubject<T[]>([]);

  itemSize: number;

  isLoading: boolean = false;
  isListEndReached: boolean = false;

  constructor(config?: TableDataSourceConfig<T>) {
    super();
    this.itemSize = config?.itemSize ?? 46;
  }

  setData(data: T[]): void {
    this.data$.next(data);
  }

  getData(): T[] {
    return this.data$.getValue();
  }

  connect(collectionViewer: CollectionViewer): Observable<T[]> {
    return this.data$;
  }

  disconnect(): void {}
}
