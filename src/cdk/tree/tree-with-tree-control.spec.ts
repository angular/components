/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
  Component,
  ErrorHandler,
  ViewChild,
  TrackByFunction,
  Type,
  EventEmitter,
  viewChildren,
  viewChild,
} from '@angular/core';

import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {Directionality, Direction} from '@angular/cdk/bidi';
import {createKeyboardEvent} from '@angular/cdk/testing/testbed/fake-events';
import {combineLatest, BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {TreeControl} from './control/tree-control';
import {FlatTreeControl} from './control/flat-tree-control';
import {NestedTreeControl} from './control/nested-tree-control';
import {CdkTreeModule, CdkTreeNodePadding} from './index';
import {CdkTree, CdkTreeNode} from './tree';
import {NgIf, NgSwitch} from '@angular/common';

describe('CdkTree with TreeControl', () => {
  /** Represents an indent for expectNestedTreeToMatch */
  const _ = {};
  let dataSource: FakeDataSource;
  let treeElement: HTMLElement;
  let tree: CdkTree<TestData>;
  let dir: {value: Direction; readonly change: EventEmitter<Direction>};

  function configureCdkTreeTestingModule(imports: Type<any>[]) {
    TestBed.configureTestingModule({
      imports,
      providers: [
        {
          provide: Directionality,
          useFactory: () => (dir = {value: 'ltr', change: new EventEmitter<Direction>()}),
        },
        // Custom error handler that re-throws the error. Errors happening within
        // change detection phase will be reported through the handler and thrown
        // in Ivy. Since we do not want to pollute the "console.error", but rather
        // just rely on the actual error interrupting the test, we re-throw here.
        {
          provide: ErrorHandler,
          useValue: {
            handleError: (err: any) => {
              throw err;
            },
          },
        },
      ],
    });
  }

  it('should clear out the `mostRecentTreeNode` on destroy', () => {
    configureCdkTreeTestingModule([SimpleCdkTreeApp]);
    const fixture = TestBed.createComponent(SimpleCdkTreeApp);
    fixture.detectChanges();

    // Cast the assertions to a boolean to avoid Jasmine going into an
    // infinite loop when stringifying the object, if the test starts failing.
    expect(!!CdkTreeNode.mostRecentTreeNode).toBe(true);

    fixture.destroy();

    expect(!!CdkTreeNode.mostRecentTreeNode).toBe(false);
  });

  it('should complete the viewChange stream on destroy', () => {
    configureCdkTreeTestingModule([SimpleCdkTreeApp]);
    const fixture = TestBed.createComponent(SimpleCdkTreeApp);
    fixture.detectChanges();
    const spy = jasmine.createSpy('completeSpy');
    const subscription = fixture.componentInstance.tree().viewChange.subscribe({complete: spy});

    fixture.destroy();
    expect(spy).toHaveBeenCalled();
    subscription.unsubscribe();
  });

  describe('flat tree', () => {
    describe('should initialize', () => {
      let fixture: ComponentFixture<SimpleCdkTreeApp>;
      let component: SimpleCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([SimpleCdkTreeApp]);
        fixture = TestBed.createComponent(SimpleCdkTreeApp);

        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree();
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with a connected data source', () => {
        expect(tree.dataSource).toBe(dataSource);
        expect(dataSource.isConnected).toBe(true);
      });

      it('with rendered dataNodes', () => {
        const nodes = getNodes(treeElement);

        expect(nodes).withContext('Expect nodes to be defined').toBeDefined();
        expect(nodes[0].classList).toContain('customNodeClass');
      });

      it('with the right accessibility roles', () => {
        expect(treeElement.getAttribute('role')).toBe('tree');

        expect(
          getNodes(treeElement).every(node => {
            return node.getAttribute('role') === 'treeitem';
          }),
        ).toBe(true);
      });

      it('with the right aria-levels', () => {
        // add a child to the first node
        let data = dataSource.data;
        dataSource.addChild(data[0], true);
        fixture.detectChanges();

        const ariaLevels = getNodes(treeElement).map(n => n.getAttribute('aria-level'));
        expect(ariaLevels).toEqual(['2', '3', '2', '2']);
      });

      it('with the right aria-expanded attrs', () => {
        // add a child to the first node
        let data = dataSource.data;
        dataSource.addChild(data[2]);
        fixture.detectChanges();
        let ariaExpandedStates = getNodes(treeElement).map(n => n.getAttribute('aria-expanded'));
        expect(ariaExpandedStates).toEqual([null, null, 'false', null]);

        component.treeControl.expandAll();
        fixture.detectChanges();

        ariaExpandedStates = getNodes(treeElement).map(n => n.getAttribute('aria-expanded'));
        expect(ariaExpandedStates).toEqual([null, null, 'true', null]);
      });

      it('with the right data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectFlatTreeToMatch(
          treeElement,
          28,
          'px',
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`],
        );

        dataSource.addData(2);
        fixture.detectChanges();

        data = dataSource.data;
        expect(data.length).toBe(4);
        expectFlatTreeToMatch(
          treeElement,
          28,
          'px',
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`],
          [_, `${data[3].pizzaTopping} - ${data[3].pizzaCheese} + ${data[3].pizzaBase}`],
        );
      });

      it('should be able to use units different from px for the indentation', () => {
        component.indent = '15rem';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        const data = dataSource.data;

        expectFlatTreeToMatch(
          treeElement,
          15,
          'rem',
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`],
        );
      });

      it('should default to px if no unit is set for string value indentation', () => {
        component.indent = '17';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        const data = dataSource.data;

        expectFlatTreeToMatch(
          treeElement,
          17,
          'px',
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`],
        );
      });

      it('should be able to set zero as the indent level', () => {
        component.paddingNodes().forEach(node => (node.level = 0));

        const data = dataSource.data;

        expectFlatTreeToMatch(
          treeElement,
          0,
          'px',
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`],
        );
      });

      it('should reset the opposite direction padding if the direction changes', () => {
        const node = getNodes(treeElement)[0];

        component.indent = 10;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(node.style.paddingLeft).toBe('10px');
        expect(node.style.paddingRight).toBeFalsy();

        dir.value = 'rtl';
        dir.change.emit('rtl');
        fixture.detectChanges();

        expect(node.style.paddingRight).toBe('10px');
        expect(node.style.paddingLeft).toBeFalsy();
      });
    });

    describe('with toggle', () => {
      let fixture: ComponentFixture<CdkTreeAppWithToggle>;
      let component: CdkTreeAppWithToggle;

      beforeEach(() => {
        configureCdkTreeTestingModule([CdkTreeAppWithToggle]);
        fixture = TestBed.createComponent(CdkTreeAppWithToggle);

        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('should expand/collapse the node', () => {
        expect(dataSource.data.length).toBe(3);

        expect(component.treeControl.expansionModel.selected.length)
          .withContext(`Expect no expanded node`)
          .toBe(0);

        component.toggleRecursively = false;
        let data = dataSource.data;
        dataSource.addChild(data[2]);
        fixture.detectChanges();

        data = dataSource.data;
        expect(data.length).toBe(4);
        expectFlatTreeToMatch(
          treeElement,
          40,
          'px',
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`],
          [_, `${data[3].pizzaTopping} - ${data[3].pizzaCheese} + ${data[3].pizzaBase}`],
        );

        (getNodes(treeElement)[2] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .withContext(`Expect node expanded`)
          .toBe(1);
        expect(component.treeControl.expansionModel.selected[0]).toBe(data[2]);

        (getNodes(treeElement)[2] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .withContext(`Expect node collapsed`)
          .toBe(0);
      });

      it('should expand/collapse the node recursively', () => {
        expect(dataSource.data.length).toBe(3);

        expect(component.treeControl.expansionModel.selected.length)
          .withContext(`Expect no expanded node`)
          .toBe(0);

        let data = dataSource.data;
        dataSource.addChild(data[2]);
        fixture.detectChanges();

        data = dataSource.data;
        expect(data.length).toBe(4);
        expectFlatTreeToMatch(
          treeElement,
          40,
          'px',
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`],
          [_, `${data[3].pizzaTopping} - ${data[3].pizzaCheese} + ${data[3].pizzaBase}`],
        );

        (getNodes(treeElement)[2] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .withContext(`Expect nodes expanded`)
          .toBe(2);
        expect(component.treeControl.expansionModel.selected[0])
          .withContext(`Expect parent node expanded`)
          .toBe(data[2]);
        expect(component.treeControl.expansionModel.selected[1])
          .withContext(`Expected child node expanded`)
          .toBe(data[3]);

        (getNodes(treeElement)[2] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .withContext(`Expect node collapsed`)
          .toBe(0);
      });
    });

    describe('with when node template', () => {
      let fixture: ComponentFixture<WhenNodeCdkTreeApp>;
      let component: WhenNodeCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([WhenNodeCdkTreeApp]);
        fixture = TestBed.createComponent(WhenNodeCdkTreeApp);

        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with the right data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectFlatTreeToMatch(
          treeElement,
          28,
          'px',
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [`[topping_3] - [cheese_3] + [base_3]`],
        );

        dataSource.addChild(data[1]);
        fixture.detectChanges();

        treeElement = fixture.nativeElement.querySelector('cdk-tree');
        data = dataSource.data;
        expect(data.length).toBe(4);
        expectFlatTreeToMatch(
          treeElement,
          28,
          'px',
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [_, `topping_4 - cheese_4 + base_4`],
          [`[topping_3] - [cheese_3] + [base_3]`],
        );
      });
    });

    describe('with array data source', () => {
      let fixture: ComponentFixture<ArrayDataSourceCdkTreeApp>;
      let component: ArrayDataSourceCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([ArrayDataSourceCdkTreeApp]);
        fixture = TestBed.createComponent(ArrayDataSourceCdkTreeApp);
        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with the right data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectFlatTreeToMatch(
          treeElement,
          28,
          'px',
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [`[topping_3] - [cheese_3] + [base_3]`],
        );

        dataSource.addChild(data[1]);
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        treeElement = fixture.nativeElement.querySelector('cdk-tree');
        data = dataSource.data;
        expect(data.length).toBe(4);
        expectFlatTreeToMatch(
          treeElement,
          28,
          'px',
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [_, `[topping_4] - [cheese_4] + [base_4]`],
          [`[topping_3] - [cheese_3] + [base_3]`],
        );
      });
    });

    describe('with observable data source', () => {
      let fixture: ComponentFixture<ObservableDataSourceCdkTreeApp>;
      let component: ObservableDataSourceCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([ObservableDataSourceCdkTreeApp]);
        fixture = TestBed.createComponent(ObservableDataSourceCdkTreeApp);

        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with the right data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectFlatTreeToMatch(
          treeElement,
          28,
          'px',
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [`[topping_3] - [cheese_3] + [base_3]`],
        );

        dataSource.addChild(data[1]);
        fixture.detectChanges();

        treeElement = fixture.nativeElement.querySelector('cdk-tree');
        data = dataSource.data;
        expect(data.length).toBe(4);
        expectFlatTreeToMatch(
          treeElement,
          28,
          'px',
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [_, `[topping_4] - [cheese_4] + [base_4]`],
          [`[topping_3] - [cheese_3] + [base_3]`],
        );
      });
    });

    describe('with trackBy', () => {
      let fixture: ComponentFixture<CdkTreeAppWithTrackBy>;
      let component: CdkTreeAppWithTrackBy;

      function createTrackByTestComponent(trackByStrategy: 'reference' | 'property' | 'index') {
        configureCdkTreeTestingModule([CdkTreeAppWithTrackBy]);
        fixture = TestBed.createComponent(CdkTreeAppWithTrackBy);
        component = fixture.componentInstance;
        component.trackByStrategy = trackByStrategy;
        fixture.detectChanges();

        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');

        // Each node receives an attribute 'initialIndex' the element's original place
        getNodes(treeElement).forEach((node: Element, index: number) => {
          node.setAttribute('initialIndex', index.toString());
        });

        // Prove that the attributes match their indices
        const initialNodes = getNodes(treeElement);
        expect(initialNodes[0].getAttribute('initialIndex')).toBe('0');
        expect(initialNodes[1].getAttribute('initialIndex')).toBe('1');
        expect(initialNodes[2].getAttribute('initialIndex')).toBe('2');
      }

      function mutateData() {
        // Swap first and second data in data array
        const copiedData = component.dataSource.data.slice();
        const temp = copiedData[0];
        copiedData[0] = copiedData[1];
        copiedData[1] = temp;

        // Remove the third element
        copiedData.splice(2, 1);

        // Add new data
        component.dataSource.data = copiedData;
        fixture.detectChanges();
        component.dataSource.addData();
        fixture.detectChanges();
      }

      it('should add/remove/move nodes with reference-based trackBy', () => {
        createTrackByTestComponent('reference');
        mutateData();

        // Expect that the first and second nodes were swapped and that the last node is new
        const changedNodes = getNodes(treeElement);
        expect(changedNodes.length).toBe(3);
        expect(changedNodes[0].getAttribute('initialIndex')).toBe('1');
        expect(changedNodes[1].getAttribute('initialIndex')).toBe('0');
        expect(changedNodes[2].getAttribute('initialIndex')).toBe(null);
      });

      it('should add/remove/move nodes with property-based trackBy', () => {
        createTrackByTestComponent('property');
        mutateData();

        // Change each item reference to show that the trackby is checking the item properties.
        // Otherwise this would cause them all to be removed/added.
        component.dataSource.data = component.dataSource.data.map(
          item => new TestData(item.pizzaTopping, item.pizzaCheese, item.pizzaBase),
        );

        // Expect that the first and second nodes were swapped and that the last node is new
        const changedNodes = getNodes(treeElement);
        expect(changedNodes.length).toBe(3);
        expect(changedNodes[0].getAttribute('initialIndex')).toBe('1');
        expect(changedNodes[1].getAttribute('initialIndex')).toBe('0');
        expect(changedNodes[2].getAttribute('initialIndex')).toBe(null);
      });

      it('should add/remove/move nodes with index-based trackBy', () => {
        createTrackByTestComponent('index');
        mutateData();

        // Change each item reference to show that the trackby is checking the index.
        // Otherwise this would cause them all to be removed/added.
        component.dataSource.data = component.dataSource.data.map(
          item => new TestData(item.pizzaTopping, item.pizzaCheese, item.pizzaBase),
        );

        // Expect first two to be the same since they were swapped but indicies are consistent.
        // The third element was removed and caught by the tree so it was removed before another
        // item was added, so it is without an initial index.
        const changedNodes = getNodes(treeElement);
        expect(changedNodes.length).toBe(3);
        expect(changedNodes[0].getAttribute('initialIndex')).toBe('0');
        expect(changedNodes[1].getAttribute('initialIndex')).toBe('1');
        expect(changedNodes[2].getAttribute('initialIndex')).toBe(null);
      });
    });

    it('should pick up indirect descendant node definitions', () => {
      configureCdkTreeTestingModule([SimpleCdkTreeAppWithIndirectNodes]);
      const fixture = TestBed.createComponent(SimpleCdkTreeAppWithIndirectNodes);
      fixture.detectChanges();
      treeElement = fixture.nativeElement.querySelector('cdk-tree');

      expect(getNodes(treeElement).length).toBe(3);
    });
  });

  describe('nested tree', () => {
    describe('should initialize', () => {
      let fixture: ComponentFixture<NestedCdkTreeApp>;
      let component: NestedCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([NestedCdkTreeApp]);
        fixture = TestBed.createComponent(NestedCdkTreeApp);
        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with a connected data source', () => {
        expect(tree.dataSource).toBe(dataSource);
        expect(dataSource.isConnected).toBe(true);
      });

      it('with rendered dataNodes', () => {
        const nodes = getNodes(treeElement);

        expect(nodes).withContext('Expect nodes to be defined').toBeDefined();
        expect(nodes[0].classList).toContain('customNodeClass');
      });

      it('with the right accessibility roles', () => {
        expect(treeElement.getAttribute('role')).toBe('tree');

        expect(
          getNodes(treeElement).every(node => {
            return node.getAttribute('role') === 'treeitem';
          }),
        ).toBe(true);
      });

      it('with the right data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectNestedTreeToMatch(
          treeElement,
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`],
        );

        dataSource.addChild(data[1], false);
        fixture.detectChanges();

        treeElement = fixture.nativeElement.querySelector('cdk-tree');
        data = dataSource.data;
        expect(data.length).toBe(3);
        expectNestedTreeToMatch(
          treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [_, `topping_4 - cheese_4 + base_4`],
          [`topping_3 - cheese_3 + base_3`],
        );
      });

      it('with nested child data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        const child = dataSource.addChild(data[1], false);
        dataSource.addChild(child, false);
        fixture.detectChanges();

        expect(data.length).toBe(3);
        expectNestedTreeToMatch(
          treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [_, `topping_4 - cheese_4 + base_4`],
          [_, _, `topping_5 - cheese_5 + base_5`],
          [`topping_3 - cheese_3 + base_3`],
        );

        dataSource.addChild(child, false);
        fixture.detectChanges();

        expect(data.length).toBe(3);
        expectNestedTreeToMatch(
          treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [_, `topping_4 - cheese_4 + base_4`],
          [_, _, `topping_5 - cheese_5 + base_5`],
          [_, _, `topping_6 - cheese_6 + base_6`],
          [`topping_3 - cheese_3 + base_3`],
        );
      });

      it('with correct aria-level on nodes', () => {
        expect(
          getNodes(treeElement).every(node => {
            return node.getAttribute('aria-level') === '1';
          }),
        ).toBe(true);

        let data = dataSource.data;
        const child = dataSource.addChild(data[1], false);
        dataSource.addChild(child, false);
        fixture.detectChanges();

        const nodes = getNodes(treeElement);
        const levels = nodes.map(n => n.getAttribute('aria-level'));
        expect(levels).toEqual(['1', '1', '2', '3', '1']);
      });
    });

    describe('with static children', () => {
      let fixture: ComponentFixture<StaticNestedCdkTreeApp>;
      let component: StaticNestedCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([StaticNestedCdkTreeApp]);
        fixture = TestBed.createComponent(StaticNestedCdkTreeApp);
        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with the right data', () => {
        expectNestedTreeToMatch(
          treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [_, `topping_4 - cheese_4 + base_4`],
          [_, _, `topping_5 - cheese_5 + base_5`],
          [_, _, `topping_6 - cheese_6 + base_6`],
          [`topping_3 - cheese_3 + base_3`],
        );
      });
    });

    describe('with when node', () => {
      let fixture: ComponentFixture<WhenNodeNestedCdkTreeApp>;
      let component: WhenNodeNestedCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([WhenNodeNestedCdkTreeApp]);
        fixture = TestBed.createComponent(WhenNodeNestedCdkTreeApp);
        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with the right data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectNestedTreeToMatch(
          treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`>> topping_2 - cheese_2 + base_2`],
          [`topping_3 - cheese_3 + base_3`],
        );

        dataSource.addChild(data[1], false);
        fixture.detectChanges();

        treeElement = fixture.nativeElement.querySelector('cdk-tree');
        data = dataSource.data;
        expect(data.length).toBe(3);
        expectNestedTreeToMatch(
          treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`>> topping_2 - cheese_2 + base_2`],
          [_, `topping_4 - cheese_4 + base_4`],
          [`topping_3 - cheese_3 + base_3`],
        );
      });
    });

    describe('with toggle', () => {
      let fixture: ComponentFixture<NestedCdkTreeAppWithToggle>;
      let component: NestedCdkTreeAppWithToggle;

      beforeEach(() => {
        configureCdkTreeTestingModule([NestedCdkTreeAppWithToggle]);
        fixture = TestBed.createComponent(NestedCdkTreeAppWithToggle);
        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with the right aria-expanded attrs', () => {
        let ariaExpandedStates = getNodes(treeElement).map(n => n.getAttribute('aria-expanded'));
        expect(ariaExpandedStates).toEqual([null, null, null]);

        component.toggleRecursively = false;
        let data = dataSource.data;
        const child = dataSource.addChild(data[1], false);
        dataSource.addChild(child, false);
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        (getNodes(treeElement)[1] as HTMLElement).click();
        fixture.detectChanges();

        // Note: only four elements are present here; children are not present
        // in DOM unless the parent node is expanded.
        const ariaExpanded = getNodes(treeElement).map(n => n.getAttribute('aria-expanded'));
        expect(ariaExpanded).toEqual([null, 'true', 'false', null]);
      });

      it('should expand/collapse the node multiple times using keyboard', () => {
        component.toggleRecursively = false;
        let data = dataSource.data;
        const child = dataSource.addChild(data[1], false);
        dataSource.addChild(child, false);

        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expectNestedTreeToMatch(
          treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [`topping_3 - cheese_3 + base_3`],
        );

        fixture.detectChanges();

        let node = getNodes(treeElement)[1] as HTMLElement;

        node.focus();
        node.dispatchEvent(createKeyboardEvent('keydown', undefined, 'ArrowRight'));
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .withContext(`Expect node expanded`)
          .toBe(1);
        expectNestedTreeToMatch(
          treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [_, `topping_4 - cheese_4 + base_4`],
          [`topping_3 - cheese_3 + base_3`],
        );

        node = getNodes(treeElement)[1] as HTMLElement;
        node.focus();
        node.dispatchEvent(createKeyboardEvent('keydown', undefined, 'ArrowLeft'));
        fixture.detectChanges();

        expectNestedTreeToMatch(
          treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [`topping_3 - cheese_3 + base_3`],
        );
        expect(component.treeControl.expansionModel.selected.length)
          .withContext(`Expect node collapsed`)
          .toBe(0);

        node = getNodes(treeElement)[1] as HTMLElement;
        node.focus();
        node.dispatchEvent(createKeyboardEvent('keydown', undefined, 'ArrowRight'));
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .withContext(`Expect node expanded`)
          .toBe(1);
        expectNestedTreeToMatch(
          treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [_, `topping_4 - cheese_4 + base_4`],
          [`topping_3 - cheese_3 + base_3`],
        );
      });

      it('should expand/collapse the node recursively', () => {
        let data = dataSource.data;
        const child = dataSource.addChild(data[1], false);
        dataSource.addChild(child, false);
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expectNestedTreeToMatch(
          treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [`topping_3 - cheese_3 + base_3`],
        );

        (getNodes(treeElement)[1] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .withContext(`Expect node expanded`)
          .toBe(3);
        expectNestedTreeToMatch(
          treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [_, `topping_4 - cheese_4 + base_4`],
          [_, _, `topping_5 - cheese_5 + base_5`],
          [`topping_3 - cheese_3 + base_3`],
        );

        (getNodes(treeElement)[1] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .withContext(`Expect node collapsed`)
          .toBe(0);
        expectNestedTreeToMatch(
          treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [`topping_3 - cheese_3 + base_3`],
        );
      });
    });

    describe('with array data source', () => {
      let fixture: ComponentFixture<ArrayDataSourceNestedCdkTreeApp>;
      let component: ArrayDataSourceNestedCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([ArrayDataSourceNestedCdkTreeApp]);
        fixture = TestBed.createComponent(ArrayDataSourceNestedCdkTreeApp);
        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with the right data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectNestedTreeToMatch(
          treeElement,
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [`[topping_3] - [cheese_3] + [base_3]`],
        );

        dataSource.addChild(data[1], false);
        fixture.detectChanges();

        treeElement = fixture.nativeElement.querySelector('cdk-tree');
        expectNestedTreeToMatch(
          treeElement,
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [_, `[topping_4] - [cheese_4] + [base_4]`],
          [`[topping_3] - [cheese_3] + [base_3]`],
        );
      });
    });

    describe('with observable data source', () => {
      let fixture: ComponentFixture<ObservableDataSourceNestedCdkTreeApp>;
      let component: ObservableDataSourceNestedCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([ObservableDataSourceNestedCdkTreeApp]);
        fixture = TestBed.createComponent(ObservableDataSourceNestedCdkTreeApp);
        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with the right data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectNestedTreeToMatch(
          treeElement,
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [`[topping_3] - [cheese_3] + [base_3]`],
        );

        dataSource.addChild(data[1], false);
        fixture.detectChanges();

        treeElement = fixture.nativeElement.querySelector('cdk-tree');
        expectNestedTreeToMatch(
          treeElement,
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [_, `[topping_4] - [cheese_4] + [base_4]`],
          [`[topping_3] - [cheese_3] + [base_3]`],
        );
      });
    });

    describe('with trackBy', () => {
      let fixture: ComponentFixture<NestedCdkTreeAppWithTrackBy>;
      let component: NestedCdkTreeAppWithTrackBy;

      function createTrackByTestComponent(trackByStrategy: 'reference' | 'property' | 'index') {
        configureCdkTreeTestingModule([NestedCdkTreeAppWithTrackBy]);
        fixture = TestBed.createComponent(NestedCdkTreeAppWithTrackBy);
        component = fixture.componentInstance;
        component.trackByStrategy = trackByStrategy;
        dataSource = component.dataSource as FakeDataSource;
        fixture.detectChanges();

        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');

        // Each node receives an attribute 'initialIndex' the element's original place
        getNodes(treeElement).forEach((node: Element, index: number) => {
          node.setAttribute('initialIndex', index.toString());
        });

        // Prove that the attributes match their indicies
        const initialNodes = getNodes(treeElement);
        expect(initialNodes.length).toBe(3);
        initialNodes.forEach((node, index) => {
          expect(node.getAttribute('initialIndex')).toBe(`${index}`);
        });

        const parent = dataSource.data[0];
        dataSource.addChild(parent, false);
        dataSource.addChild(parent, false);
        dataSource.addChild(parent, false);
        getNodes(initialNodes[0]).forEach((node: Element, index: number) => {
          node.setAttribute('initialIndex', `c${index}`);
        });
        expect(
          getNodes(initialNodes[0]).every((node, index) => {
            return node.getAttribute('initialIndex') === `c${index}`;
          }),
        ).toBe(true);
      }

      function mutateChildren(parent: TestData) {
        // Swap first and second data in data array
        const copiedData = parent.children.slice();
        const temp = copiedData[0];
        copiedData[0] = copiedData[1];
        copiedData[1] = temp;

        // Remove the third element
        copiedData.splice(2, 1);

        // Add new data
        parent.children = copiedData;
        parent.observableChildren.next(copiedData);
        component.dataSource.addChild(parent, false);
      }

      it('should add/remove/move children nodes with reference-based trackBy', () => {
        createTrackByTestComponent('reference');
        mutateChildren(dataSource.data[0]);

        const changedNodes = getNodes(treeElement);
        expect(changedNodes.length).toBe(6);
        expect(changedNodes[0].getAttribute('initialIndex')).toBe('0');

        // Expect that the first and second child nodes were swapped and that the last node is new
        expect(changedNodes[1].getAttribute('initialIndex')).toBe('c1');
        expect(changedNodes[2].getAttribute('initialIndex')).toBe('c0');
        expect(changedNodes[3].getAttribute('initialIndex')).toBe(null);

        expect(changedNodes[4].getAttribute('initialIndex')).toBe('1');
        expect(changedNodes[5].getAttribute('initialIndex')).toBe('2');
      });

      it('should add/remove/move children nodes with property-based trackBy', () => {
        createTrackByTestComponent('property');
        mutateChildren(dataSource.data[0]);

        // Change each item reference to show that the trackby is checking the item properties.
        // Otherwise this would cause them all to be removed/added.
        dataSource.data[0].observableChildren.next(
          dataSource.data[0].children.map(
            item => new TestData(item.pizzaTopping, item.pizzaCheese, item.pizzaBase),
          ),
        );

        // Expect that the first and second nodes were swapped and that the last node is new
        const changedNodes = getNodes(treeElement);
        expect(changedNodes.length).toBe(6);
        expect(changedNodes[0].getAttribute('initialIndex')).toBe('0');

        // Expect that the first and second child nodes were swapped and that the last node is new
        expect(changedNodes[1].getAttribute('initialIndex')).toBe('c1');
        expect(changedNodes[2].getAttribute('initialIndex')).toBe('c0');
        expect(changedNodes[3].getAttribute('initialIndex')).toBe(null);

        expect(changedNodes[4].getAttribute('initialIndex')).toBe('1');
        expect(changedNodes[5].getAttribute('initialIndex')).toBe('2');
      });

      it('should add/remove/move children nodes with index-based trackBy', () => {
        createTrackByTestComponent('index');
        mutateChildren(dataSource.data[0]);

        // Change each item reference to show that the trackby is checking the index.
        // Otherwise this would cause them all to be removed/added.
        dataSource.data[0].observableChildren.next(
          dataSource.data[0].children.map(
            item => new TestData(item.pizzaTopping, item.pizzaCheese, item.pizzaBase),
          ),
        );

        const changedNodes = getNodes(treeElement);
        expect(changedNodes.length).toBe(6);
        expect(changedNodes[0].getAttribute('initialIndex')).toBe('0');

        // Expect first two children to be the same since they were swapped
        // but indicies are consistent.
        // The third element was removed and caught by the tree so it was removed before another
        // item was added, so it is without an initial index.
        expect(changedNodes[1].getAttribute('initialIndex')).toBe('c0');
        expect(changedNodes[2].getAttribute('initialIndex')).toBe('c1');
        expect(changedNodes[3].getAttribute('initialIndex')).toBe(null);

        expect(changedNodes[4].getAttribute('initialIndex')).toBe('1');
        expect(changedNodes[5].getAttribute('initialIndex')).toBe('2');
      });
    });
  });

  describe('with depth', () => {
    let fixture: ComponentFixture<DepthNestedCdkTreeApp>;
    let component: DepthNestedCdkTreeApp;

    beforeEach(() => {
      configureCdkTreeTestingModule([DepthNestedCdkTreeApp]);
      fixture = TestBed.createComponent(DepthNestedCdkTreeApp);
      fixture.detectChanges();

      component = fixture.componentInstance;
      dataSource = component.dataSource as FakeDataSource;
      tree = component.tree;
      treeElement = fixture.nativeElement.querySelector('cdk-tree');
    });

    it('should have correct depth for nested tree', () => {
      let data = dataSource.data;
      const child = dataSource.addChild(data[1], false);
      dataSource.addChild(child, false);

      fixture.detectChanges();

      const depthElements = Array.from(treeElement.querySelectorAll('.tree-test-level')!);
      const expectedLevels = ['0', '0', '1', '2', '0'];
      const actualLevels = depthElements.map(element => element.textContent!.trim());
      expect(actualLevels).toEqual(expectedLevels);
      expect(depthElements.length).toBe(5);
    });
  });

  describe('accessibility', () => {
    let fixture: ComponentFixture<StaticNestedCdkTreeApp>;
    let component: StaticNestedCdkTreeApp;
    let nodes: HTMLElement[];

    beforeEach(() => {
      configureCdkTreeTestingModule([StaticNestedCdkTreeApp]);
      fixture = TestBed.createComponent(StaticNestedCdkTreeApp);
      fixture.detectChanges();

      component = fixture.componentInstance;
      dataSource = component.dataSource as FakeDataSource;
      tree = component.tree;
      treeElement = fixture.nativeElement.querySelector('cdk-tree');
      nodes = getNodes(treeElement);
    });

    describe('focus management', () => {
      it('sets tabindex on the latest activated item, with all others "-1"', () => {
        // activate the second child by clicking on it
        nodes[1].click();
        fixture.detectChanges();

        expect(nodes.map(x => `${x.getAttribute('tabindex')}`).join(', ')).toEqual(
          '-1, 0, -1, -1, -1, -1',
        );

        // activate the first child by clicking on it
        nodes[0].click();
        fixture.detectChanges();

        expect(nodes.map(x => `${x.getAttribute('tabindex')}`).join(', ')).toEqual(
          '0, -1, -1, -1, -1, -1',
        );
      });

      it('maintains tabindex when component is blurred', () => {
        // activate the second child by clicking on it
        nodes[1].click();
        nodes[1].focus();
        fixture.detectChanges();

        expect(document.activeElement).toBe(nodes[1]);
        // blur the currently active element (which we just checked is the above node)
        nodes[1].blur();
        fixture.detectChanges();

        expect(
          getNodes(treeElement)
            .map(x => `${x.getAttribute('tabindex')}`)
            .join(', '),
        ).toEqual('-1, 0, -1, -1, -1, -1');
      });

      it('ignores clicks on disabled items', () => {
        dataSource.data[1].isDisabled = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        nodes[1].click();
        fixture.detectChanges();

        expect(nodes.map(x => `${x.getAttribute('tabindex')}`).join(', ')).toEqual(
          '0, -1, -1, -1, -1, -1',
        );
      });
    });

    describe('tree role & attributes', () => {
      it('sets the tree role on the tree element', () => {
        expect(treeElement.getAttribute('role')).toBe('tree');
      });

      it('sets the treeitem role on all nodes', () => {
        expect(
          getNodes(treeElement)
            .map(x => `${x.getAttribute('role')}`)
            .join(', '),
        ).toEqual('treeitem, treeitem, treeitem, treeitem, treeitem, treeitem');
      });

      it('sets aria attributes for tree nodes', () => {
        expect(nodes.map(x => `${x.getAttribute('aria-expanded')}`).join(', '))
          .withContext('aria-expanded attributes')
          .toEqual('null, false, false, null, null, null');
        expect(nodes.map(x => `${x.getAttribute('aria-level')}`).join(', '))
          .withContext('aria-level attributes')
          .toEqual('1, 1, 2, 3, 3, 1');
        expect(nodes.map(x => `${x.getAttribute('aria-posinset')}`).join(', '))
          .withContext('aria-posinset attributes')
          .toEqual('1, 2, 1, 1, 2, 3');
        expect(nodes.map(x => `${x.getAttribute('aria-setsize')}`).join(', '))
          .withContext('aria-setsize attributes')
          .toEqual('3, 3, 1, 2, 2, 3');
      });

      it('changes aria-expanded status when expanded or collapsed', () => {
        tree.expand(dataSource.data[1]);
        fixture.detectChanges();
        expect(nodes.map(x => `${x.getAttribute('aria-expanded')}`).join(', '))
          .withContext('aria-expanded attributes')
          .toEqual('null, true, false, null, null, null');

        tree.collapse(dataSource.data[1]);
        fixture.detectChanges();
        expect(nodes.map(x => `${x.getAttribute('aria-expanded')}`).join(', '))
          .withContext('aria-expanded attributes')
          .toEqual('null, false, false, null, null, null');
      });
    });
  });
});

