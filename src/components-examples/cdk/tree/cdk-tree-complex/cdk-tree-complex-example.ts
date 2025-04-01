import {CdkTreeModule} from '@angular/cdk/tree';
import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {BehaviorSubject, Observable, combineLatest, of as observableOf} from 'rxjs';
import {delay, map, shareReplay} from 'rxjs/operators';

interface BackendData {
  id: string;
  name: string;
  parent?: string;
  children?: string[];
}

const TREE_DATA: Map<string, BackendData> = new Map(
  [
    {
      id: '1',
      name: 'Fruit',
      children: ['1-1', '1-2', '1-3'],
    },
    {id: '1-1', name: 'Apple', parent: '1'},
    {id: '1-2', name: 'Banana', parent: '1'},
    {id: '1-3', name: 'Fruit Loops', parent: '1'},
    {
      id: '2',
      name: 'Vegetables',
      children: ['2-1', '2-2'],
    },
    {
      id: '2-1',
      name: 'Green',
      parent: '2',
      children: ['2-1-1', '2-1-2'],
    },
    {
      id: '2-2',
      name: 'Orange',
      parent: '2',
      children: ['2-2-1', '2-2-2'],
    },
    {id: '2-1-1', name: 'Broccoli', parent: '2-1'},
    {id: '2-1-2', name: 'Brussel sprouts', parent: '2-1'},
    {id: '2-2-1', name: 'Pumpkins', parent: '2-2'},
    {id: '2-2-2', name: 'Carrots', parent: '2-2'},
  ].map(datum => [datum.id, datum]),
);

class FakeDataBackend {
  private _getRandomDelayTime() {
    // anywhere from 100 to 500ms.
    return Math.floor(Math.random() * 400) + 100;
  }

  getChildren(id: string): Observable<BackendData[]> {
    // first, find the specified ID in our tree
    const item = TREE_DATA.get(id);
    const children = item?.children ?? [];

    return observableOf(children.map(childId => TREE_DATA.get(childId)!)).pipe(
      delay(this._getRandomDelayTime()),
    );
  }

  getRoots(): Observable<BackendData[]> {
    return observableOf([...TREE_DATA.values()].filter(datum => !datum.parent)).pipe(
      delay(this._getRandomDelayTime()),
    );
  }
}

type LoadingState = 'INIT' | 'LOADING' | 'LOADED';

interface RawData {
  id: string;
  name: string;
  parentId?: string;
  childrenIds?: string[];
  childrenLoading: LoadingState;
}

class TransformedData {
  constructor(public raw: RawData) {}

  areChildrenLoading() {
    return this.raw.childrenLoading === 'LOADING';
  }

  isExpandable() {
    return (
      (this.raw.childrenLoading === 'INIT' || this.raw.childrenLoading === 'LOADED') &&
      !!this.raw.childrenIds?.length
    );
  }

  isLeaf() {
    return !this.isExpandable() && !this.areChildrenLoading();
  }
}

interface State {
  rootIds: string[];
  rootsLoading: LoadingState;
  allData: Map<string, RawData>;
  dataLoading: Map<string, LoadingState>;
}

type ObservedValueOf<T> = T extends Observable<infer U> ? U : never;

type ObservedValuesOf<T extends readonly Observable<unknown>[]> = {
  [K in keyof T]: ObservedValueOf<T[K]>;
};

type TransformFn<T extends readonly Observable<unknown>[], U> = (
  ...args: [...ObservedValuesOf<T>, State]
) => U;

class ComplexDataStore {
  private readonly _backend = new FakeDataBackend();

  private _state = new BehaviorSubject<State>({
    rootIds: [],
    rootsLoading: 'INIT',
    allData: new Map(),
    dataLoading: new Map(),
  });

  private readonly _rootIds = this.select(state => state.rootIds);
  private readonly _allData = this.select(state => state.allData);
  private readonly _loadingData = this.select(state => state.dataLoading);
  private readonly _rootsLoadingState = this.select(state => state.rootsLoading);
  readonly areRootsLoading = this.select(
    this._rootIds,
    this._loadingData,
    this._rootsLoadingState,
    (rootIds, loading, rootsLoading) =>
      rootsLoading !== 'LOADED' || rootIds.some(id => loading.get(id) !== 'LOADED'),
  );
  readonly roots = this.select(
    this.areRootsLoading,
    this._rootIds,
    this._allData,
    (rootsLoading, rootIds, data) => {
      if (rootsLoading) {
        return [];
      }
      return this._getDataByIds(rootIds, data);
    },
  );

