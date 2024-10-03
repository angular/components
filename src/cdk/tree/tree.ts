/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  TREE_KEY_MANAGER,
  TreeKeyManagerFactory,
  TreeKeyManagerItem,
  TreeKeyManagerOptions,
  TreeKeyManagerStrategy,
} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {
  CollectionViewer,
  DataSource,
  isDataSource,
  SelectionChange,
  SelectionModel,
} from '@angular/cdk/collections';
import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  EmbeddedViewRef,
  Input,
  IterableChangeRecord,
  IterableDiffer,
  IterableDiffers,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TrackByFunction,
  input,
  computed,
  Signal,
  signal,
  effect,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  numberAttribute,
  inject,
  booleanAttribute,
  TemplateRef,
} from '@angular/core';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {coerceObservable} from '@angular/cdk/coercion/private';
import {
  BehaviorSubject,
  combineLatest,
  Subscriber,
  concat,
  EMPTY,
  Observable,
  Subject,
  isObservable,
  of as observableOf,
} from 'rxjs';
import {
  distinctUntilChanged,
  concatMap,
  map,
  reduce,
  startWith,
  switchMap,
  take,
  takeUntil,
  shareReplay,
  tap,
} from 'rxjs/operators';
import {TreeControl} from './control/tree-control';
import {CdkTreeNodeDef, CdkTreeNodeOutletContext} from './node';
import {CdkTreeNodeOutlet} from './outlet';
import {
  getMultipleTreeControlsError,
  getTreeControlMissingError,
  getTreeMissingMatchingNodeDefError,
  getTreeMultipleDefaultNodeDefsError,
  getTreeNoValidDataSourceError,
} from './tree-errors';
import {NgTemplateOutlet} from '@angular/common';

type RenderingData<T> =
  | {
      flattenedNodes: null;
      nodeType: null;
      renderNodes: readonly T[];
    }
  | {
      flattenedNodes: readonly T[];
      nodeType: 'nested' | 'flat';
      renderNodes: readonly T[];
    };

interface TemplateParams<T, K> {
  context: CdkTreeNodeOutletContext<T>;
  template: TemplateRef<CdkTreeNodeOutletContext<T>>;
  key: K;
}

class NodeOutletTemplateContext<T, K> {
  $implicit: Signal<Array<TemplateParams<T, K>>>;

  constructor(nodes: Signal<Array<TemplateParams<T, K>>>) {
    this.$implicit = nodes;
  }
}

/** @docs-private */
@Directive({
  selector: '[cdkTreeNodeRenderer]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgTemplateOutlet,
      inputs: ['ngTemplateOutlet: template', 'ngTemplateOutletContext: context'],
    },
  ],
})
export class CdkTreeNodeRenderer<T, K> implements OnInit {
  readonly node = input.required<TemplateParams<T, K>>();

  ngOnInit() {
    if (CdkTreeNode.mostRecentTreeNode) {
      CdkTreeNode.mostRecentTreeNode.data = this.node().context.$implicit;
    }
  }
}

