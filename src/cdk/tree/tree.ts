/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FocusKeyManager} from '@angular/cdk/a11y';
import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {UP_ARROW, DOWN_ARROW, RIGHT_ARROW, LEFT_ARROW} from '@angular/cdk/keycodes';
import {RxChain, debounceTime} from '@angular/cdk/rxjs';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  IterableDiffers,
  IterableDiffer,
  NgIterable,
  IterableChangeRecord,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {takeUntil} from 'rxjs/operator/takeUntil';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {CdkNodeDef, CdkTreeNode} from './node';
import {CdkNodePlaceholder} from './placeholder';
import {FlatNode, NestedNode} from './tree-data';
import {TreeControl} from './tree-control';
import {
  getTreeMissingMatchingNodeDefError,
  getTreeMultipleDefaultNodeDefsError
} from './tree-errors';

/** The template for CDK tree */
export const CDK_TREE_TEMPLATE = `<ng-container cdkNodePlaceholder></ng-container>`;


/**
 * CDK tree component that connects with a data source to retrieve data of type `T` and renders
 * nodes with hierarchy. Updates the nodes when new data is provided by the data source.
 */
@Component({
  selector: 'cdk-tree',
  exportAs: 'cdkTree',
  template: CDK_TREE_TEMPLATE,
  host: {
    'class': 'cdk-tree',
    'role': 'tree',
    '(focus)': 'focus()',
    '(keydown)': 'handleKeydown($event)'
  },
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CdkTree<T extends FlatNode|NestedNode> implements
    CollectionViewer, AfterViewInit, OnInit, OnDestroy {
  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

  /** Latest data provided by the data source through the connect interface. */
  private _data: NgIterable<T> = [];

  /** Subscription that listens for the data provided by the data source. */
  private _renderChangeSubscription: Subscription | null;

  /** Differ used to find the changes in the data provided by the data source. */
  private _dataDiffer: IterableDiffer<T>;

  /** Stores the node definition that does not have a when predicate. */
  private _defaultNodeDef: CdkNodeDef<T> | null;

  /** Focus related key manager */
  _keyManager: FocusKeyManager<CdkTreeNode<T>>;

  /** For focus, ordered nodes */
  orderedNodes: QueryList<CdkTreeNode<T>> = new QueryList<CdkTreeNode<T>>();

  /**
   * Provides a stream containing the latest data array to render. Influenced by the tree's
   * stream of view window (what rows are currently on screen).
   */
  @Input()
  get dataSource(): DataSource<T> { return this._dataSource; }
  set dataSource(dataSource: DataSource<T>) {
    if (this._dataSource !== dataSource) {
      this._switchDataSource(dataSource);
    }
  }
  private _dataSource: DataSource<T>;

  /** The tree controller */
  @Input() treeControl: TreeControl;

  // TODO(andrewseguin): Remove max value as the end index
  //   and instead calculate the view on init and scroll.
  /**
   * Stream containing the latest information on what rows are being displayed on screen.
   * Can be used by the data source to as a heuristic of what data should be provided.
   */
  viewChange =
    new BehaviorSubject<{start: number, end: number}>({start: 0, end: Number.MAX_VALUE});

  // Placeholders within the tree's template where the nodes will be inserted.
  @ViewChild(CdkNodePlaceholder) _nodePlaceholder: CdkNodePlaceholder;

  /** The tree node template for the tree */
  @ContentChildren(CdkNodeDef) _nodeDefs: QueryList<CdkNodeDef<T>>;

  /** The tree node inside the tree */
  @ContentChildren(CdkTreeNode, {descendants: true}) items: QueryList<CdkTreeNode<T>>;

  constructor(private _differs: IterableDiffers,
              private _elementRef: ElementRef,
              private _changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    this._dataDiffer = this._differs.find([]).create();
  }

  ngOnDestroy() {
    this._nodePlaceholder.viewContainer.clear();

    this._onDestroy.next();
    this._onDestroy.complete();

    if (this.dataSource) {
      this.dataSource.disconnect(this);
    }
  }

  ngAfterContentChecked() {
    const defaultNodeDefs = this._nodeDefs.filter(def => !def.when);
    if (defaultNodeDefs.length > 1) { throw getTreeMultipleDefaultNodeDefsError(); }
    this._defaultNodeDef = defaultNodeDefs[0];

    if (this.dataSource && !this._renderChangeSubscription) {
      this._observeRenderChanges();
    }
  }

  ngAfterViewInit() {
    // For key traversal in correct order
    this.items.changes.subscribe((items) => {
      let nodes = items.toArray();

      nodes.sort((a, b) => {
        return a.offsetTop - b.offsetTop;
      });
      this.orderedNodes.reset(nodes);

      let activeItem = this._keyManager ? this._keyManager.activeItem : null;
      this._keyManager = new FocusKeyManager(this.orderedNodes);
      if (activeItem instanceof CdkTreeNode) {
        this._updateFocusedNode(activeItem);
      }
      this._changeDetectorRef.detectChanges();
    })
  }

  // Key related
  // TODO(tinagao): Work on keyboard traversal
  handleKeydown(event) {
    if (event.keyCode == UP_ARROW) {
      this._keyManager.setPreviousItemActive();
    } else if (event.keyCode == DOWN_ARROW) {
      this._keyManager.setNextItemActive();
    } else if (event.keyCode == RIGHT_ARROW) {
      let activeNode = this._keyManager.activeItem;
      if (activeNode instanceof CdkTreeNode) {
        this.treeControl.expand(activeNode.data);
        this._changeDetectorRef.detectChanges();
      }
    } else if (event.keyCode == LEFT_ARROW) {
      let activeNode = this._keyManager.activeItem;
      if (activeNode instanceof CdkTreeNode) {
        this.treeControl.collapse(activeNode.data);
        this._changeDetectorRef.detectChanges();
      }
    }
  }

  /** Update focused node in keymanager */
  _updateFocusedNode(node: CdkTreeNode<T>) {
    let index = this.orderedNodes.toArray().indexOf(node);
    if (this._keyManager && index > -1) {
      this._keyManager.setActiveItem(Math.min(this.orderedNodes.length -1, index));
    }
  }

  /**
   * Switch to the provided data source by resetting the data and unsubscribing from the current
   * render change subscription if one exists. If the data source is null, interpret this by
   * clearing the node placeholder. Otherwise start listening for new data.
   */
  private _switchDataSource(dataSource: DataSource<T>) {
    this._data = [];

    if (this.dataSource) {
      this.dataSource.disconnect(this);
    }

    // Stop listening for data from the previous data source.
    if (this._renderChangeSubscription) {
      this._renderChangeSubscription.unsubscribe();
      this._renderChangeSubscription = null;
    }

    // Remove the table's rows if there is now no data source
    if (!dataSource) {
      this._nodePlaceholder.viewContainer.clear();
    }

    this._dataSource = dataSource;
  }

  /** Set up a subscription for the data provided by the data source. */
  private _observeRenderChanges() {
    this._renderChangeSubscription = takeUntil.call(this.dataSource.connect(this), this._onDestroy)
      .subscribe(data => {
        this._data = data;
        this._renderNodeChanges(data);
      });
  }

  /** Check for changes made in the data and render each change (node added/removed/moved). */
  private _renderNodeChanges(dataNodes: T[]) {
    const changes = this._dataDiffer.diff(dataNodes);
    if (!changes) { return; }

    const viewContainer = this._nodePlaceholder.viewContainer;
    changes.forEachOperation(
      (item: IterableChangeRecord<T>, adjustedPreviousIndex: number, currentIndex: number) => {
        if (item.previousIndex == null) {
          this.insertNode(dataNodes[currentIndex], currentIndex);
        } else if (currentIndex == null) {
          viewContainer.remove(adjustedPreviousIndex);
        } else {
          const view = viewContainer.get(adjustedPreviousIndex);
          viewContainer.move(view!, currentIndex);
        }
      });
  }

  /**
   * Finds the matching node definition that should be used for this node data. If there is only
   * one node definition, it is returned. Otherwise, find the node definition that has a when
   * predicate that returns true with the data. If none return true, return the default node
   * definition.
   */
  _getNodeDef(data: T, i: number): CdkNodeDef<T> {
    if (this._nodeDefs.length == 1) { return this._nodeDefs.first; }

    let nodeDef = this._nodeDefs.find(def => def.when && def.when(data, i)) || this._defaultNodeDef;
    if (!nodeDef) { throw getTreeMissingMatchingNodeDefError(); }

    return nodeDef;
  }

  /**
   * Create the embedded view for the data row template and place it in the correct index location
   * within the data row view container.
   */
  insertNode(nodeData: T, index: number, viewContainer?: ViewContainerRef) {
    const node = this._getNodeDef(nodeData, index);

    // Row context that will be provided to both the created embedded row view and its cells.
    const context = {$implicit: nodeData};

    // TODO(andrewseguin): add some code to enforce that exactly one
    //   CdkCellOutlet was instantiated as a result  of `createEmbeddedView`.
    const container = viewContainer ? viewContainer : this._nodePlaceholder.viewContainer;
    container.createEmbeddedView(node.template, context, index);

    this._changeDetectorRef.detectChanges();
  }
}
