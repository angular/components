import {Observable} from 'rxjs/Observable';

export interface FlatNode {
  level: number;
  expandable: boolean;
}

export interface NestedNode {
  getChildren(): Observable<NestedNode[]>;
}

export interface SimpleTreeNode {
  children: this[];
}
