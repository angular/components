import {Observable} from 'rxjs/Observable';

export interface MdTableRows<T> {
  rows: T[];
  rowCount: number;
}

export interface MdTableDataSource<T> {
  getRows(): Observable<MdTableRows<T>>;
}