/** @docs-private */
@Component({
  selector: 'cdk-tree-node-outlet-template',
  template: `
    <ng-template #outletTemplate let-nodes>
      @for (node of nodes(); track node.key) {
        <ng-container
            cdkTreeNodeRenderer
            [node]="node"
            [template]="node.template"
            [context]="node.context"
            />
      }
    </ng-template>
  `,
  standalone: true,
  styles: [`:host {display: none !important}`],
  imports: [CdkTreeNodeRenderer],
})
export class CdkTreeNodeOutletTemplate<T, K> {
  @ViewChild('outletTemplate', {static: true, read: TemplateRef}) _nodeOutletTemplate: TemplateRef<
    NodeOutletTemplateContext<T, K>
  >;
}

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
  },
  encapsulation: ViewEncapsulation.None,
  // The "OnPush" status for the `CdkTree` component is effectively a noop, so we are removing it.
  // The view for `CdkTree` consists entirely of templates declared in other views. As they are
  // declared elsewhere, they are checked when their declaration points are checked.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [CdkTreeNodeOutlet],
})
export class CdkTree<T, K = T>
  implements
    AfterContentChecked,
    AfterContentInit,
    AfterViewInit,
    CollectionViewer,
    OnDestroy,
    OnInit
{
  private _differs = inject(IterableDiffers);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _elementRef = inject(ElementRef);

  private _dir = inject(Directionality);
  private _viewContainer = inject(ViewContainerRef);

  /** Subject that emits when the component has been destroyed. */
  private readonly _onDestroy = new Subject<void>();

  /** Differ used to find the changes in the data provided by the data source. */
  private _dataDiffer: IterableDiffer<T>;

  /** Stores the node definition that does not have a when predicate. */
  private _defaultNodeDef: CdkTreeNodeDef<T> | null;

  /** Level of nodes */
  private _levels: Map<K, number> = new Map<K, number>();

  /** The immediate parents for a node. This is `null` if there is no parent. */
  private _parents: Map<K, T | null> = new Map<K, T | null>();

  /**
   * Nodes grouped into each set, which is a list of nodes displayed together in the DOM.
   *
   * Lookup key is the parent of a set. Root nodes have key of null.
   *
   * Values is a 'set' of tree nodes. Each tree node maps to a treeitem element. Sets are in the
   * order that it is rendered. Each set maps directly to aria-posinset and aria-setsize attributes.
   */
  private _ariaSets: Map<K | null, T[]> = new Map<K | null, T[]>();

  /**
   * Provides a stream containing the latest data array to render. Influenced by the tree's
   * stream of view window (what dataNodes are currently on screen).
   * Data source can be an observable of data array, or a data array to render.
   */
  @Input()
  get dataSource(): DataSource<T> | Observable<T[]> | T[] {
    return this._dataSource.value;
  }
  set dataSource(dataSource: DataSource<T> | Observable<T[]> | T[] | null) {
    if (this._dataSource.value !== dataSource) {
      this._dataSource.next(dataSource!);
    }
  }
  private readonly _dataSource = new BehaviorSubject<DataSource<T> | Observable<T[]> | T[]>([]);
  private readonly _transformedDataSource = this._dataSource.pipe(
    tap(dataSource => {
      if (!dataSource) {
        this._nodeOutlet.viewContainer.clear();
      }
    }),
    switchMap(dataSource => {
      if (isDataSource(dataSource)) {
        return this._fromDataSource(dataSource);
      } else if (isObservable(dataSource)) {
        return dataSource;
      } else if (Array.isArray(dataSource)) {
        return observableOf(dataSource);
      }

      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        throw getTreeNoValidDataSourceError();
      }
      return EMPTY;
    }),
  );

  /**
   * The tree controller
   *
   * @deprecated Use one of `levelAccessor` or `childrenAccessor` instead. To be removed in a
   * future version.
   * @breaking-change 21.0.0
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
  readonly trackBy = input<TrackByFunction<T>>();

  /**
   * Given a data node, determines the key by which we determine whether or not this node is expanded.
   */
  readonly expansionKey = input<(dataNode: T) => K>();

  // Outlets within the tree's template where the dataNodes will be inserted.
  @ViewChild(CdkTreeNodeOutlet, {static: true}) _nodeOutlet: CdkTreeNodeOutlet;

  /** The tree node template for the tree */
  @ContentChildren(CdkTreeNodeDef, {
    // We need to use `descendants: true`, because Ivy will no longer match
    // indirect descendants if it's left as false.
    descendants: true,
  })
  _nodeDefs: QueryList<CdkTreeNodeDef<T>>;

  private readonly _selection = new BehaviorSubject<readonly K[]>([]);

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

  /** The automatically determined node type for the tree. */
  private _nodeType = new BehaviorSubject<'flat' | 'nested' | null>(null);

  /** The mapping between data and the node that is rendered. */
  private _nodes: BehaviorSubject<Map<K, CdkTreeNode<T, K>>> = new BehaviorSubject(
    new Map<K, CdkTreeNode<T, K>>(),
  );

  /**
   * Synchronous cache of nodes for the `TreeKeyManager`. This is separate
   * from `_flattenedNodes` so they can be independently updated at different
   * times.
   */
  private _keyManagerNodes: BehaviorSubject<readonly T[]> = new BehaviorSubject<readonly T[]>([]);

  private _keyManagerFactory = inject(TREE_KEY_MANAGER) as TreeKeyManagerFactory<CdkTreeNode<T, K>>;

  /** The key manager for this tree. Handles focus and activation based on user keyboard input. */
  _keyManager: TreeKeyManagerStrategy<CdkTreeNode<T, K>>;
  private _viewInit = false;

  private readonly _expansionKeyFn = computed(() => {
    // In the case that a key accessor function was not provided by the
    // tree user, we'll default to using the node object itself as the key.
    //
    // This cast is safe since:
    // - if an expansionKey is provided, TS will infer the type of K to be
    //   the return type.
    // - if it's not, then K will be defaulted to T.
    return this.expansionKey() ?? ((item: T) => (item as unknown as K));
  });
  readonly _trackByFn = computed(() => {
    const trackBy = this.trackBy();
    if (trackBy) return trackBy;
    const expansionKey = this._expansionKeyFn();
    // Provide a default trackBy based on `_ExpansionKey` if one isn't provided.
    return (_index: number, item: T) => expansionKey(item);
  });

  private readonly _renderData = toSignal(
    combineLatest([this._transformedDataSource, this._nodeType, this._selection]).pipe(
      switchMap(([data, nodeType, expandedKeys]) =>
        this._getRenderData(data, nodeType, expandedKeys),
      ),
    ),
    {initialValue: null},
  );
  /**
   * Maintain a synchronous cache of flattened data nodes. This will only be
   * populated after initial render, and in certain cases, will be delayed due to
   * relying on Observable `getChildren` calls.
   */
  private readonly _flattenedNodes = computed(() => {
    return this._renderData()?.flattenedNodes ?? [];
  });
  private readonly _flatNodesObs = toObservable(this._flattenedNodes);
  private readonly _renderNodes = computed((): Array<TemplateParams<T, K>> => {
    const nodes = this._renderData()?.renderNodes ?? [];
    const levelAccessor = this._getLevelAccessor();
    const trackBy = this._trackByFn();

    return nodes.map((nodeData, index) => {
      const node = this._getNodeDef(nodeData, index);
      const key = this._getExpansionKey(nodeData);
      const parentData = this._parents.get(key) ?? undefined;

      const context = new CdkTreeNodeOutletContext<T>(nodeData);
      // If the tree is flat tree, then use the `getLevel` function in flat tree control
      // Otherwise, use the level of parent node.
      if (levelAccessor) {
        context.level = levelAccessor(nodeData);
      } else if (parentData !== undefined && this._levels.has(this._getExpansionKey(parentData))) {
        context.level = this._levels.get(this._getExpansionKey(parentData))! + 1;
      } else {
        context.level = 0;
      }
      this._levels.set(key, context.level);
      return {
        context,
        template: node.template,
        key: trackBy(index, nodeData),
      };
    });
  });

  constructor(...args: unknown[]);
  constructor() {
    effect(
      () => {
        this._renderDataChanges(this._renderData());
      },
      {allowSignalWrites: true},
    );
  }

  ngAfterContentInit() {
    this._initializeKeyManager();
  }

  ngAfterContentChecked() {
    this._updateDefaultNodeDefinition();
  }

  ngOnDestroy() {
    this._nodeOutlet.viewContainer.clear();

    this.viewChange.complete();
    this._onDestroy.next();
    this._onDestroy.complete();

    // In certain tests, the tree might be destroyed before this is initialized
    // in `ngAfterContentInit`.
    this._keyManager?.destroy();
  }

  ngOnInit() {
    this._checkTreeControlUsage();
    this._initializeDataDiffer();
    this._subscribeToExpansionChanges();
  }

  ngAfterViewInit() {
    this._viewInit = true;
    const componentRef = this._viewContainer.createComponent(CdkTreeNodeOutletTemplate);
    this._nodeOutlet.viewContainer.createEmbeddedView(
      componentRef.instance._nodeOutletTemplate,
      new NodeOutletTemplateContext(this._renderNodes),
    );
  }

  private _updateDefaultNodeDefinition() {
    const defaultNodeDefs = this._nodeDefs.filter(def => !def.when);
    if (defaultNodeDefs.length > 1 && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw getTreeMultipleDefaultNodeDefsError();
    }
    this._defaultNodeDef = defaultNodeDefs[0];
  }

  /**
   * Sets the node type for the tree, if it hasn't been set yet.
   *
   * This will be called by the first node that's rendered in order for the tree
   * to determine what data transformations are required.
   */
   _setNodeTypeIfUnset(newType: 'flat' | 'nested') {
     const currentType = this._nodeType.value;
 
     if (currentType === null) {
       this._nodeType.next(newType);
     } else if ((typeof ngDevMode === 'undefined' || ngDevMode) && currentType !== newType) {
       console.warn(
         `Tree is using conflicting node types which can cause unexpected behavior. ` +
           `Please use tree nodes of the same type (e.g. only flat or only nested). ` +
           `Current node type: "${currentType}", new node type "${newType}".`,
       );
    }
  }

  private _subscribeToExpansionChanges() {
    const model = this._getExpansionModel();
    this._selection.next([...model.selected]);
    model.changed.pipe(takeUntil(this._onDestroy)).subscribe(changes => {
      this._emitExpansionChanges(changes);
      this._selection.next([...model.selected]);
    });
  }

  _getExpansionModel() {
    if (!this.treeControl) {
      this._expansionModel ??= new SelectionModel<K>(true);
      return this._expansionModel;
    }
    return this.treeControl.expansionModel;
  }

  /** Given the raw data, returns an Observable containing the RenderingData */
  private _getRenderData(
    data: readonly T[],
    nodeType: 'flat' | 'nested' | null,
    selection: readonly K[],
  ): Observable<RenderingData<T>> {
    if (nodeType === null) {
      return observableOf({renderNodes: data, flattenedNodes: null, nodeType} as const);
    }

    // If we're here, then we know what our node type is, and therefore can
    // perform our usual rendering pipeline, which necessitates converting the data
    return this._computeRenderingData(data, nodeType, selection).pipe(
      map(convertedData => ({...convertedData, nodeType}) as const),
    );
  }

  private _renderDataChanges(data: RenderingData<T> | null) {
    if (!data) {
      return;
    }

    if (data.nodeType === null) {
      return;
    }

    // If we're here, then we know what our node type is, and therefore can
    // perform our usual rendering pipeline.
    this._updateKeyManagerItems(data.flattenedNodes);
    // Explicitly detect the initial set of changes to this component subtree
    this._changeDetectorRef.detectChanges();
  }

  private _emitExpansionChanges(expansionChanges: SelectionChange<K> | null) {
    if (!expansionChanges) {
      return;
    }

    const nodes = this._nodes.value;
    for (const added of expansionChanges.added) {
      const node = nodes.get(added);
      node?._emitExpansionState(true);
    }
    for (const removed of expansionChanges.removed) {
      const node = nodes.get(removed);
      node?._emitExpansionState(false);
    }
  }

  private _initializeKeyManager() {
    const items = combineLatest([this._keyManagerNodes, this._nodes]).pipe(
      map(([keyManagerNodes, renderNodes]) =>
        keyManagerNodes.reduce<CdkTreeNode<T, K>[]>((items, data) => {
          const node = renderNodes.get(this._getExpansionKey(data));
          if (node) {
            items.push(node);
          }
          return items;
        }, []),
      ),
    );

    const keyManagerOptions: TreeKeyManagerOptions<CdkTreeNode<T, K>> = {
      trackBy: node => this._getExpansionKey(node.data),
      skipPredicate: node => !!node.isDisabled,
      typeAheadDebounceInterval: true,
      horizontalOrientation: this._dir.value,
    };

    this._keyManager = this._keyManagerFactory(items, keyManagerOptions);
  }

  private _initializeDataDiffer() {
    this._dataDiffer = this._differs.find([]).create(this._trackByFn());
  }

  private _checkTreeControlUsage() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      // Verify that Tree follows API contract of using one of TreeControl, levelAccessor or
      // childrenAccessor. Throw an appropriate error if contract is not met.
      let numTreeControls = 0;

      if (this.treeControl) {
        numTreeControls++;
      }
      if (this.levelAccessor) {
        numTreeControls++;
      }
      if (this.childrenAccessor) {
        numTreeControls++;
      }

      if (!numTreeControls) {
        throw getTreeControlMissingError();
      } else if (numTreeControls > 1) {
        throw getMultipleTreeControlsError();
      }
    }
  }

  /** Check for changes made in the data and render each change (node added/removed/moved). */
  renderNodeChanges(
    data: readonly T[],
    dataDiffer: IterableDiffer<T> = this._dataDiffer,
    viewContainer: ViewContainerRef = this._nodeOutlet.viewContainer,
    parentData?: T,
  ) {
    const changes = dataDiffer.diff(data);

    // Some tree consumers expect change detection to propagate to nodes
    // even when the array itself hasn't changed; we explicitly detect changes
    // anyways in order for nodes to update their data.
    //
    // However, if change detection is called while the component's view is
    // still initing, then the order of child views initing will be incorrect;
    // to prevent this, we only exit early if the view hasn't initialized yet.
    if (!changes && !this._viewInit) {
      return;
    }

    changes?.forEachOperation(
      (
        item: IterableChangeRecord<T>,
        adjustedPreviousIndex: number | null,
        currentIndex: number | null,
      ) => {
        if (item.previousIndex == null) {
          this.insertNode(data[currentIndex!], currentIndex!, viewContainer, parentData);
        } else if (currentIndex == null) {
          viewContainer.remove(adjustedPreviousIndex!);
        } else {
          const view = viewContainer.get(adjustedPreviousIndex!);
          viewContainer.move(view!, currentIndex);
        }
      },
    );

    // If the data itself changes, but keeps the same trackBy, we need to update the templates'
    // context to reflect the new object.
    changes?.forEachIdentityChange((record: IterableChangeRecord<T>) => {
      const newData = record.item;
      if (record.currentIndex != undefined) {
        const view = viewContainer.get(record.currentIndex);
        (view as EmbeddedViewRef<any>).context.$implicit = newData;
      }
    });

    // Note: we only `detectChanges` from a top-level call, otherwise we risk overflowing
    // the call stack since this method is called recursively (see #29733.)
    // TODO: change to `this._changeDetectorRef.markForCheck()`,
    // or just switch this component to use signals.
    if (parentData) {
      this._changeDetectorRef.markForCheck();
    } else {
      this._changeDetectorRef.detectChanges();
    }
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

    const node = this._getNodeDef(nodeData, index);
    const key = this._getExpansionKey(nodeData);

    // Node context that will be provided to created embedded view
    const context = new CdkTreeNodeOutletContext<T>(nodeData);

    parentData ??= this._parents.get(key) ?? undefined;
    // If the tree is flat tree, then use the `getLevel` function in flat tree control
    // Otherwise, use the level of parent node.
    if (levelAccessor) {
      context.level = levelAccessor(nodeData);
    } else if (parentData !== undefined && this._levels.has(this._getExpansionKey(parentData))) {
      context.level = this._levels.get(this._getExpansionKey(parentData))! + 1;
    } else {
      context.level = 0;
    }
    this._levels.set(key, context.level);

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
    return !!(
      this.treeControl?.isExpanded(dataNode) ||
      this._expansionModel?.isSelected(this._getExpansionKey(dataNode))
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
      expansionModel.select(...this._flattenedNodes().map(child => this._getExpansionKey(child)));
    }
  }

  /** Collapse all data nodes in the tree. */
  collapseAll(): void {
    if (this.treeControl) {
      this.treeControl.collapseAll();
    } else if (this._expansionModel) {
      const expansionModel = this._expansionModel;
      expansionModel.deselect(...this._flattenedNodes().map(child => this._getExpansionKey(child)));
    }
  }

  /** Level accessor, used for compatibility between the old Tree and new Tree */
  _getLevelAccessor() {
    return this.treeControl?.getLevel?.bind(this.treeControl) ?? this.levelAccessor;
  }

  /** Children accessor, used for compatibility between the old Tree and new Tree */
  _getChildrenAccessor() {
    return this.treeControl?.getChildren?.bind(this.treeControl) ?? this.childrenAccessor;
  }

  /**
   * Gets the direct children of a node; used for compatibility between the old tree and the
   * new tree.
   */
  _getDirectChildren(dataNode: T): Observable<T[]> {
    const levelAccessor = this._getLevelAccessor();
    const expansionModel = this._expansionModel ?? this.treeControl?.expansionModel;
    if (!expansionModel) {
      return observableOf([]);
    }

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

    if (levelAccessor) {
      return combineLatest([isExpanded, this._flatNodesObs]).pipe(
        map(([expanded, flattenedNodes]) => {
          if (!expanded) {
            return [];
          }
          return this._findChildrenByLevel(levelAccessor, flattenedNodes, dataNode, 1);
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
   * Given the list of flattened nodes, the level accessor, and the level range within
   * which to consider children, finds the children for a given node.
   *
   * For example, for direct children, `levelDelta` would be 1. For all descendants,
   * `levelDelta` would be Infinity.
   */
  private _findChildrenByLevel(
    levelAccessor: (node: T) => number,
    flattenedNodes: readonly T[],
    dataNode: T,
    levelDelta: number,
  ): T[] {
    const key = this._getExpansionKey(dataNode);
    const startIndex = flattenedNodes.findIndex(node => this._getExpansionKey(node) === key);
    const dataNodeLevel = levelAccessor(dataNode);
    const expectedLevel = dataNodeLevel + levelDelta;
    const results: T[] = [];

    // Goes through flattened tree nodes in the `flattenedNodes` array, and get all
    // descendants within a certain level range.
    //
    // If we reach a node whose level is equal to or less than the level of the tree node,
    // we hit a sibling or parent's sibling, and should stop.
    for (let i = startIndex + 1; i < flattenedNodes.length; i++) {
      const currentLevel = levelAccessor(flattenedNodes[i]);
      if (currentLevel <= dataNodeLevel) {
        break;
      }
      if (currentLevel <= expectedLevel) {
        results.push(flattenedNodes[i]);
      }
    }
    return results;
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
    const set = this._getAriaSet(dataNode);
    return set.length;
  }

  /**
   * For the given node, determine the index (starting from 1) of the node in its parent's child set.
   *
   * This is intended to be used for `aria-posinset`.
   */
  _getPositionInSet(dataNode: T) {
    const set = this._getAriaSet(dataNode);
    const key = this._getExpansionKey(dataNode);
    return set.findIndex(node => this._getExpansionKey(node) === key) + 1;
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
        children.reduce<CdkTreeNode<T, K>[]>((nodes, child) => {
          const value = this._nodes.value.get(this._getExpansionKey(child));
          if (value) {
            nodes.push(value);
          }

          return nodes;
        }, []),
      ),
    );
  }

  /** `keydown` event handler; this just passes the event to the `TreeKeyManager`. */
  protected _sendKeydownToKeyManager(event: KeyboardEvent): void {
    // Only handle events directly on the tree or directly on one of the nodes, otherwise
    // we risk interfering with events in the projected content (see #29828).
    if (event.target === this._elementRef.nativeElement) {
      this._keyManager.onKeydown(event);
    } else {
      const nodes = this._nodes.getValue();
      for (const [, node] of nodes) {
        if (event.target === node._elementRef.nativeElement) {
          this._keyManager.onKeydown(event);
          break;
        }
      }
    }
  }

  /** Gets all nested descendants of a given node. */
  private _getDescendants(dataNode: T): Observable<T[]> {
    if (this.treeControl) {
      return observableOf(this.treeControl.getDescendants(dataNode));
    }
    if (this.levelAccessor) {
      const results = this._findChildrenByLevel(
        this.levelAccessor,
        this._flattenedNodes(),
        dataNode,
        Infinity,
      );
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
    return this._expansionKeyFn()(dataNode);
  }

  private _getAriaSet(node: T) {
    const key = this._getExpansionKey(node);
    const parent = this._parents.get(key);
    const parentKey = parent ? this._getExpansionKey(parent) : null;
    const set = this._ariaSets.get(parentKey);
    return set ?? [node];
  }

  /**
   * Finds the parent for the given node. If this is a root node, this
   * returns null. If we're unable to determine the parent, for example,
   * if we don't have cached node data, this returns undefined.
   */
  private _findParentForNode(node: T, index: number, cachedNodes: readonly T[]): T | null {
    // In all cases, we have a mapping from node to level; all we need to do here is backtrack in
    // our flattened list of nodes to determine the first node that's of a level lower than the
    // provided node.
    if (!cachedNodes.length) {
      return null;
    }
    const currentLevel = this._levels.get(this._getExpansionKey(node)) ?? 0;
    for (let parentIndex = index - 1; parentIndex >= 0; parentIndex--) {
      const parentNode = cachedNodes[parentIndex];
      const parentLevel = this._levels.get(this._getExpansionKey(parentNode)) ?? 0;

      if (parentLevel < currentLevel) {
        return parentNode;
      }
    }
    return null;
  }

  /**
   * Given a set of root nodes and the current node level, flattens any nested
   * nodes into a single array.
   *
   * If any nodes are not expanded, then their children will not be added into the array.
   * This will still traverse all nested children in order to build up our internal data
   * models, but will not include them in the returned array.
   */
  private _flattenNestedNodesWithExpansion(
    nodes: readonly T[],
    selection: readonly K[],
    level = 0,
  ): Observable<T[]> {
    const childrenAccessor = this._getChildrenAccessor();
    // If we're using a level accessor, we don't need to flatten anything.
    if (!childrenAccessor) {
      return observableOf([...nodes]);
    }

    return observableOf(...nodes).pipe(
      concatMap(node => {
        const parentKey = this._getExpansionKey(node);
        if (!this._parents.has(parentKey)) {
          this._parents.set(parentKey, null);
        }
        this._levels.set(parentKey, level);

        const children = coerceObservable(childrenAccessor(node));
        return concat(
          observableOf([node]),
          children.pipe(
            take(1),
            tap(childNodes => {
              this._ariaSets.set(parentKey, [...(childNodes ?? [])]);
              for (const child of childNodes ?? []) {
                const childKey = this._getExpansionKey(child);
                this._parents.set(childKey, node);
                this._levels.set(childKey, level + 1);
              }
            }),
            switchMap(childNodes => {
              if (!childNodes) {
                return observableOf([]);
              }
              return this._flattenNestedNodesWithExpansion(childNodes, selection, level + 1).pipe(
                map(nestedNodes => (selection.includes(parentKey) ? nestedNodes : [])),
              );
            }),
          ),
        );
      }),
      reduce((results, children) => {
        results.push(...children);
        return results;
      }, [] as T[]),
    );
  }

  /**
   * Converts children for certain tree configurations.
   *
   * This also computes parent, level, and group data.
   */
  private _computeRenderingData(
    nodes: readonly T[],
    nodeType: 'flat' | 'nested',
    selection: readonly K[],
  ): Observable<{
    renderNodes: readonly T[];
    flattenedNodes: readonly T[];
  }> {
    // The only situations where we have to convert children types is when
    // they're mismatched; i.e. if the tree is using a childrenAccessor and the
    // nodes are flat, or if the tree is using a levelAccessor and the nodes are
    // nested.
    if (this.childrenAccessor && nodeType === 'flat') {
      // This flattens children into a single array.
      this._ariaSets.set(null, [...nodes]);
      return this._flattenNestedNodesWithExpansion(nodes, selection).pipe(
        map(flattenedNodes => ({
          renderNodes: flattenedNodes,
          flattenedNodes,
        })),
      );
    } else if (this.levelAccessor && nodeType === 'nested') {
      // In the nested case, we only look for root nodes. The CdkNestedNode
      // itself will handle rendering each individual node's children.
      const levelAccessor = this.levelAccessor;
      return observableOf(nodes.filter(node => levelAccessor(node) === 0)).pipe(
        map(rootNodes => ({
          renderNodes: rootNodes,
          flattenedNodes: nodes,
        })),
        tap(({flattenedNodes}) => {
          this._calculateParents(flattenedNodes);
        }),
      );
    } else if (nodeType === 'flat') {
      // In the case of a TreeControl, we know that the node type matches up
      // with the TreeControl, and so no conversions are necessary. Otherwise,
      // we've already confirmed that the data model matches up with the
      // desired node type here.
      return observableOf({renderNodes: nodes, flattenedNodes: nodes}).pipe(
        tap(({flattenedNodes}) => {
          this._calculateParents(flattenedNodes);
        }),
      );
    } else {
      // For nested nodes, we still need to perform the node flattening in order
      // to maintain our caches for various tree operations.
      this._ariaSets.set(null, [...nodes]);
      return this._flattenNestedNodesWithExpansion(nodes, selection).pipe(
        map(flattenedNodes => ({
          renderNodes: nodes,
          flattenedNodes,
        })),
      );
    }
  }

  private _updateKeyManagerItems(flattenedNodes: readonly T[]) {
    this._keyManagerNodes.next(flattenedNodes);
  }

  /** Traverse the flattened node data and compute parents, levels, and group data. */
  private _calculateParents(flattenedNodes: readonly T[]): void {
    const levelAccessor = this._getLevelAccessor();
    if (!levelAccessor) {
      return;
    }

    this._parents.clear();
    this._ariaSets.clear();

    for (let index = 0; index < flattenedNodes.length; index++) {
      const dataNode = flattenedNodes[index];
      const key = this._getExpansionKey(dataNode);
      this._levels.set(key, levelAccessor(dataNode));
      const parent = this._findParentForNode(dataNode, index, flattenedNodes);
      this._parents.set(key, parent);
      const parentKey = parent ? this._getExpansionKey(parent) : null;

      const group = this._ariaSets.get(parentKey) ?? [];
      group.splice(index, 0, dataNode);
      this._ariaSets.set(parentKey, group);
    }
  }

  private _fromDataSource(dataSource: DataSource<T>): Observable<readonly T[]> {
    return new Observable((subscriber: Subscriber<readonly T[]>) => {
      const subscription = dataSource.connect(this).subscribe({
        next(val) {
          subscriber.next(val);
        },
        error(err) {
          subscriber.next(err);
        },
        complete() {
          subscriber.complete();
        },
      });

      return () => {
        dataSource.disconnect(this);
        subscription.unsubscribe();
      };
    }).pipe(shareReplay({bufferSize: 1, refCount: true}));
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
    '[tabindex]': '_tabindex()',
    'role': 'treeitem',
    '(click)': '_setActiveItem()',
    '(focus)': '_focusItem()',
  },
})
export class CdkTreeNode<T, K = T> implements OnDestroy, OnInit, TreeKeyManagerItem {
  _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected _tree = inject<CdkTree<T, K>>(CdkTree);
  protected readonly _tabindex = signal<number | null>(-1);
  protected readonly _type: 'flat' | 'nested' = 'flat';

  /**
   * The role of the tree node.
   *
   * @deprecated This will be ignored; the tree will automatically determine the appropriate role
   * for tree node. This input will be removed in a future version.
   * @breaking-change 21.0.0
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
  @Input({transform: booleanAttribute})
  get isExpandable() {
    return this._isExpandable();
  }
  set isExpandable(isExpandable: boolean) {
    this._inputIsExpandable = isExpandable;
    if ((this.data && !this._isExpandable) || !this._inputIsExpandable) {
      return;
    }
    // If the node is being set to expandable, ensure that the status of the
    // node is propagated
    if (this._inputIsExpanded) {
      this.expand();
    } else if (this._inputIsExpanded === false) {
      this.collapse();
    }
  }

  @Input()
  get isExpanded(): boolean {
    return this._tree.isExpanded(this._data);
  }
  set isExpanded(isExpanded: boolean) {
    this._inputIsExpanded = isExpanded;
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
  @Input({transform: booleanAttribute}) isDisabled: boolean;

  /**
   * The text used to locate this item during typeahead. If not specified, the `textContent` will
   * will be used.
   */
  @Input('cdkTreeNodeTypeaheadLabel') typeaheadLabel: string | null;

  getLabel(): string {
    return this.typeaheadLabel || this._elementRef.nativeElement.textContent?.trim() || '';
  }

  /** This emits when the node has been programatically activated or activated by keyboard. */
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
  private _inputIsExpanded: boolean | undefined = undefined;
  /**
   * Flag used to determine whether or not we should be focusing the actual element based on
   * some user interaction (click or focus). On click, we don't forcibly focus the element
   * since the click could trigger some other component that wants to grab its own focus
   * (e.g. menu, dialog).
   */
  private _shouldFocus = true;
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

  /* If leaf node, return true to not assign aria-expanded attribute */
  get isLeafNode(): boolean {
    // If flat tree node data returns false for expandable property, it's a leaf node
    if (
      this._tree.treeControl?.isExpandable !== undefined &&
      !this._tree.treeControl.isExpandable(this._data)
    ) {
      return true;

      // If nested tree node data returns 0 descendants, it's a leaf node
    } else if (
      this._tree.treeControl?.isExpandable === undefined &&
      this._tree.treeControl?.getDescendants(this._data).length === 0
    ) {
      return true;
    }

    return false;
  }

  get level(): number {
    // If the tree has a levelAccessor, use it to get the level. Otherwise read the
    // aria-level off the parent node and use it as the level for this node (note aria-level is
    // 1-indexed, while this property is 0-indexed, so we don't need to increment).
    return this._tree._getLevel(this._data) ?? this._parentNodeAriaLevel;
  }

  /** Determines if the tree node is expandable. */
  _isExpandable(): boolean {
    if (this._tree.treeControl) {
      if (this.isLeafNode) {
        return false;
      }

      // For compatibility with trees created using TreeControl before we added
      // CdkTreeNode#isExpandable.
      return true;
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

  private _changeDetectorRef = inject(ChangeDetectorRef);

  constructor(...args: unknown[]);

  constructor() {
    CdkTreeNode.mostRecentTreeNode = this as CdkTreeNode<T, K>;
  }

  ngOnInit(): void {
    this._parentNodeAriaLevel = getParentNodeAriaLevel(this._elementRef.nativeElement);
    this._tree
      ._getExpansionModel()
      .changed.pipe(
        map(() => this.isExpanded),
        distinctUntilChanged(),
      )
      .subscribe(() => this._changeDetectorRef.markForCheck());
    this._tree._setNodeTypeIfUnset(this._type);
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
    this._tabindex.set(0);
    if (this._shouldFocus) {
      this._elementRef.nativeElement.focus();
    }
  }

  /** Defocus this data node. */
  unfocus(): void {
    this._tabindex.set(-1);
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
    if (this.isExpandable) {
      this._tree.collapse(this._data);
    }
  }

  /** Expands this data node. Implemented for TreeKeyManagerItem. */
  expand(): void {
    if (this.isExpandable) {
      this._tree.expand(this._data);
    }
  }

  /** Makes the node focusable. Implemented for TreeKeyManagerItem. */
  makeFocusable(): void {
    this._tabindex.set(0);
  }

  _focusItem() {
    if (this.isDisabled) {
      return;
    }
    this._tree._keyManager.focusItem(this);
  }

  _setActiveItem() {
    if (this.isDisabled) {
      return;
    }
    this._shouldFocus = false;
    this._tree._keyManager.focusItem(this);
    this._shouldFocus = true;
  }

  _emitExpansionState(expanded: boolean) {
    this.expandedChange.emit(expanded);
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
    return numberAttribute(parent.getAttribute('aria-level')!);
  } else {
    // The ancestor element is the cdk-tree itself
    return 0;
  }
}

function isNodeElement(element: HTMLElement) {
  const classList = element.classList;
  return !!(classList?.contains('cdk-nested-tree-node') || classList?.contains('cdk-tree'));
}
