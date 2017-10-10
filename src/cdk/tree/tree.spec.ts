import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {CdkTree} from './tree';
import {FlatNode, NestedNode} from './tree-data';
import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {CdkTreeModule} from './index';
import {map} from 'rxjs/operator/map';


describe('CdkTree', () => {
  let fixture: ComponentFixture<SimpleCdkTreeApp>;

  let component: SimpleCdkTreeApp;
  let dataSource: FakeDataSource;
  let tree: CdkTree<any>;
  let treeElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CdkTreeModule],
      declarations: [
        SimpleCdkTreeApp,
        // DynamicDataSourceCdkTreeApp,
        // NodeContextCdkTreeApp,
        // WhenNodeCdkTreeApp
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleCdkTreeApp);

    component = fixture.componentInstance;
    dataSource = component.dataSource as FakeDataSource;
    tree = component.tree;
    treeElement = fixture.nativeElement.querySelector('cdk-tree');

    fixture.detectChanges();
  });

  describe('should initialize', () => {
    it('with a connected data source', () => {
      expect(tree.dataSource).toBe(dataSource);
      expect(dataSource.isConnected).toBe(true);
    });

    it('with rendered nodes', () => {
      const nodes = getNodes(treeElement);

      expect(nodes).not.toBe(undefined);
      expect(nodes[0].classList).toContain('customNodeClass');
    });

    it('with the right accessibility roles', () => {
      expect(treeElement.getAttribute('role')).toBe('tree');

      getNodes(treeElement).forEach(node => {
        expect(node.getAttribute('role')).toBe('treeitem');
      });
    });
  });
});

export class TestData implements FlatNode {
  a: string;
  b: string;
  c: string;
  children: TestData[];
  level: number;
  get expandable(): boolean {
    return !!this.children && this.children.length > 0;
  }

  constructor(a: string, b: string, c: string) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.level = 1;
    this.children = [];
  }
}

class FakeDataSource extends DataSource<TestData> {
  isConnected = false;

  _dataChange = new BehaviorSubject<TestData[]>([]);
  set data(data: TestData[]) { this._dataChange.next(data); }
  get data() { return this._dataChange.getValue(); }

  constructor() {
    super();
    for (let i = 0; i < 3; i++) { this.addData(); }
  }

  connect(collectionViewer: CollectionViewer): Observable<TestData[]> {
    this.isConnected = true;
    const streams = [this._dataChange, collectionViewer.viewChange];
    return map.call(combineLatest(streams), ([data]) => data);
  }

  disconnect() {
    this.isConnected = false;
  }

  addData() {
    const nextIndex = this.data.length + 1;

    let copiedData = this.data.slice();
    copiedData.push(new TestData(`a_${nextIndex}`, `b_${nextIndex}`, `c_${nextIndex}`));

    this.data = copiedData;
  }
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource">
      <cdk-tree-node *cdkNodeDef="let node" class="customNodeClass"></cdk-tree-node>
    </cdk-tree>
  `
})
class SimpleCdkTreeApp {
  dataSource: FakeDataSource | null = new FakeDataSource();

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

function getElements(element: Element, query: string): Element[] {
  return [].slice.call(element.querySelectorAll(query));
}

function getNodes(treeElement: Element): Element[] {
  return [].slice.call(treeElement.querySelectorAll('.cdk-tree-node'))!;
}

function expectTreeToMatchContent(treeElement: Element, expectedTreeContent: any[]) {
  const missedExpectations: string[] = [];
  function checkNodeContent(node: Element, expectedTextContent: string) {
    const actualTextContent = node.textContent!.trim();
    if (actualTextContent !== expectedTextContent) {
      missedExpectations.push(
        `Expected node contents to be ${expectedTextContent} but was ${actualTextContent}`);
    }
  }

  // Check nodes
  const expectedNodeContent = expectedTreeContent.shift();
  getNodes(treeElement).forEach((node, index) => {
    const expected = expectedNodeContent ?
      expectedNodeContent[index] :
      null;
    checkNodeContent(node, expected);
  });

  if (missedExpectations.length) {
    fail(missedExpectations.join('\n'));
  }
}