export class TestData {
  pizzaTopping: string;
  pizzaCheese: string;
  pizzaBase: string;
  level: number;
  children: TestData[];
  isDisabled?: boolean;
  readonly observableChildren: BehaviorSubject<TestData[]>;

  constructor(pizzaTopping: string, pizzaCheese: string, pizzaBase: string, level: number = 1) {
    this.pizzaTopping = pizzaTopping;
    this.pizzaCheese = pizzaCheese;
    this.pizzaBase = pizzaBase;
    this.level = level;
    this.children = [];
    this.observableChildren = new BehaviorSubject<TestData[]>(this.children);
  }
}

class FakeDataSource extends DataSource<TestData> {
  dataIndex = 0;
  isConnected = false;

  _dataChange = new BehaviorSubject<TestData[]>([]);
  get data() {
    return this._dataChange.getValue();
  }
  set data(data: TestData[]) {
    this._dataChange.next(data);
  }

  constructor(public treeControl: TreeControl<TestData>) {
    super();
    for (let i = 0; i < 3; i++) {
      this.addData();
    }
  }

  connect(collectionViewer: CollectionViewer): Observable<TestData[]> {
    this.isConnected = true;

    return combineLatest([this._dataChange, collectionViewer.viewChange]).pipe(
      map(([data]) => {
        this.treeControl.dataNodes = data;
        return data;
      }),
    );
  }

