import {Component} from '@angular/core';
import {FlatTreeControl, NestedTreeControl} from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule,
  MatTreeNestedDataSource
} from '@angular/material/tree';
import {MatTreeHarness} from '@angular/material/tree/testing';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';

/** Shared tests to run on both the original and MDC-based trees. */
export function runHarnessTests(
  treeModule: typeof MatTreeModule,
  treeHarness: typeof MatTreeHarness) {
  let fixture: ComponentFixture<TreeHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [treeModule],
      declarations: [TreeHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(TreeHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness with 2 tress', async () => {
    const trees = await loader.getAllHarnesses(treeHarness);

    expect(trees.length).toBe(2);
  });

  it('should get the different type of tree nodes', async () => {
    const trees = await loader.getAllHarnesses(treeHarness);
    const flatTree = trees[0];
    const nestedTree = trees[1];
    const flatTreeFlatNodes = await flatTree.getNodes();
    const flatTreeNestedNodes = await flatTree.getNestedNodes();
    const nestedTreeFlatNodes = await nestedTree.getNodes();
    const nestedTreeNestedNodes = await nestedTree.getNestedNodes();

    expect(flatTreeFlatNodes.length).toBe(2);
    expect(flatTreeNestedNodes.length).toBe(0);
    expect(nestedTreeFlatNodes.length).toBe(5);
    expect(nestedTreeNestedNodes.length).toBe(3);
  });

  it('should correctly get correct node with text', async () => {
    const trees = await loader.getAllHarnesses(treeHarness);
    const flatTree = trees[0];
    const flatTreeNodes = await flatTree.getNodes({text: /Flat Group 2/});
    expect(flatTreeNodes.length).toBe(1);
    const secondGroup = flatTreeNodes[0];

    expect(await secondGroup.getRole()).toBe('group');
    expect(await secondGroup.getText()).toBe('Toggle  Flat Group 2');
    expect(await secondGroup.getLevel()).toBe(0);
    expect(await secondGroup.isDisabled()).toBe(false);
    expect(await secondGroup.isExpanded()).toBe(false);
  });

  it('should toggle expansion', async () => {
    const trees = await loader.getAllHarnesses(treeHarness);
    const nestedTree = trees[1];
    const nestedTreeNodes = await nestedTree.getNestedNodes();
    const firstGroup = nestedTreeNodes[0];

    expect(await firstGroup.isExpanded()).toBe(false);

    await firstGroup.toggleExpansion();

    expect(await firstGroup.isExpanded()).toBe(true);
  });
}


interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const FLAT_TREE_DATA: FoodNode[] = [
  {
    name: 'Flat Group 1',
    children: [
      {name: 'Flat Leaf 1.1'},
      {name: 'Flat Leaf 1.2'},
      {name: 'Flat Leaf 1.3'},
    ]
  }, {
    name: 'Flat Group 2',
    children: [
      {
        name: 'Flat Group 2.1',
        children: [
          {name: 'Flat Leaf 2.1.1'},
          {name: 'Flat Leaf 2.1.2'},
        ]
      }, {
        name: 'Flat Group 2.2',
        children: [
          {name: 'Flat Leaf 2.2.1'},
          {name: 'Flat Leaf 2.2.2'},
        ]
      },
    ]
  },
];

const NESTED_TREE_DATA: FoodNode[] = [
  {
    name: 'Nested Group 1',
    children: [
      {name: 'Nested Leaf 1.1'},
      {name: 'Nested Leaf 1.2'},
      {name: 'Nested Leaf 1.3'},
    ]
  }, {
    name: 'Nested Group 2',
    children: [
      {
        name: 'Nested Group 2.1',
        children: [
          {name: 'Nested Leaf 2.1.1'},
          {name: 'Nested Leaf 2.1.2'},
        ]
      },
    ]
  },
];

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  template: `
    <mat-tree [dataSource]="flatTreeDataSource" [treeControl]="flatTreeControl">
      <!-- This is the tree node template for leaf nodes -->
      <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding>
        {{node.name}}
      </mat-tree-node>
      <!-- This is the tree node template for expandable nodes -->
      <mat-tree-node *matTreeNodeDef="let node;when: flatTreeHasChild" matTreeNodePadding>
        <button matTreeNodeToggle>
          Toggle
        </button>
        {{node.name}}
      </mat-tree-node>
    </mat-tree>

    <mat-tree [dataSource]="nestedTreeDataSource" [treeControl]="nestedTreeControl">
      <!-- This is the tree node template for leaf nodes -->
      <mat-tree-node *matTreeNodeDef="let node" matTreeNodeToggle>
        {{node.name}}
      </mat-tree-node>
      <!-- This is the tree node template for expandable nodes -->
      <mat-nested-tree-node *matTreeNodeDef="let node; when: nestedTreeHasChild">
        <button matTreeNodeToggle>
          Toggle
        </button>
        {{node.name}}
        <ul [class.example-tree-invisible]="!nestedTreeControl.isExpanded(node)">
          <ng-container matTreeNodeOutlet></ng-container>
        </ul>
      </mat-nested-tree-node>
    </mat-tree>
  `
})
class TreeHarnessTest {
  private _transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };

  treeFlattener = new MatTreeFlattener(
    this._transformer, node => node.level, node => node.expandable, node => node.children);
  flatTreeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level, node => node.expandable);
  flatTreeDataSource = new MatTreeFlatDataSource(this.flatTreeControl, this.treeFlattener);
  nestedTreeControl = new NestedTreeControl<FoodNode>(node => node.children);
  nestedTreeDataSource = new MatTreeNestedDataSource<FoodNode>();

  constructor() {
    this.flatTreeDataSource.data = FLAT_TREE_DATA;
    this.nestedTreeDataSource.data = NESTED_TREE_DATA;
  }

  flatTreeHasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  nestedTreeHasChild = (_: number, node: FoodNode) => !!node.children && node.children.length > 0;
}
