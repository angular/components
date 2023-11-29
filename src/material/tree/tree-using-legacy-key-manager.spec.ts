import {Component, ElementRef, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {of} from 'rxjs';
import {MatTree} from './tree';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatTreeModule} from './tree-module';
import {NOOP_TREE_KEY_MANAGER_FACTORY_PROVIDER} from '@angular/cdk/a11y';

describe('MatTree when provided LegacyTreeKeyManager', () => {
  let fixture: ComponentFixture<SimpleMatTreeApp>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatTreeModule],
      declarations: [SimpleMatTreeApp],
      providers: [NOOP_TREE_KEY_MANAGER_FACTORY_PROVIDER],
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleMatTreeApp);
    fixture.detectChanges();
  });

  describe('when nodes do not have a tabindex set', () => {
    it('Should render tabindex attribute of 0', () => {
      const treeItems = fixture.componentInstance.treeNodes;

      expect(treeItems.map(x => `${x.nativeElement.getAttribute('tabindex')}`).join(', '))
        .withContext('tabindex of tree nodes')
        .toEqual('0, 0, 0');
    });
  });

  describe('when nodes have TabIndex Input binding of 42', () => {
    it('Should render tabindex attribute of 42.', () => {
      fixture.componentInstance.tabIndexInputBinding = 42;
      fixture.detectChanges();

      const treeItems = fixture.componentInstance.treeNodes;

      expect(treeItems.map(x => `${x.nativeElement.getAttribute('tabindex')}`).join(', '))
        .withContext('tabindex of tree nodes')
        .toEqual('42, 42, 42');
    });
  });

  describe('when nodes have tabindex attribute binding of 2', () => {
    it('should render tabindex attribute of 2', () => {
      fixture.componentInstance.tabindexAttributeBinding = '2';
      fixture.detectChanges();

      const treeItems = fixture.componentInstance.treeNodes;

      expect(treeItems.map(x => `${x.nativeElement.getAttribute('tabindex')}`).join(', '))
        .withContext('tabindex of tree nodes')
        .toEqual('2, 2, 2');
    });
  });
});

class MinimalTestData {
  constructor(public name: string) {}
  children: MinimalTestData[] = [];
}

@Component({
  template: `
    <mat-tree [dataSource]="dataSource" [childrenAccessor]="getChildren">
      <mat-tree-node #node *matTreeNodeDef="let node"
                     [tabIndex]="tabIndexInputBinding" tabindex="{{tabindexAttributeBinding}}">
        {{node.name}}
      </mat-tree-node>
    </mat-tree>
  `,
})
class SimpleMatTreeApp {
  isExpandable = (node: MinimalTestData) => node.children.length > 0;
  getChildren = (node: MinimalTestData) => node.children;

  dataSource = of([
    new MinimalTestData('lettuce'),
    new MinimalTestData('tomato'),
    new MinimalTestData('onion'),
  ]);

  /** Value passed to tabIndex Input binding of each tree node. Null by default. */
  tabIndexInputBinding: number | null = null;
  /** Value passed to tabindex attribute binding of each tree node. Null by default. */
  tabindexAttributeBinding: string | null = null;

  @ViewChild(MatTree) tree: MatTree<MinimalTestData>;
  @ViewChildren('node') treeNodes: QueryList<ElementRef<HTMLElement>>;
}
