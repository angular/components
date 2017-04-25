import {Observable} from 'rxjs/Observable';

export interface MdTreeViewData {
  start: number;
  end: number;
}

export abstract class TreeDataSource<T> {
  abstract connectTree(viewChanged: Observable<MdTreeViewData>): Observable<T[]>;
}