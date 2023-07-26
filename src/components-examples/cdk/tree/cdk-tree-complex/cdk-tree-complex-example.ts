import {CdkTreeModule} from '@angular/cdk/tree';
import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
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
  private getRandomDelayTime() {
    // anywhere from 100 to 500ms.
    return Math.floor(Math.random() * 400) + 100;
  }

  getChildren(id: string): Observable<BackendData[]> {
    // first, find the specified ID in our tree
    const item = TREE_DATA.get(id);
    const children = item?.children ?? [];

    return observableOf(children.map(childId => TREE_DATA.get(childId)!)).pipe(
      delay(this.getRandomDelayTime()),
    );
  }

  getRoots(): Observable<BackendData[]> {
    return observableOf([...TREE_DATA.values()].filter(datum => !datum.parent)).pipe(
      delay(this.getRandomDelayTime()),
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

type ObservedValuesOf<T extends ReadonlyArray<Observable<unknown>>> = {
  [K in keyof T]: ObservedValueOf<T[K]>;
};

type TransformFn<T extends ReadonlyArray<Observable<unknown>>, U> = (
  ...args: [...ObservedValuesOf<T>, State]
) => U;

class ComplexDataStore {
  private readonly backend = new FakeDataBackend();

  private state = new BehaviorSubject<State>({
    rootIds: [],
    rootsLoading: 'INIT',
    allData: new Map(),
    dataLoading: new Map(),
  });

  private readonly rootIds = this.select(state => state.rootIds);
  private readonly allData = this.select(state => state.allData);
  private readonly loadingData = this.select(state => state.dataLoading);
  private readonly rootsLoadingState = this.select(state => state.rootsLoading);
  readonly areRootsLoading = this.select(
    this.rootIds,
    this.loadingData,
    this.rootsLoadingState,
    (rootIds, loading, rootsLoading) =>
      rootsLoading !== 'LOADED' || rootIds.some(id => loading.get(id) !== 'LOADED'),
  );
  readonly roots = this.select(
    this.areRootsLoading,
    this.rootIds,
    this.allData,
    (rootsLoading, rootIds, data) => {
      if (rootsLoading) {
        return [];
      }
      return this.getDataByIds(rootIds, data);
    },
  );

  getChildren(parentId: string) {
    return this.select(this.allData, this.loadingData, (data, loading) => {
      const parentData = data.get(parentId);
      if (parentData?.childrenLoading !== 'LOADED') {
        return [];
      }
      const childIds = parentData.childrenIds ?? [];
      if (childIds.some(id => loading.get(id) !== 'LOADED')) {
        return [];
      }
      return this.getDataByIds(childIds, data);
    });
  }

  loadRoots() {
    this.setRootsLoading();
    this.backend.getRoots().subscribe(roots => {
      this.setRoots(roots);
    });
  }

  loadChildren(parentId: string) {
    this.setChildrenLoading(parentId);
    this.backend.getChildren(parentId).subscribe(children => {
      this.addLoadedData(parentId, children);
    });
  }

  private setRootsLoading() {
    this.state.next({
      ...this.state.value,
      rootsLoading: 'LOADING',
    });
  }

  private setRoots(roots: BackendData[]) {
    const currentState = this.state.value;

    this.state.next({
      ...currentState,
      rootIds: roots.map(root => root.id),
      rootsLoading: 'LOADED',
      ...this.addData(currentState, roots),
    });
  }

  private setChildrenLoading(parentId: string) {
    const currentState = this.state.value;
    const parentData = currentState.allData.get(parentId);

    this.state.next({
      ...currentState,
      dataLoading: new Map([
        ...currentState.dataLoading,
        ...(parentData?.childrenIds?.map(childId => [childId, 'LOADING'] as const) ?? []),
      ]),
    });
  }

  private addLoadedData(parentId: string, childData: BackendData[]) {
    const currentState = this.state.value;

    this.state.next({
      ...currentState,
      ...this.addData(currentState, childData, parentId),
    });
  }

  private addData(
    {allData, dataLoading}: State,
    data: BackendData[],
    parentId?: string,
  ): Pick<State, 'allData' | 'dataLoading'> {
    const parentData = parentId && allData.get(parentId);
    const allChildren = data.flatMap(data => data.children ?? []);
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

  private getDataByIds(ids: string[], data: State['allData']) {
    return ids
      .map(id => data.get(id))
      .filter(<T>(item: T | undefined): item is T => !!item)
      .map(data => new TransformedData(data));
  }

  private select<T extends ReadonlyArray<Observable<unknown>>, U>(
    ...sourcesAndTransform: [...T, TransformFn<T, U>]
  ) {
    const sources = sourcesAndTransform.slice(0, -1) as unknown as T;
    const transformFn = sourcesAndTransform[sourcesAndTransform.length - 1] as TransformFn<T, U>;

    return combineLatest([...sources, this.state]).pipe(
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
  standalone: true,
  imports: [CdkTreeModule, MatButtonModule, MatIconModule, CommonModule, MatProgressSpinnerModule],
})
export class CdkTreeComplexExample implements OnInit {
  private readonly dataStore = new ComplexDataStore();

  areRootsLoading = this.dataStore.areRootsLoading;
  roots = this.dataStore.roots;

  getChildren = (node: TransformedData) => this.dataStore.getChildren(node.raw.id);
  trackBy = (index: number, node: TransformedData) => this.expansionKey(node);
  expansionKey = (node: TransformedData) => node.raw.id;

  ngOnInit() {
    this.dataStore.loadRoots();
  }

  onExpand(node: TransformedData, expanded: boolean) {
    if (expanded) {
      // Only perform a load on expansion.
      this.dataStore.loadChildren(node.raw.id);
    }
  }
}
