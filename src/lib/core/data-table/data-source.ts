import {Observable} from 'rxjs/Observable';
import {CollectionViewer} from './data-table';

export abstract class DataSource<T> {
  abstract connectTable(viewChanged: Observable<CollectionViewer>): Observable<T[]>;
}