  disconnect() {
    this.isConnected = false;
  }

  addChild(parent: TestData, isFlat: boolean = true) {
    const nextIndex = ++this.dataIndex;
    const child = new TestData(
      `topping_${nextIndex}`,
      `cheese_${nextIndex}`,
      `base_${nextIndex}`,
      parent.level + 1,
    );
    parent.children.push(child);
    if (isFlat) {
      let copiedData = this.data.slice();
      copiedData.splice(this.data.indexOf(parent) + 1, 0, child);
      this.data = copiedData;
    } else {
      parent.observableChildren.next(parent.children);
    }
    return child;
  }

  addData(level: number = 1) {
    const nextIndex = ++this.dataIndex;

    let copiedData = this.data.slice();
    copiedData.push(
      new TestData(`topping_${nextIndex}`, `cheese_${nextIndex}`, `base_${nextIndex}`, level),
    );

    this.data = copiedData;
  }
}

function getNodes(treeElement: Element): HTMLElement[] {
  return Array.from(treeElement.querySelectorAll('.cdk-tree-node'));
}

function expectFlatTreeToMatch(
  treeElement: Element,
  expectedPaddingIndent = 28,
  expectedPaddingUnits = 'px',
  ...expectedTree: any[]
) {
  const missedExpectations: string[] = [];

  function checkNode(node: Element, expectedNode: any[]) {
    const actualTextContent = node.textContent!.trim();
    const expectedTextContent = expectedNode[expectedNode.length - 1];
    if (actualTextContent !== expectedTextContent) {
      missedExpectations.push(
        `Expected node contents to be ${expectedTextContent} but was ${actualTextContent}`,
      );
    }
  }

  function checkLevel(node: Element, expectedNode: any[]) {
    const rawLevel = (node as HTMLElement).style.paddingLeft;

    // Some browsers return 0, while others return 0px.
    const actualLevel = rawLevel === '0' ? '0px' : rawLevel;
    const expectedLevel = `${expectedNode.length * expectedPaddingIndent}${expectedPaddingUnits}`;
    if (actualLevel != expectedLevel) {
      missedExpectations.push(`Expected node level to be ${expectedLevel} but was ${actualLevel}`);
    }
  }

  getNodes(treeElement).forEach((node, index) => {
    const expected = expectedTree ? expectedTree[index] : null;

    checkLevel(node, expected);
    checkNode(node, expected);
  });

  if (missedExpectations.length) {
    fail(missedExpectations.join('\n'));
  }
}

