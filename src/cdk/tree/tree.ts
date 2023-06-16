/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {TreeKeyManager, TreeKeyManagerItem} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';
import {CollectionViewer, DataSource, isDataSource, SelectionModel} from '@angular/cdk/collections';
import {
  AfterContentChecked,
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  IterableChangeRecord,
  IterableDiffer,
  IterableDiffers,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TrackByFunction,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  concat,
  EMPTY,
  isObservable,
  merge,
  NEVER,
  Observable,
  of as observableOf,
  Subject,
  Subscription,
} from 'rxjs';
import {
  concatMap,
  map,
  pairwise,
  reduce,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {TreeControl} from './control/tree-control';
import {CdkTreeNodeDef, CdkTreeNodeOutletContext} from './node';
import {CdkTreeNodeOutlet} from './outlet';
import {
  getMultipleTreeControlsError,
  getNodeNotExpandableError,
  getTreeControlMissingError,
  getTreeMissingMatchingNodeDefError,
  getTreeMultipleDefaultNodeDefsError,
  getTreeNoValidDataSourceError,
} from './tree-errors';

function coerceObservable<T>(data: T | Observable<T>): Observable<T> {
  if (!isObservable(data)) {
    return observableOf(data);
  }
  return data;
}

function isNotNullish<T>(val: T | null | undefined): val is T {
  return val != null;
}

type NodeGroup<T, K> = Map<K | null, T[]>;

/**
 * CDK tree component that connects with a data source to retrieve data of type `T` and renders
 * dataNodes with hierarchy. Updates the dataNodes when new data is provided by the data source.
 */
@Component({
  selector: 'cdk-tree',
  exportAs: 'cdkTree',
  template: `<ng-container cdkTreeNodeOutlet></ng-container>`,
  host: {
    'class': 'cdk-tree',
    'role': 'tree',
    '(keydown)': '_sendKeydownToKeyManager($event)',
    '(focus)': '_focusInitialTreeItem()',
  },
  encapsulation: ViewEncapsulation.None,

  // The "OnPush" status for the `CdkTree` component is effectively a noop, so we are removing it.
  // The view for `CdkTree` consists entirely of templates declared in other views. As they are
  // declared elsewhere, they are checked when their declaration points are checked.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CdkTree<T, K = T>
  implements AfterContentChecked, AfterContentInit, CollectionViewer, OnDestroy, OnInit
{
  /** Subject that emits when the component has been destroyed. */
  private readonly _onDestroy = new Subject<void>();

  /** Differ used to find the changes in the data provided by the data source. */
  private _dataDiffer: IterableDiffer<T>;

  /** Stores the node definition that does not have a when predicate. */
  private _defaultNodeDef: CdkTreeNodeDef<T> | null;

  /** Data subscription */
  private _dataSubscription: Subscription | null;

  /** Level of nodes */
  private _levels: Map<K, number> = new Map<K, number>();

  /** The immediate parents for a node. This is `null` if there is no parent. */
  private _parents: Map<K, T | null> = new Map<K, T | null>();

  /**
   * The internal node groupings for each node; we use this, primarily for flattened trees, to
   * determine where a particular node is within each group.
   *
   * The structure of this is that:
   * - the outer index is the level
   * - the inner index is the parent node for this particular group. If there is no parent node, we
   *   use `null`.
   */
  private _groups: Map<number, NodeGroup<T, K>> = new Map<number, NodeGroup<T, K>>();

  /**
   * Provides a stream containing the latest data array to render. Influenced by the tree's
   * stream of view window (what dataNodes are currently on screen).
   * Data source can be an observable of data array, or a data array to render.
   */
  @Input()
  get dataSource(): DataSource<T> | Observable<T[]> | T[] {
    return this._dataSource;
  }
  set dataSource(dataSource: DataSource<T> | Observable<T[]> | T[]) {
    if (this._dataSource !== dataSource) {
      this._switchDataSource(dataSource);
    }
  }
  private _dataSource: DataSource<T> | Observable<T[]> | T[];

  /**
   * The tree controller
   *
   * @deprecated Use one of `levelAccessor` or `childrenAccessor`
   * @breaking-change 14.0.0
   */
  @Input() treeControl?: TreeControl<T, K>;

  /**
   * Given a data node, determines what tree level the node is at.
   *
   * One of levelAccessor or childrenAccessor must be specified, not both.
   * This is enforced at run-time.
   */
  @Input() levelAccessor?: (dataNode: T) => number;

  /**
   * Given a data node, determines what the children of that node are.
   *
   * One of levelAccessor or childrenAccessor must be specified, not both.
   * This is enforced at run-time.
   */
  @Input() childrenAccessor?: (dataNode: T) => T[] | Observable<T[]>;

  /**
   * Tracking function that will be used to check the differences in data changes. Used similarly
   * to `ngFor` `trackBy` function. Optimize node operations by identifying a node based on its data
   * relative to the function to know if a node should be added/removed/moved.
   * Accepts a function that takes two parameters, `index` and `item`.
   */
  @Input() trackBy: TrackByFunction<T>;

  /**
   * Given a data node, determines the key by which we determine whether or not this node is expanded.
   */
  @Input() expansionKey?: (dataNode: T) => K;

  // Outlets within the tree's template where the dataNodes will be inserted.
  @ViewChild(CdkTreeNodeOutlet, {static: true}) _nodeOutlet: CdkTreeNodeOutlet;

  /** The tree node template for the tree */
  @ContentChildren(CdkTreeNodeDef, {
    // We need to use `descendants: true`, because Ivy will no longer match
    // indirect descendants if it's left as false.
    descendants: true,
  })
  _nodeDefs: QueryList<CdkTreeNodeDef<T>>;

  // TODO(tinayuangao): Setup a listener for scrolling, emit the calculated view to viewChange.
  //     Remove the MAX_VALUE in viewChange
  /**
   * Stream containing the latest information on what rows are being displayed on screen.
   * Can be used by the data source to as a heuristic of what data should be provided.
   */
  readonly viewChange = new BehaviorSubject<{start: number; end: number}>({
    start: 0,
    end: Number.MAX_VALUE,
  });

  /** Keep track of which nodes are expanded. */
  private _expansionModel?: SelectionModel<K>;

  /**
   * Maintain a synchronous cache of flattened data nodes. In the
   * case of nested nodes (i.e. if `nodeType` is 'nested'), this will
   * not contain any data.
   */
  private _preFlattenedNodes: BehaviorSubject<readonly T[]> = new BehaviorSubject<readonly T[]>([]);

  private _flattenedNodes: BehaviorSubject<readonly T[]> = new BehaviorSubject<readonly T[]>([]);

  /**
   * The automatically determined node type for the tree.
   */
  private _nodeType: BehaviorSubject<'flat' | 'nested' | null> = new BehaviorSubject<
    'flat' | 'nested' | null
  >(null);

  /**
   * The root nodes of the tree.
   */
  private _rootNodes: BehaviorSubject<readonly T[]> = new BehaviorSubject<readonly T[]>([]);

  /** The mapping between data and the node that is rendered. */
  private _nodes: BehaviorSubject<Map<K, CdkTreeNode<T, K>>> = new BehaviorSubject(
    new Map<K, CdkTreeNode<T, K>>(),
  );

  /** The key manager for this tree. Handles focus and activation based on user keyboard input. */
  _keyManager: TreeKeyManager<CdkTreeNode<T, K>>;

  private _inInitialRender = true;

  constructor(
    private _differs: IterableDiffers,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dir: Directionality,
    private _elementRef: ElementRef<HTMLElement>,
  ) {}

  ngOnInit() {
    this._dataDiffer = this._differs.find([]).create(this.trackBy);
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      const provided = [this.treeControl, this.levelAccessor, this.childrenAccessor].filter(
        value => !!value,
      ).length;
      if (provided > 1) {
        throw getMultipleTreeControlsError();
      } else if (provided === 0) {
        throw getTreeControlMissingError();
      }
    }

    let expansionModel;
    if (!this.treeControl) {
      expansionModel = new SelectionModel<K>(true);
      this._expansionModel = expansionModel;
    } else {
      expansionModel = this.treeControl.expansionModel;
    }

    // We manually detect changes on all the children nodes when expansion
    // status changes; otherwise, the various attributes won't be updated.
    expansionModel.changed
      .pipe(withLatestFrom(this._nodes), takeUntil(this._onDestroy))
      .subscribe(([changes, nodes]) => {
        for (const added of changes.added) {
          nodes.get(added)?._changeDetectorRef.detectChanges();
        }
        for (const removed of changes.removed) {
          nodes.get(removed)?._changeDetectorRef.detectChanges();
        }
      });

    combineLatest([this._preFlattenedNodes, this._rootNodes])
      .pipe(
        switchMap(([preFlattened, rootNodes]) => {
          if (preFlattened.length) {
            return observableOf(preFlattened);
          } else if (rootNodes.length) {
            return this._flattenRootNodes(rootNodes);
          }
          return NEVER;
        }),
        takeUntil(this._onDestroy),
      )
      .subscribe(flattenedNodes => {
        this._flattenedNodes.next(flattenedNodes);
        this._recalculateGroupsForLevelAccessor();
      });
  }

  ngOnDestroy() {
    this._nodeOutlet.viewContainer.clear();

    this.viewChange.complete();
    this._onDestroy.next();
    this._onDestroy.complete();

    if (this._dataSource && typeof (this._dataSource as DataSource<T>).disconnect === 'function') {
      (this.dataSource as DataSource<T>).disconnect(this);
    }

    if (this._dataSubscription) {
      this._dataSubscription.unsubscribe();
      this._dataSubscription = null;
    }
  }

  ngAfterContentInit() {
    this._keyManager = new TreeKeyManager({
      items: combineLatest([this._flattenedNodes, this._nodes]).pipe(
        map(([flattenedNodes, nodes]) =>
          flattenedNodes.map(data => nodes.get(this._getExpansionKey(data))).filter(isNotNullish),
        ),
      ),
      trackBy: node => this._getExpansionKey(node.data),
      skipPredicate: node => node.isDisabled || !this._hasAllParentsExpanded(node.data),
      typeAheadDebounceInterval: true,
      horizontalOrientation: this._dir.value,
    });

    this._keyManager.change
      .pipe(startWith(null), pairwise(), takeUntil(this._onDestroy))
      .subscribe(([prev, next]) => {
        prev?._setTabUnfocusable();
        next?._setTabFocusable();
      });

    this._keyManager.change.pipe(startWith(null), takeUntil(this._onDestroy)).subscribe(() => {
      // refresh the tabindex when the active item changes.
      this._setTabIndex();
    });
  }

  ngAfterContentChecked() {
    const defaultNodeDefs = this._nodeDefs.filter(def => !def.when);
    if (defaultNodeDefs.length > 1 && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw getTreeMultipleDefaultNodeDefsError();
    }
    this._defaultNodeDef = defaultNodeDefs[0];

    if (this.dataSource && this._nodeDefs && !this._dataSubscription) {
      this._observeRenderChanges();
    }
  }

  _setNodeTypeIfUnset(nodeType: 'flat' | 'nested') {
    if (this._nodeType.value === null) {
      this._nodeType.next(nodeType);
    }
  }

  /**
   * Sets the tabIndex on the host element.
   *
   * NB: we don't set this as a host binding since children being activated
   * (e.g. on user click) doesn't trigger this component's change detection.
   */
  _setTabIndex() {
    // If the `TreeKeyManager` has no active item, then we know that we need to focus the initial
    // item when the tree is focused. We set the tabindex to be `0` so that we can capture
    // the focus event and redirect it. Otherwise, we unset it.
    if (!this._keyManager.getActiveItem()) {
      this._elementRef.nativeElement.setAttribute('tabindex', '0');
    } else {
      this._elementRef.nativeElement.removeAttribute('tabindex');
    }
  }

  /**
   * Switch to the provided data source by resetting the data and unsubscribing from the current
   * render change subscription if one exists. If the data source is null, interpret this by
   * clearing the node outlet. Otherwise start listening for new data.
   */
  private _switchDataSource(dataSource: DataSource<T> | Observable<T[]> | T[]) {
    if (this._dataSource && typeof (this._dataSource as DataSource<T>).disconnect === 'function') {
      (this.dataSource as DataSource<T>).disconnect(this);
    }

    if (this._dataSubscription) {
      this._dataSubscription.unsubscribe();
      this._dataSubscription = null;
    }

    // Remove the all dataNodes if there is now no data source
    if (!dataSource) {
      this._nodeOutlet.viewContainer.clear();
    }

    this._dataSource = dataSource;
    if (this._nodeDefs) {
      this._observeRenderChanges();
    }
  }

  /** Set up a subscription for the data provided by the data source. */
  private _observeRenderChanges() {
    let dataStream: Observable<readonly T[]> | undefined;

    if (isDataSource(this._dataSource)) {
      dataStream = this._dataSource.connect(this);
    } else if (isObservable(this._dataSource)) {
      dataStream = this._dataSource;
    } else if (Array.isArray(this._dataSource)) {
      dataStream = observableOf(this._dataSource);
    }

    if (dataStream) {
      this._dataSubscription = combineLatest([dataStream, this._nodeType])
        .pipe(
          switchMap(([data, nodeType]) => this._convertChildren(data, nodeType)),
          takeUntil(this._onDestroy),
        )
        .subscribe(data => {
          this._renderNodeChanges(data);
          this._inInitialRender = false;
        });
    } else if (typeof ngDevMode === 'undefined' || ngDevMode) {
      throw getTreeNoValidDataSourceError();
    }
  }

  /** Check for changes made in the data and render each change (node added/removed/moved). */
  _renderNodeChanges(
    data: readonly T[],
    dataDiffer: IterableDiffer<T> = this._dataDiffer,
    viewContainer: ViewContainerRef = this._nodeOutlet.viewContainer,
    parentData?: T,
  ) {
    const changes = dataDiffer.diff(data);
    if (!changes) {
      return;
    }

    changes.forEachOperation(
      (
        item: IterableChangeRecord<T>,
        adjustedPreviousIndex: number | null,
        currentIndex: number | null,
      ) => {
        if (item.previousIndex == null) {
          this.insertNode(data[currentIndex!], currentIndex!, viewContainer, parentData);
        } else if (currentIndex == null) {
          viewContainer.remove(adjustedPreviousIndex!);
          const group = this._getNodeGroup(item.item);
          this._levels.delete(this._getExpansionKey(item.item));
          this._parents.delete(this._getExpansionKey(item.item));
          group.splice(group.indexOf(item.item), 1);
        } else {
          const view = viewContainer.get(adjustedPreviousIndex!);
          viewContainer.move(view!, currentIndex);
        }
      },
    );

    this._changeDetectorRef.detectChanges();
  }

  /**
   * Finds the matching node definition that should be used for this node data. If there is only
   * one node definition, it is returned. Otherwise, find the node definition that has a when
   * predicate that returns true with the data. If none return true, return the default node
   * definition.
   */
  _getNodeDef(data: T, i: number): CdkTreeNodeDef<T> {
    if (this._nodeDefs.length === 1) {
      return this._nodeDefs.first!;
    }

    const nodeDef =
      this._nodeDefs.find(def => def.when && def.when(i, data)) || this._defaultNodeDef;

    if (!nodeDef && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw getTreeMissingMatchingNodeDefError();
    }

    return nodeDef!;
  }

  /**
   * Create the embedded view for the data node template and place it in the correct index location
   * within the data node view container.
   */
  insertNode(nodeData: T, index: number, viewContainer?: ViewContainerRef, parentData?: T) {
    const levelAccessor = this._getLevelAccessor();
    // On the first render, we don't yet have a cache of flattenedNodes to determine parent data.
    // Skip setting this until we have it saved, then recalculate it later.
    const shouldSetGroupData = !levelAccessor || !this._inInitialRender;

    const node = this._getNodeDef(nodeData, index);
    const key = this._getExpansionKey(nodeData);

    // Node context that will be provided to created embedded view
    const context = new CdkTreeNodeOutletContext<T>(nodeData);

    parentData ??= this._parents.get(key) ?? undefined;
    // If the tree is flat tree, then use the `getLevel` function in flat tree control
    // Otherwise, use the level of parent node.
    if (levelAccessor) {
      context.level = levelAccessor(nodeData);
    } else if (
      typeof parentData !== 'undefined' &&
      this._levels.has(this._getExpansionKey(parentData))
    ) {
      context.level = this._levels.get(this._getExpansionKey(parentData))! + 1;
    } else {
      context.level = 0;
    }
    this._levels.set(key, context.level);

    if (shouldSetGroupData) {
      const parent = parentData ?? this._findParentForNode(nodeData, index);
      const parentKey = parent ? this._getExpansionKey(parent) : null;
      this._parents.set(key, parent);

      // We're essentially replicating the tree structure within each `group`;
      // we insert the node into the group at the specified index.
      const currentGroup = this._groups.get(context.level) ?? new Map<K | null, T[]>();
      const group = currentGroup.get(parentKey) ?? [];
      group.splice(index, 0, nodeData);
      currentGroup.set(parentKey, group);
      this._groups.set(context.level, currentGroup);
    }

    // Use default tree nodeOutlet, or nested node's nodeOutlet
    const container = viewContainer ? viewContainer : this._nodeOutlet.viewContainer;
    container.createEmbeddedView(node.template, context, index);

    // Set the data to just created `CdkTreeNode`.
    // The `CdkTreeNode` created from `createEmbeddedView` will be saved in static variable
    //     `mostRecentTreeNode`. We get it from static variable and pass the node data to it.
    if (CdkTreeNode.mostRecentTreeNode) {
      CdkTreeNode.mostRecentTreeNode.data = nodeData;
    }
  }

  /** Whether the data node is expanded or collapsed. Returns true if it's expanded. */
  isExpanded(dataNode: T): boolean {
    return (
      this.treeControl?.isExpanded(dataNode) ??
      this._expansionModel?.isSelected(this._getExpansionKey(dataNode)) ??
      false
    );
  }

  /** If the data node is currently expanded, collapse it. Otherwise, expand it. */
  toggle(dataNode: T): void {
    if (this.treeControl) {
      this.treeControl.toggle(dataNode);
    } else if (this._expansionModel) {
      this._expansionModel.toggle(this._getExpansionKey(dataNode));
    }
  }

  /** Expand the data node. If it is already expanded, does nothing. */
  expand(dataNode: T): void {
    if (this.treeControl) {
      this.treeControl.expand(dataNode);
    } else if (this._expansionModel) {
      this._expansionModel.select(this._getExpansionKey(dataNode));
    }
  }

  /** Collapse the data node. If it is already collapsed, does nothing. */
  collapse(dataNode: T): void {
    if (this.treeControl) {
      this.treeControl.collapse(dataNode);
    } else if (this._expansionModel) {
      this._expansionModel.deselect(this._getExpansionKey(dataNode));
    }
  }

  /**
   * If the data node is currently expanded, collapse it and all its descendants.
   * Otherwise, expand it and all its descendants.
   */
  toggleDescendants(dataNode: T): void {
    if (this.treeControl) {
      this.treeControl.toggleDescendants(dataNode);
    } else if (this._expansionModel) {
      if (this.isExpanded(dataNode)) {
        this.collapseDescendants(dataNode);
      } else {
        this.expandDescendants(dataNode);
      }
    }
  }

  /**
   * Expand the data node and all its descendants. If they are already expanded, does nothing.
   */
  expandDescendants(dataNode: T): void {
    if (this.treeControl) {
      this.treeControl.expandDescendants(dataNode);
    } else if (this._expansionModel) {
      const expansionModel = this._expansionModel;
      expansionModel.select(this._getExpansionKey(dataNode));
      this._getDescendants(dataNode)
        .pipe(take(1), takeUntil(this._onDestroy))
        .subscribe(children => {
          expansionModel.select(...children.map(child => this._getExpansionKey(child)));
        });
    }
  }

  /** Collapse the data node and all its descendants. If it is already collapsed, does nothing. */
  collapseDescendants(dataNode: T): void {
    if (this.treeControl) {
      this.treeControl.collapseDescendants(dataNode);
    } else if (this._expansionModel) {
      const expansionModel = this._expansionModel;
      expansionModel.deselect(this._getExpansionKey(dataNode));
      this._getDescendants(dataNode)
        .pipe(take(1), takeUntil(this._onDestroy))
        .subscribe(children => {
          expansionModel.deselect(...children.map(child => this._getExpansionKey(child)));
        });
    }
  }

  /** Expands all data nodes in the tree. */
  expandAll(): void {
    if (this.treeControl) {
      this.treeControl.expandAll();
    } else if (this._expansionModel) {
      const expansionModel = this._expansionModel;
      this._getAllDescendants()
        .pipe(takeUntil(this._onDestroy))
        .subscribe(children => {
          expansionModel.select(...children.map(child => this._getExpansionKey(child)));
        });
    }
  }

  /** Collapse all data nodes in the tree. */
  collapseAll(): void {
    if (this.treeControl) {
      this.treeControl.collapseAll();
    } else if (this._expansionModel) {
      const expansionModel = this._expansionModel;
      this._getAllDescendants()
        .pipe(takeUntil(this._onDestroy))
        .subscribe(children => {
          expansionModel.deselect(...children.map(child => this._getExpansionKey(child)));
        });
    }
  }

  /** Level accessor, used for compatibility between the old Tree and new Tree */
  _getLevelAccessor() {
    return this.treeControl?.getLevel ?? this.levelAccessor;
  }

  /** Children accessor, used for compatibility between the old Tree and new Tree */
  _getChildrenAccessor() {
    return this.treeControl?.getChildren ?? this.childrenAccessor;
  }

  /**
   * Gets the direct children of a node; used for compatibility between the old tree and the
   * new tree.
   */
  _getDirectChildren(dataNode: T): Observable<T[]> {
    const levelAccessor = this._getLevelAccessor();
    const expansionModel = this._expansionModel ?? this.treeControl?.expansionModel;
    if (levelAccessor && expansionModel) {
      const key = this._getExpansionKey(dataNode);
      const isExpanded = expansionModel.changed.pipe(
        switchMap(changes => {
          if (changes.added.includes(key)) {
            return observableOf(true);
          } else if (changes.removed.includes(key)) {
            return observableOf(false);
          }
          return EMPTY;
        }),
        startWith(this.isExpanded(dataNode)),
      );

      return combineLatest([isExpanded, this._flattenedNodes]).pipe(
        map(([expanded, flattenedNodes]) => {
          if (!expanded) {
            return [];
          }
          const startIndex = flattenedNodes.indexOf(dataNode);
          const level = levelAccessor(dataNode) + 1;
          const results: T[] = [];

          // Goes through flattened tree nodes in the `flattenedNodes` array, and get all direct
          // descendants. The level of descendants of a tree node must be equal to the level of the
          // given tree node + 1.
          // If we reach a node whose level is equal to the level of the tree node, we hit a sibling.
          // If we reach a node whose level is greater than the level of the tree node, we hit a
          // sibling of an ancestor.
          for (let i = startIndex + 1; i < flattenedNodes.length; i++) {
            const currentLevel = levelAccessor(flattenedNodes[i]);
            if (level > currentLevel) {
              break;
            }
            if (level === currentLevel) {
              results.push(flattenedNodes[i]);
            }
          }
          return results;
        }),
      );
    }
    const childrenAccessor = this._getChildrenAccessor();
    if (childrenAccessor) {
      return coerceObservable(childrenAccessor(dataNode) ?? []);
    }
    throw getTreeControlMissingError();
  }

  /**
   * Adds the specified node component to the tree's internal registry.
   *
   * This primarily facilitates keyboard navigation.
   */
  _registerNode(node: CdkTreeNode<T, K>) {
    this._nodes.value.set(this._getExpansionKey(node.data), node);
    this._nodes.next(this._nodes.value);
  }

  /** Removes the specified node component from the tree's internal registry. */
  _unregisterNode(node: CdkTreeNode<T, K>) {
    this._nodes.value.delete(this._getExpansionKey(node.data));
    this._nodes.next(this._nodes.value);
  }

  /**
   * For the given node, determine the level where this node appears in the tree.
   *
   * This is intended to be used for `aria-level` but is 0-indexed.
   */
  _getLevel(node: T) {
    return this._levels.get(this._getExpansionKey(node));
  }

  /**
   * For the given node, determine the size of the parent's child set.
   *
   * This is intended to be used for `aria-setsize`.
   */
  _getSetSize(dataNode: T) {
    const group = this._getNodeGroup(dataNode);
    return group.length;
  }

  /**
   * For the given node, determine the index (starting from 1) of the node in its parent's child set.
   *
   * This is intended to be used for `aria-posinset`.
   */
  _getPositionInSet(dataNode: T) {
    const group = this._getNodeGroup(dataNode);
    return group.indexOf(dataNode) + 1;
  }

  /** Given a CdkTreeNode, gets the node that renders that node's parent's data. */
  _getNodeParent(node: CdkTreeNode<T, K>) {
    const parent = this._parents.get(this._getExpansionKey(node.data));
    return parent && this._nodes.value.get(this._getExpansionKey(parent));
  }

  /** Given a CdkTreeNode, gets the nodes that renders that node's child data. */
  _getNodeChildren(node: CdkTreeNode<T, K>) {
    return this._getDirectChildren(node.data).pipe(
      map(children =>
        children
          .map(child => this._nodes.value.get(this._getExpansionKey(child)))
          .filter(isNotNullish),
      ),
    );
  }

  /** `keydown` event handler; this just passes the event to the `TreeKeyManager`. */
  _sendKeydownToKeyManager(event: KeyboardEvent) {
    this._keyManager.onKeydown(event);
  }

  /** `focus` event handler; this focuses the initial item if there isn't already one available. */
  _focusInitialTreeItem() {
    if (this._keyManager.getActiveItem()) {
      return;
    }
    this._keyManager.onInitialFocus();
  }

  /** Gets all nodes in the tree, using the cached nodes. */
  private _getAllDescendants(): Observable<readonly T[]> {
    if (this._flattenedNodes.value.length) {
      return this._flattenedNodes;
    }
    return observableOf([]);
  }

  private _getDescendants(dataNode: T): Observable<T[]> {
    if (this.treeControl) {
      return observableOf(this.treeControl.getDescendants(dataNode));
    }
    if (this.levelAccessor) {
      const startIndex = this._flattenedNodes.value.indexOf(dataNode);
      const results: T[] = [];

      // Goes through flattened tree nodes in the `dataNodes` array, and get all descendants.
      // The level of descendants of a tree node must be greater than the level of the given
      // tree node.
      // If we reach a node whose level is equal to the level of the tree node, we hit a sibling.
      // If we reach a node whose level is greater than the level of the tree node, we hit a
      // sibling of an ancestor.
      const currentLevel = this.levelAccessor(dataNode);
      for (
        let i = startIndex + 1;
        i < this._flattenedNodes.value.length &&
        currentLevel < this.levelAccessor(this._flattenedNodes.value[i]);
        i++
      ) {
        results.push(this._flattenedNodes.value[i]);
      }
      return observableOf(results);
    }
    if (this.childrenAccessor) {
      return this._getAllChildrenRecursively(dataNode).pipe(
        reduce((allChildren: T[], nextChildren) => {
          allChildren.push(...nextChildren);
          return allChildren;
        }, []),
      );
    }
    throw getTreeControlMissingError();
  }

  /**
   * Gets all children and sub-children of the provided node.
   *
   * This will emit multiple times, in the order that the children will appear
   * in the tree, and can be combined with a `reduce` operator.
   */
  private _getAllChildrenRecursively(dataNode: T): Observable<T[]> {
    if (!this.childrenAccessor) {
      return observableOf([]);
    }

    return coerceObservable(this.childrenAccessor(dataNode)).pipe(
      take(1),
      switchMap(children => {
        // Here, we cache the parents of a particular child so that we can compute the levels.
        for (const child of children) {
          this._parents.set(this._getExpansionKey(child), dataNode);
        }
        return observableOf(...children).pipe(
          concatMap(child => concat(observableOf([child]), this._getAllChildrenRecursively(child))),
        );
      }),
    );
  }

  private _getExpansionKey(dataNode: T): K {
    // In the case that a key accessor function was not provided by the
    // tree user, we'll default to using the node object itself as the key.
    //
    // This cast is safe since:
    // - if an expansionKey is provided, TS will infer the type of K to be
    //   the return type.
    // - if it's not, then K will be defaulted to T.
    return this.expansionKey?.(dataNode) ?? (dataNode as unknown as K);
  }

  private _getNodeGroup(node: T) {
    const level = this._levels.get(this._getExpansionKey(node));
    const parent = this._parents.get(this._getExpansionKey(node));
    const parentKey = parent ? this._getExpansionKey(parent) : null;
    const group = this._groups.get(level ?? 0)?.get(parentKey);
    return group ?? [node];
  }

  /**
   * Finds the parent for the given node. If this is a root node, this
   * returns null. If we're unable to determine the parent, for example,
   * if we don't have cached node data, this returns undefined.
   */
  private _findParentForNode(node: T, index: number): T | null {
    // In all cases, we have a mapping from node to level; all we need to do here is backtrack in
    // our flattened list of nodes to determine the first node that's of a level lower than the
    // provided node.
    let cachedNodes = this._flattenedNodes.value;
    if (!cachedNodes.length) {
      cachedNodes = this._preFlattenedNodes.value;
    }
    if (!cachedNodes.length) {
      return null;
    }
    const currentLevel = this._levels.get(this._getExpansionKey(node)) ?? 0;
    for (let parentIndex = index; parentIndex >= 0; parentIndex--) {
      const parentNode = cachedNodes[parentIndex];
      const parentLevel = this._levels.get(this._getExpansionKey(parentNode)) ?? 0;

      if (parentLevel < currentLevel) {
        return parentNode;
      }
    }
    return null;
  }

  /**
   * Converts children for certain tree configurations. Note also that this
   * caches the known nodes for use in other parts of the tree.
   */
  private _convertChildren(
    nodes: readonly T[],
    nodeType: 'flat' | 'nested' | null,
  ): Observable<readonly T[]> {
    // Initially, we pass through the data directly to the renderer, until
    // we can determine how to format the nodes for consumption by the actual
    // node component.
    if (nodeType === null) {
      return observableOf(nodes);
    }

    // The only situations where we have to convert children types is when
    // they're mismatched; i.e. if the tree is using a childrenAccessor and the
    // nodes are flat, or if the tree is using a levelAccessor and the nodes are
    // nested.
    if (this.childrenAccessor && nodeType === 'flat') {
      // This flattens children into a single array.
      return this._flattenRootNodes(nodes).pipe(
        tap(allNodes => {
          this._preFlattenedNodes.next(allNodes);
        }),
      );
    } else if (this.levelAccessor && nodeType === 'nested') {
      // In the nested case, we only look for root nodes. The CdkNestedNode
      // itself will handle rendering each individual node's children.
      const levelAccessor = this.levelAccessor;
      return observableOf(nodes.filter(node => levelAccessor(node) === 0)).pipe(
        tap(rootNodes => {
          this._preFlattenedNodes.next(nodes);
        }),
      );
    } else {
      // In the case of a TreeControl, we know that the node type matches up
      // with the TreeControl, and so no conversions are necessary.
      if (nodeType === 'flat') {
        this._preFlattenedNodes.next(nodes);
      } else {
        this._rootNodes.next(nodes);
      }
      return observableOf(nodes);
    }
  }

  private _flattenRootNodes(rootNodes: readonly T[]): Observable<T[]> {
    return observableOf(...rootNodes).pipe(
      concatMap(node => concat(observableOf([node]), this._getDescendants(node))),
      reduce((results, children) => {
        results.push(...children);
        return results;
      }, [] as T[]),
    );
  }

  private _isExpanded(dataNode: T): boolean {
    return (
      this._expansionModel?.isSelected(this._getExpansionKey(dataNode)) ??
      this.treeControl?.isExpanded(dataNode) ??
      false
    );
  }

  private _recalculateGroupsForLevelAccessor(): void {
    // Check that we're using level accessor. Levels have already been cached;
    // this is just here to prevent unnecessary work.
    if (!this._getLevelAccessor()) {
      return;
    }

    this._parents.clear();
    this._groups.clear();

    const flattenedNodes = this._flattenedNodes.value;
    for (let index = 0; index < flattenedNodes.length; index++) {
      const dataNode = flattenedNodes[index];
      const key = this._getExpansionKey(dataNode);
      const parent = this._findParentForNode(dataNode, index);
      this._parents.set(key, parent);
      const parentKey = parent ? this._getExpansionKey(parent) : null;

      const level = this._getLevel(dataNode) ?? 0;

      const currentGroup = this._groups.get(level) ?? new Map<K | null, T[]>();
      const group = currentGroup.get(parentKey) ?? [];
      group.splice(index, 0, dataNode);
      currentGroup.set(parentKey, group);
      this._groups.set(level, currentGroup);
    }
  }

  private _hasAllParentsExpanded(dataNode: T): boolean {
    const parent = this._parents.get(this._getExpansionKey(dataNode));
    if (parent === null) {
      return true;
    }
    // If we don't have any record of a parent here, this means the node is likely
    // removed from the DOM entirely and therefore cannot have parents expanded.
    if (parent === undefined) {
      return false;
    }
    return this._isExpanded(parent) && this._hasAllParentsExpanded(parent);
  }
}

/**
 * Tree node for CdkTree. It contains the data in the tree node.
 */
@Directive({
  selector: 'cdk-tree-node',
  exportAs: 'cdkTreeNode',
  host: {
    'class': 'cdk-tree-node',
    '[attr.aria-expanded]': '_getAriaExpanded()',
    '[attr.aria-level]': 'level + 1',
    '[attr.aria-posinset]': '_getPositionInSet()',
    '[attr.aria-setsize]': '_getSetSize()',
    'tabindex': '-1',
    'role': 'treeitem',
    '(click)': '_setActiveItem()',
  },
})
export class CdkTreeNode<T, K = T> implements OnDestroy, OnInit, TreeKeyManagerItem {
  /**
   * The role of the tree node.
   *
   * @deprecated This will be ignored; the tree will automatically determine the appropriate role for the tree node. This input will be
   *   removed in a future version.
   * @breaking-change 12.0.0 Remove this input
   */
  @Input() get role(): 'treeitem' | 'group' {
    return 'treeitem';
  }

  set role(_role: 'treeitem' | 'group') {
    // ignore any role setting, we handle this internally.
  }

  /**
   * Whether or not this node is expandable.
   *
   * If not using `FlatTreeControl`, or if `isExpandable` is not provided to
   * `NestedTreeControl`, this should be provided for correct node a11y.
   */
  @Input()
  get isExpandable() {
    return this._isExpandable();
  }
  set isExpandable(isExpandable: boolean | '' | null) {
    this._inputIsExpandable = coerceBooleanProperty(isExpandable);
  }

  @Input()
  get isExpanded(): boolean {
    return this._tree.isExpanded(this._data);
  }
  set isExpanded(isExpanded: boolean) {
    if (isExpanded) {
      this.expand();
    } else {
      this.collapse();
    }
  }

  /**
   * Whether or not this node is disabled. If it's disabled, then the user won't be able to focus
   * or activate this node.
   */
  @Input() isDisabled?: boolean;

  /** This emits when the node has been programatically activated. */
  @Output()
  readonly activation: EventEmitter<T> = new EventEmitter<T>();

  /** This emits when the node's expansion status has been changed. */
  @Output()
  readonly expandedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * The most recently created `CdkTreeNode`. We save it in static variable so we can retrieve it
   * in `CdkTree` and set the data to it.
   */
  static mostRecentTreeNode: CdkTreeNode<any> | null = null;

  /** Subject that emits when the component has been destroyed. */
  protected readonly _destroyed = new Subject<void>();

  /** Emits when the node's data has changed. */
  readonly _dataChanges = new Subject<void>();

  private _inputIsExpandable: boolean = false;
  private _parentNodeAriaLevel: number;

  /** The tree node's data. */
  get data(): T {
    return this._data;
  }
  set data(value: T) {
    if (value !== this._data) {
      this._data = value;
      this._dataChanges.next();
    }
  }
  protected _data: T;

  get level(): number {
    // If the tree has a levelAccessor, use it to get the level. Otherwise read the
    // aria-level off the parent node and use it as the level for this node (note aria-level is
    // 1-indexed, while this property is 0-indexed, so we don't need to increment).
    return this._tree._getLevel(this._data) ?? this._parentNodeAriaLevel;
  }

  /** Determines if the tree node is expandable. */
  _isExpandable(): boolean {
    if (typeof this._tree.treeControl?.isExpandable === 'function') {
      return this._tree.treeControl.isExpandable(this._data);
    }
    return this._inputIsExpandable;
  }

  /**
   * Determines the value for `aria-expanded`.
   *
   * For non-expandable nodes, this is `null`.
   */
  _getAriaExpanded(): string | null {
    if (!this._isExpandable()) {
      return null;
    }
    return String(this.isExpanded);
  }

  /**
   * Determines the size of this node's parent's child set.
   *
   * This is intended to be used for `aria-setsize`.
   */
  _getSetSize(): number {
    return this._tree._getSetSize(this._data);
  }

  /**
   * Determines the index (starting from 1) of this node in its parent's child set.
   *
   * This is intended to be used for `aria-posinset`.
   */
  _getPositionInSet(): number {
    return this._tree._getPositionInSet(this._data);
  }

  constructor(
    protected _elementRef: ElementRef<HTMLElement>,
    protected _tree: CdkTree<T, K>,
    public _changeDetectorRef: ChangeDetectorRef,
  ) {
    CdkTreeNode.mostRecentTreeNode = this as CdkTreeNode<T, K>;
  }

  ngOnInit(): void {
    this._parentNodeAriaLevel = getParentNodeAriaLevel(this._elementRef.nativeElement);
    this._tree._setNodeTypeIfUnset('flat');
    this._tree._registerNode(this);
  }

  ngOnDestroy() {
    // If this is the last tree node being destroyed,
    // clear out the reference to avoid leaking memory.
    if (CdkTreeNode.mostRecentTreeNode === this) {
      CdkTreeNode.mostRecentTreeNode = null;
    }

    this._dataChanges.complete();
    this._destroyed.next();
    this._destroyed.complete();
  }

  getParent(): CdkTreeNode<T, K> | null {
    return this._tree._getNodeParent(this) ?? null;
  }

  getChildren(): CdkTreeNode<T, K>[] | Observable<CdkTreeNode<T, K>[]> {
    return this._tree._getNodeChildren(this);
  }

  /** Focuses this data node. Implemented for TreeKeyManagerItem. */
  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  /** Emits an activation event. Implemented for TreeKeyManagerItem. */
  activate(): void {
    if (this.isDisabled) {
      return;
    }
    this.activation.next(this._data);
  }

  /** Collapses this data node. Implemented for TreeKeyManagerItem. */
  collapse(): void {
    if (typeof ngDevMode === 'undefined' || (ngDevMode && !this._isExpandable())) {
      throw getNodeNotExpandableError();
    }
    this._tree.collapse(this._data);
    this.expandedChange.emit(this.isExpanded);
  }

  /** Expands this data node. Implemented for TreeKeyManagerItem. */
  expand(): void {
    if (typeof ngDevMode === 'undefined' || (ngDevMode && !this._isExpandable())) {
      throw getNodeNotExpandableError();
    }
    this._tree.expand(this._data);
    this.expandedChange.emit(this.isExpanded);
  }

  _setTabFocusable() {
    this._elementRef.nativeElement.setAttribute('tabindex', '0');
  }

  _setTabUnfocusable() {
    this._elementRef.nativeElement.setAttribute('tabindex', '-1');
  }

  _setActiveItem() {
    if (this.isDisabled) {
      return;
    }
    this._tree._keyManager.onClick(this);
  }
}

function getParentNodeAriaLevel(nodeElement: HTMLElement): number {
  let parent = nodeElement.parentElement;
  while (parent && !isNodeElement(parent)) {
    parent = parent.parentElement;
  }
  if (!parent) {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      throw Error('Incorrect tree structure containing detached node.');
    } else {
      return -1;
    }
  } else if (parent.classList.contains('cdk-nested-tree-node')) {
    return coerceNumberProperty(parent.getAttribute('aria-level')!);
  } else {
    // The ancestor element is the cdk-tree itself
    return 0;
  }
}

function isNodeElement(element: HTMLElement) {
  const classList = element.classList;
  return !!(classList?.contains('cdk-nested-tree-node') || classList?.contains('cdk-tree'));
}
