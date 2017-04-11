import {Observable} from 'rxjs/Observable';

export interface MdTreeNode<T> {
  children: T[];
  childrenCount: number;
}

export interface MdTreeDataSource<T> {
  getNodes(): Observable<MdTreeNode<T>>;
}