function expectNestedTreeToMatch(treeElement: Element, ...expectedTree: any[]) {
  const missedExpectations: string[] = [];
  function checkNodeContent(node: Element, expectedNode: any[]) {
    const expectedTextContent = expectedNode[expectedNode.length - 1];
    const actualTextContent = node.childNodes.item(0).textContent!.trim();
    if (actualTextContent !== expectedTextContent) {
      missedExpectations.push(
        `Expected node contents to be ${expectedTextContent} but was ${actualTextContent}`,
      );
    }
  }

  function checkNodeDescendants(node: Element, expectedNode: any[], currentIndex: number) {
    let expectedDescendant = 0;

    for (let i = currentIndex + 1; i < expectedTree.length; ++i) {
      if (expectedTree[i].length > expectedNode.length) {
        ++expectedDescendant;
      } else if (expectedTree[i].length === expectedNode.length) {
        break;
      }
    }

    const actualDescendant = getNodes(node).length;
    if (actualDescendant !== expectedDescendant) {
      missedExpectations.push(
        `Expected node descendant num to be ${expectedDescendant} but was ${actualDescendant}`,
      );
    }
  }

  getNodes(treeElement).forEach((node, index) => {
    const expected = expectedTree ? expectedTree[index] : null;

    checkNodeDescendants(node, expected, index);
    checkNodeContent(node, expected);
  });

  if (missedExpectations.length) {
    fail(missedExpectations.join('\n'));
  }
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-tree-node *cdkTreeNodeDef="let node" class="customNodeClass"
                     cdkTreeNodePadding [cdkTreeNodePaddingIndent]="indent"
                     cdkTreeNodeToggle>
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
      </cdk-tree-node>
    </cdk-tree>
  `,
  standalone: true,
  imports: [CdkTreeModule],
})
class SimpleCdkTreeApp {
  getLevel = (node: TestData) => node.level;
  isExpandable = (node: TestData) => node.children.length > 0;

  treeControl: TreeControl<TestData> = new FlatTreeControl(this.getLevel, this.isExpandable);
  dataSource: FakeDataSource | null = new FakeDataSource(this.treeControl);
  indent: number | string = 28;

  readonly tree = viewChild.required<CdkTree<TestData>>(CdkTree);
  readonly paddingNodes = viewChildren(CdkTreeNodePadding);
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <ng-container [ngSwitch]="true">
        <cdk-tree-node *cdkTreeNodeDef="let node" class="customNodeClass"
                      cdkTreeNodePadding [cdkTreeNodePaddingIndent]="indent"
                      cdkTreeNodeToggle>
                      {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
        </cdk-tree-node>
      </ng-container>
    </cdk-tree>
  `,
  standalone: true,
  imports: [CdkTreeModule, NgSwitch],
})
class SimpleCdkTreeAppWithIndirectNodes extends SimpleCdkTreeApp {}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node" class="customNodeClass">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
    </cdk-tree>
  `,
  standalone: true,
  imports: [CdkTreeModule],
})
class NestedCdkTreeApp {
  getChildren = (node: TestData) => node.observableChildren;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);

  dataSource: FakeDataSource | null = new FakeDataSource(this.treeControl);

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-nested-tree-node
          *cdkTreeNodeDef="let node"
          class="customNodeClass"
          [isDisabled]="node.isDisabled">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
    </cdk-tree>
  `,
  standalone: true,
  imports: [CdkTreeModule],
})
class StaticNestedCdkTreeApp {
  getChildren = (node: TestData) => node.children;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren, {
    isExpandable: node => node.children.length > 0,
  });

  dataSource: FakeDataSource;

  @ViewChild(CdkTree) tree: CdkTree<TestData>;

  constructor() {
    const dataSource = new FakeDataSource(this.treeControl);
    const data = dataSource.data;
    const child = dataSource.addChild(data[1], false);
    dataSource.addChild(child, false);
    dataSource.addChild(child, false);

    this.dataSource = dataSource;
  }
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node" class="customNodeClass">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
       <cdk-nested-tree-node *cdkTreeNodeDef="let node; when: isSecondNode" class="customNodeClass">
                     >> {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
    </cdk-tree>
  `,
  standalone: true,
  imports: [CdkTreeModule],
})
class WhenNodeNestedCdkTreeApp {
  isSecondNode = (_: number, node: TestData) => node.pizzaBase.indexOf('2') > 0;

  getChildren = (node: TestData) => node.observableChildren;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);

  dataSource: FakeDataSource | null = new FakeDataSource(this.treeControl);

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-tree-node *cdkTreeNodeDef="let node" class="customNodeClass"
                     cdkTreeNodePadding
                     cdkTreeNodeToggle [cdkTreeNodeToggleRecursive]="toggleRecursively">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
      </cdk-tree-node>
    </cdk-tree>
  `,
  standalone: true,
  imports: [CdkTreeModule],
})
class CdkTreeAppWithToggle {
  toggleRecursively: boolean = true;

