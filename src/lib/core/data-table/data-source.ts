import {Observable} from 'rxjs/Observable';
import {CdkTableViewData} from './data-table';

export abstract class DataSource<T> {
  abstract connectTable(viewChanged: Observable<CdkTableViewData>): Observable<T[]>;
}
