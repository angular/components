import {Observable} from 'rxjs/Observable';

export interface MdTreeNodes<T> {
  nodes: T[];
  nodeCount: number;
}

export interface MdTreeDataSource<T> {
  getNodes(): Observable<MdTreeNodes<T>>;
}