  getLevel = (node: TestData) => node.level;
  isExpandable = (node: TestData) => node.children.length > 0;

  treeControl: TreeControl<TestData> = new FlatTreeControl(this.getLevel, this.isExpandable);
  dataSource: FakeDataSource | null = new FakeDataSource(this.treeControl);

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node" class="customNodeClass"
                            cdkTreeNodeToggle
                            [cdkTreeNodeToggleRecursive]="toggleRecursively">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
        <div *ngIf="treeControl.isExpanded(node)">
          <ng-template cdkTreeNodeOutlet></ng-template>
        </div>
      </cdk-nested-tree-node>
    </cdk-tree>
  `,
  standalone: true,
  imports: [CdkTreeModule, NgIf],
})
class NestedCdkTreeAppWithToggle {
  toggleRecursively: boolean = true;

  getChildren = (node: TestData) => node.observableChildren;

  isExpandable?: (node: TestData) => boolean;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);
  dataSource: FakeDataSource | null = new FakeDataSource(this.treeControl);

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-tree-node *cdkTreeNodeDef="let node" class="customNodeClass"
                     cdkTreeNodePadding [cdkTreeNodePaddingIndent]="28"
                     cdkTreeNodeToggle>
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
      </cdk-tree-node>
       <cdk-tree-node *cdkTreeNodeDef="let node; when: isOddNode" class="customNodeClass"
                     cdkTreeNodePadding [cdkTreeNodePaddingIndent]="28"
                     cdkTreeNodeToggle>
                     [{{node.pizzaTopping}}] - [{{node.pizzaCheese}}] + [{{node.pizzaBase}}]
      </cdk-tree-node>
    </cdk-tree>
  `,
  standalone: true,
  imports: [CdkTreeModule],
})
class WhenNodeCdkTreeApp {
  isOddNode = (_: number, node: TestData) => node.level % 2 === 1;
  getLevel = (node: TestData) => node.level;
  isExpandable = (node: TestData) => node.children.length > 0;

