import {Observable} from 'rxjs/Observable';

export interface MdTreeViewData {
  start: number;
  end: number;
}

export abstract class TreeDataSource<T> {
  abstract connectTree(viewChanged: Observable<MdTreeViewData>): Observable<T[]>;

  abstract getChildren(node: T): T[];

  abstract getKey(node: T): any;
}