  getChildren(parentId: string) {
    return this.select(this._allData, this._loadingData, (data, loading) => {
      const parentData = data.get(parentId);
      if (parentData?.childrenLoading !== 'LOADED') {
        return [];
      }
      const childIds = parentData.childrenIds ?? [];
      if (childIds.some(id => loading.get(id) !== 'LOADED')) {
        return [];
      }
      return this._getDataByIds(childIds, data);
    });
  }

  loadRoots() {
    this._setRootsLoading();
    this._backend.getRoots().subscribe(roots => {
      this._setRoots(roots);
    });
  }

  loadChildren(parentId: string) {
    this._setChildrenLoading(parentId);
    this._backend.getChildren(parentId).subscribe(children => {
      this._addLoadedData(parentId, children);
    });
  }

  private _setRootsLoading() {
    this._state.next({
      ...this._state.value,
      rootsLoading: 'LOADING',
    });
  }

  private _setRoots(roots: BackendData[]) {
    const currentState = this._state.value;

    this._state.next({
      ...currentState,
      rootIds: roots.map(root => root.id),
      rootsLoading: 'LOADED',
      ...this._addData(currentState, roots),
    });
  }

  private _setChildrenLoading(parentId: string) {
    const currentState = this._state.value;
    const parentData = currentState.allData.get(parentId);

    this._state.next({
      ...currentState,
      allData: new Map([
        ...currentState.allData,
        ...(parentData ? ([[parentId, {...parentData, childrenLoading: 'LOADING'}]] as const) : []),
      ]),
      dataLoading: new Map([
        ...currentState.dataLoading,
        ...(parentData?.childrenIds?.map(childId => [childId, 'LOADING'] as const) ?? []),
      ]),
    });
  }

  private _addLoadedData(parentId: string, childData: BackendData[]) {
    const currentState = this._state.value;

    this._state.next({
      ...currentState,
      ...this._addData(currentState, childData, parentId),
    });
  }

  private _addData(
    {allData, dataLoading}: State,
    data: BackendData[],
    parentId?: string,
  ): Pick<State, 'allData' | 'dataLoading'> {
    const parentData = parentId && allData.get(parentId);
    const allChildren = data.flatMap(datum => datum.children ?? []);
    return {
      allData: new Map([
        ...allData,
        ...data.map(datum => {
          return [
            datum.id,
            {
              id: datum.id,
              name: datum.name,
              parentId,
              childrenIds: datum.children,
              childrenLoading: 'INIT',
            },
          ] as const;
        }),
        ...(parentData ? ([[parentId, {...parentData, childrenLoading: 'LOADED'}]] as const) : []),
      ]),
      dataLoading: new Map([
        ...dataLoading,
        ...data.map(datum => [datum.id, 'LOADED'] as const),
        ...allChildren.map(childId => [childId, 'INIT'] as const),
      ]),
    };
  }

  private _getDataByIds(ids: string[], data: State['allData']) {
    return ids
      .map(id => data.get(id))
      .filter(<T>(item: T | undefined): item is T => !!item)
      .map(datum => new TransformedData(datum));
  }

  select<T extends readonly Observable<unknown>[], U>(
    ...sourcesAndTransform: [...T, TransformFn<T, U>]
  ) {
    const sources = sourcesAndTransform.slice(0, -1) as unknown as T;
    const transformFn = sourcesAndTransform[sourcesAndTransform.length - 1] as TransformFn<T, U>;

    return combineLatest([...sources, this._state]).pipe(
      map(args => transformFn(...(args as [...ObservedValuesOf<T>, State]))),
      shareReplay({refCount: true, bufferSize: 1}),
    );
  }
}

/**
 * @title Complex example making use of the redux pattern.
 */
@Component({
  selector: 'cdk-tree-complex-example',
  templateUrl: 'cdk-tree-complex-example.html',
  styleUrls: ['cdk-tree-complex-example.css'],
  imports: [CdkTreeModule, MatButtonModule, MatIconModule, CommonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkTreeComplexExample implements OnInit {
  private readonly _dataStore = new ComplexDataStore();

  areRootsLoading = this._dataStore.areRootsLoading;
  roots = this._dataStore.roots;

  getChildren = (node: TransformedData) => this._dataStore.getChildren(node.raw.id);
  trackBy = (index: number, node: TransformedData) => this.expansionKey(node);
  expansionKey = (node: TransformedData) => node.raw.id;

  ngOnInit() {
    this._dataStore.loadRoots();
  }

  onExpand(node: TransformedData, expanded: boolean) {
    if (expanded) {
      // Only perform a load on expansion.
      this._dataStore.loadChildren(node.raw.id);
    }
  }
}
