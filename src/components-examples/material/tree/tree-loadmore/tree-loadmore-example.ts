/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {FlatTreeControl} from '@angular/cdk/tree';
import {ChangeDetectionStrategy, Component, Injectable, inject} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule} from '@angular/material/tree';
import {BehaviorSubject, Observable} from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {ENTER, SPACE} from '@angular/cdk/keycodes';

const LOAD_MORE = 'LOAD_MORE';
let loadMoreId = 1;

/** Nested node */
export class NestedNode {
  childrenChange = new BehaviorSubject<NestedNode[]>([]);

  get children(): NestedNode[] {
    return this.childrenChange.value;
  }

  constructor(
    public name: string,
    public hasChildren = false,
    public parent: string | null = null,
    public isLoadMore = false,
  ) {}
}

/** Flat node with expandable and level information */
export class FlatNode {
  constructor(
    public name: string,
    public level = 1,
    public expandable = false,
    public parent: string | null = null,
    public isLoadMore = false,
  ) {}
}

/** Number of nodes loaded at a time */
const batchSize = 3;

/**
 * A database that only load part of the data initially. After user clicks on the `Load more`
 * button, more data will be loaded.
 */
@Injectable()
export class LoadmoreDatabase {
  /** Map of node name to node */
  nodes = new Map<string, NestedNode>();

  dataChange = new BehaviorSubject<NestedNode[]>([]);

  /** Example data */
  rootNodes: string[] = ['Vegetables', 'Fruits'];
  childMap = new Map<string, string[]>([
    ['Fruits', ['Apple', 'Orange', 'Banana']],
    ['Vegetables', ['Tomato', 'Potato', 'Onion']],
    [
      'Apple',
      [
        'Gala',
        'Braeburn',
        'Fuji',
        'Macintosh',
        'Golden Delicious',
        'Red Delicious',
        'Empire',
        'Granny Smith',
        'Cameo',
        'Baldwin',
        'Jonagold',
      ],
    ],
    ['Onion', ['Yellow', 'White', 'Purple', 'Green', 'Shallot', 'Sweet', 'Red', 'Leek']],
  ]);

  initialize() {
    const data = this.rootNodes.map(name => this._generateNode(name, null));
    this.dataChange.next(data);
  }

  /** Expand a node whose children are not loaded */
  loadChildren(name: string, onlyFirstTime = false) {
    if (!this.nodes.has(name) || !this.childMap.has(name)) {
      return;
    }
    const parent = this.nodes.get(name)!;
    const children = this.childMap.get(name)!;

    if (onlyFirstTime && parent.children!.length > 0) {
      return;
    }

    const newChildrenNumber = parent.children!.length + batchSize;
    const nodes = children
      .slice(0, newChildrenNumber)
      .map(name => this._generateNode(name, parent.name));
    if (newChildrenNumber < children.length) {
      // Need a new "Load More" node
      nodes.push(new NestedNode(`${LOAD_MORE}-${loadMoreId++}`, false, name, true));
    }

    parent.childrenChange.next(nodes);
    this.dataChange.next(this.dataChange.value);
  }

  private _generateNode(name: string, parent: string | null): NestedNode {
    if (!this.nodes.has(name)) {
      this.nodes.set(name, new NestedNode(name, this.childMap.has(name), parent));
    }

    return this.nodes.get(name)!;
  }
}

/**
 * @title Tree with partially loaded data
 */
@Component({
  selector: 'tree-loadmore-example',
  templateUrl: 'tree-loadmore-example.html',
  styleUrl: 'tree-loadmore-example.css',
  providers: [LoadmoreDatabase],
  standalone: true,
  imports: [MatTreeModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeLoadmoreExample {
  private _database = inject(LoadmoreDatabase);

  nodeMap = new Map<string, FlatNode>();
  treeControl: FlatTreeControl<FlatNode>;
  treeFlattener: MatTreeFlattener<NestedNode, FlatNode>;
  // Flat tree data source
  dataSource: MatTreeFlatDataSource<NestedNode, FlatNode>;

  constructor() {
    const _database = this._database;

    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren,
    );

    // TODO(#27626): Remove treeControl. Adopt either levelAccessor or childrenAccessor.
    this.treeControl = new FlatTreeControl<FlatNode>(this.getLevel, this.isExpandable);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    _database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });

    _database.initialize();
  }

  getChildren = (node: NestedNode): Observable<NestedNode[]> => node.childrenChange;

  transformer = (node: NestedNode, level: number) => {
    const existingNode = this.nodeMap.get(node.name);

    if (existingNode) {
      return existingNode;
    }

    const newNode = new FlatNode(node.name, level, node.hasChildren, node.parent, node.isLoadMore);
    this.nodeMap.set(node.name, newNode);
    return newNode;
  };

  getLevel = (node: FlatNode) => node.level;

  isExpandable = (node: FlatNode) => node.expandable;

  hasChild = (_: number, node: FlatNode) => node.expandable;

  isLoadMore = (_: number, node: FlatNode) => node.isLoadMore;

  loadChildren(node: FlatNode) {
    this._database.loadChildren(node.name, true);
  }

  /** Load more nodes when clicking on "Load more" node. */
  loadOnClick(event: MouseEvent, node: FlatNode) {
    this._loadSiblings(event.target as HTMLElement, node);
  }

  /** Load more nodes on keyboardpress when focused on "Load more" node */
  loadOnKeypress(event: KeyboardEvent, node: FlatNode) {
    if (event.keyCode === ENTER || event.keyCode === SPACE) {
      this._loadSiblings(event.target as HTMLElement, node);
    }
  }

  private _loadSiblings(nodeElement: HTMLElement, node: FlatNode) {
    if (node.parent) {
      // Store a reference to the sibling of the "Load More" node before it is removed from the DOM
      const previousSibling = nodeElement.previousElementSibling;

      // Synchronously load data.
      this._database.loadChildren(node.parent);

      const focusDesination = previousSibling?.nextElementSibling || previousSibling;

      if (focusDesination) {
        // Restore focus.
        (focusDesination as HTMLElement).focus();
      }
    }
  }
}
