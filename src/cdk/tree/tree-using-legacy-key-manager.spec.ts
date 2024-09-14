import {Component, ElementRef, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {CdkTreeModule} from './tree-module';
import {NOOP_TREE_KEY_MANAGER_FACTORY_PROVIDER} from '@angular/cdk/a11y';

describe('CdkTree when provided LegacyTreeKeyManager', () => {
  let fixture: ComponentFixture<SimpleCdkTreeApp>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CdkTreeModule],
      declarations: [SimpleCdkTreeApp],
      providers: [NOOP_TREE_KEY_MANAGER_FACTORY_PROVIDER],
    });

    fixture = TestBed.createComponent(SimpleCdkTreeApp);
    fixture.detectChanges();
  });

  describe('with default node options', () => {
    it('renders nodes with tabindex attribute of -1', () => {
      const treeItems = fixture.componentInstance.treeNodes;

      expect(treeItems.map(x => `${x.nativeElement.getAttribute('tabindex')}`).join(', '))
        .withContext('tabindex of tree nodes')
        .toEqual('-1, -1');
    });
  });

  describe('when focusing the second node', () => {
    beforeEach(() => {
      const treeItems = fixture.componentInstance.treeNodes;

      treeItems.get(1)!.nativeElement.focus();
      fixture.detectChanges();
    });

    it('does not change tabindex of nodes', () => {
      const treeItems = fixture.componentInstance.treeNodes;

      expect(treeItems.map(x => `${x.nativeElement.getAttribute('tabindex')}`).join(', '))
        .withContext('tabindex of tree nodes')
        .toEqual('-1, -1');
    });
  });

  describe('when clicking the second node', () => {
    beforeEach(() => {
      const treeItems = fixture.componentInstance.treeNodes;

      treeItems.get(1)!.nativeElement.click();
      fixture.detectChanges();
    });

    it('does not change active element', () => {
      expect(document.activeElement).toEqual(document.body);
    });

    it('does not change tabindex of nodes', () => {
      const treeItems = fixture.componentInstance.treeNodes;

      expect(treeItems.map(x => `${x.nativeElement.getAttribute('tabindex')}`).join(', '))
        .withContext('tabindex of tree nodes')
        .toEqual('-1, -1');
    });
  });
});

class MinimalTestData {
  constructor(public name: string) {}
  children: MinimalTestData[] = [];
}

@Component({
  template: `
    <cdk-tree #tree [dataSource]="dataSource" [childrenAccessor]="getChildren">
      <cdk-tree-node #node *cdkTreeNodeDef="let node">
        {{node.name}}
      </cdk-tree-node>
    </cdk-tree>
  `,
})
class SimpleCdkTreeApp {
  isExpandable = (node: MinimalTestData) => node.children.length > 0;
  getChildren = (node: MinimalTestData) => node.children;

  dataSource = of([new MinimalTestData('apple'), new MinimalTestData('banana')]);

  @ViewChild('tree', {read: ElementRef}) tree: ElementRef<HTMLElement>;
  @ViewChildren('node') treeNodes: QueryList<ElementRef<HTMLElement>>;
}