  treeControl: TreeControl<TestData> = new FlatTreeControl(this.getLevel, this.isExpandable);

  dataSource: FakeDataSource | null = new FakeDataSource(this.treeControl);

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataArray" [treeControl]="treeControl">
      <cdk-tree-node *cdkTreeNodeDef="let node"
                     cdkTreeNodePadding [cdkTreeNodePaddingIndent]="28"
                     cdkTreeNodeToggle>
                     [{{node.pizzaTopping}}] - [{{node.pizzaCheese}}] + [{{node.pizzaBase}}]
      </cdk-tree-node>
    </cdk-tree>
  `,
  standalone: true,
  imports: [CdkTreeModule],
})
class ArrayDataSourceCdkTreeApp {
  getLevel = (node: TestData) => node.level;
  isExpandable = (node: TestData) => node.children.length > 0;

  treeControl: TreeControl<TestData> = new FlatTreeControl(this.getLevel, this.isExpandable);

  dataSource: FakeDataSource = new FakeDataSource(this.treeControl);

  get dataArray() {
    return this.dataSource.data;
  }

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataObservable" [treeControl]="treeControl">
      <cdk-tree-node *cdkTreeNodeDef="let node"
                     cdkTreeNodePadding [cdkTreeNodePaddingIndent]="28"
                     cdkTreeNodeToggle>
                     [{{node.pizzaTopping}}] - [{{node.pizzaCheese}}] + [{{node.pizzaBase}}]
      </cdk-tree-node>
    </cdk-tree>
  `,
  standalone: true,
  imports: [CdkTreeModule],
})
class ObservableDataSourceCdkTreeApp {
  getLevel = (node: TestData) => node.level;
  isExpandable = (node: TestData) => node.children.length > 0;

