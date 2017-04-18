import {Observable} from 'rxjs/Observable';
export class TreeNode<T> {
  data: T;
  level: number;
}

export interface MdTreeNodes<T> {
  nodes: TreeNode<T>[];
  nodeCount: number;
}

export interface MdTreeDataSource<T> {
  getNodes(): Observable<MdTreeNodes<T>>;


}