  treeControl: TreeControl<TestData> = new FlatTreeControl(this.getLevel, this.isExpandable);

  dataSource: FakeDataSource = new FakeDataSource(this.treeControl);

  get dataObservable() {
    return this.dataSource._dataChange;
  }

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataArray" [treeControl]="treeControl">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node">
                     [{{node.pizzaTopping}}] - [{{node.pizzaCheese}}] + [{{node.pizzaBase}}]
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
    </cdk-tree>
  `,
  standalone: true,
  imports: [CdkTreeModule],
})
class ArrayDataSourceNestedCdkTreeApp {
  getChildren = (node: TestData) => node.observableChildren;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);

  dataSource: FakeDataSource = new FakeDataSource(this.treeControl);

  get dataArray() {
    return this.dataSource.data;
  }

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataObservable" [treeControl]="treeControl">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node">
                     [{{node.pizzaTopping}}] - [{{node.pizzaCheese}}] + [{{node.pizzaBase}}]
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
    </cdk-tree>
  `,
  standalone: true,
  imports: [CdkTreeModule],
})
class ObservableDataSourceNestedCdkTreeApp {
  getChildren = (node: TestData) => node.observableChildren;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);

  dataSource: FakeDataSource = new FakeDataSource(this.treeControl);

  get dataObservable() {
    return this.dataSource._dataChange;
  }

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataArray" [treeControl]="treeControl">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node; let level = level">
          <span class="tree-test-level">{{level}}</span>
           [{{node.pizzaTopping}}] - [{{node.pizzaCheese}}] + [{{node.pizzaBase}}]
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
    </cdk-tree>
  `,
  standalone: true,
  imports: [CdkTreeModule],
})
class DepthNestedCdkTreeApp {
  getChildren = (node: TestData) => node.observableChildren;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);

  dataSource: FakeDataSource = new FakeDataSource(this.treeControl);

  get dataArray() {
    return this.dataSource.data;
  }

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl" [trackBy]="trackByFn">
      <cdk-tree-node *cdkTreeNodeDef="let node" class="customNodeClass">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
      </cdk-tree-node>
    </cdk-tree>
  `,
  standalone: true,
  imports: [CdkTreeModule],
})
class CdkTreeAppWithTrackBy {
  trackByStrategy: 'reference' | 'property' | 'index' = 'reference';

  trackByFn: TrackByFunction<TestData> = (index, item) => {
    switch (this.trackByStrategy) {
      case 'reference':
        return item;
      case 'property':
        return item.pizzaBase;
      case 'index':
        return index;
    }
  };

  getLevel = (node: TestData) => node.level;
  isExpandable = (node: TestData) => node.children.length > 0;

  treeControl: TreeControl<TestData> = new FlatTreeControl(this.getLevel, this.isExpandable);
  dataSource: FakeDataSource = new FakeDataSource(this.treeControl);

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataArray" [treeControl]="treeControl" [trackBy]="trackByFn">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node">
           [{{node.pizzaTopping}}] - [{{node.pizzaCheese}}] + [{{node.pizzaBase}}]
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
    </cdk-tree>
  `,
  standalone: true,
  imports: [CdkTreeModule],
})
class NestedCdkTreeAppWithTrackBy {
  trackByStrategy: 'reference' | 'property' | 'index' = 'reference';

  trackByFn: TrackByFunction<TestData> = (index, item) => {
    switch (this.trackByStrategy) {
      case 'reference':
        return item;
      case 'property':
        return item.pizzaBase;
      case 'index':
        return index;
    }
  };

  getChildren = (node: TestData) => node.observableChildren;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);

  dataSource: FakeDataSource = new FakeDataSource(this.treeControl);

  get dataArray() {
    return this.dataSource.data;
  }

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}
