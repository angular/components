import {Component} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Tree, TreeItem, TreeItemGroup} from '../../tree';
import {TreeHarness} from './tree-harness';

describe('TreeHarness', () => {
  let fixture: ComponentFixture<TreeHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness with 2 tress', async () => {
    const trees = await loader.getAllHarnesses(TreeHarness);
    expect(trees.length).toBe(1);
  });

  it('should get correct number of children and descendants', async () => {
    const tree = await loader.getHarness(TreeHarness);
    const items = await tree.getItems();
    expect(items.length).toBe(5);

    await items[0].click();
    expect((await tree.getItems()).length).toBe(8);
  });

  it('should correctly get correct item with text', async () => {
    const tree = await loader.getHarness(TreeHarness);
    const items = await tree.getItems({text: /\.json$/});
    expect(items.length).toBe(2);
    const item = items[0];

    expect(await item.getText()).toBe('angular.json');
    expect(await item.getLevel()).toBe(1);
    expect(await item.isDisabled()).toBe(false);
    expect(await item.isExpanded()).toBe(false);
  });

  it('should toggle expansion', async () => {
    const tree = await loader.getHarness(TreeHarness);
    const item = (await tree.getItems())[0];

    expect(await item.isExpanded()).toBe(false);
    await item.click();
    expect(await item.isExpanded()).toBe(true);
    await item.click();
    expect(await item.isExpanded()).toBe(false);
  });

  it('should correctly get tree structure', async () => {
    const tree = await loader.getHarness(TreeHarness);

    expect(await tree.getTreeStructure()).toEqual({
      children: [
        {text: 'public'},
        {text: 'src'},
        {text: 'angular.json'},
        {text: 'package.json'},
        {text: 'README.md'},
      ],
    });

    const firstGroup = (await tree.getItems({text: 'public'}))[0];
    await firstGroup.click();

    expect(await tree.getTreeStructure()).toEqual({
      children: [
        {
          text: 'public',
          children: [{text: 'index.html'}, {text: 'favicon.ico'}, {text: 'styles.css'}],
        },
        {text: 'src'},
        {text: 'angular.json'},
        {text: 'package.json'},
        {text: 'README.md'},
      ],
    });

    const secondGroup = (await tree.getItems({text: 'src'}))[0];
    await secondGroup.click();

    expect(await tree.getTreeStructure()).toEqual({
      children: [
        {
          text: 'public',
          children: [{text: 'index.html'}, {text: 'favicon.ico'}, {text: 'styles.css'}],
        },
        {
          text: 'src',
          children: [
            {text: 'app'},
            {text: 'assets'},
            {text: 'environments'},
            {text: 'main.ts'},
            {text: 'polyfills.ts'},
            {text: 'styles.css'},
            {text: 'test.ts'},
          ],
        },
        {text: 'angular.json'},
        {text: 'package.json'},
        {text: 'README.md'},
      ],
    });
  });
});

interface TreeNode {
  name: string;
  value: string;
  children?: TreeNode[];
  disabled?: boolean;
  expanded?: boolean;
}

@Component({
  template: `
    <ul ngTree #tree="ngTree">
      <ng-template
        [ngTemplateOutlet]="treeNodes"
        [ngTemplateOutletContext]="{nodes: nodes, parent: tree}"
      />
    </ul>

    <ng-template #treeNodes let-nodes="nodes" let-parent="parent">
      @for (node of nodes; track node.value) {
        <li
          ngTreeItem
          [parent]="parent"
          [value]="node.value"
          [label]="node.name"
          [disabled]="node.disabled"
          #treeItem="ngTreeItem">
          {{ node.name }}
        </li>

        @if (node.children) {
          <ul role="group">
            <ng-template ngTreeItemGroup [ownedBy]="treeItem" #group="ngTreeItemGroup">
              <ng-template
                [ngTemplateOutlet]="treeNodes"
                [ngTemplateOutletContext]="{nodes: node.children, parent: group}"
              />
            </ng-template>
          </ul>
        }
      }
    </ng-template>
  `,
  imports: [Tree, TreeItem, TreeItemGroup, NgTemplateOutlet],
})
class TreeHarnessTest {
  readonly nodes: TreeNode[] = [
    {
      name: 'public',
      value: 'public',
      children: [
        {name: 'index.html', value: 'public/index.html'},
        {name: 'favicon.ico', value: 'public/favicon.ico'},
        {name: 'styles.css', value: 'public/styles.css'},
      ],
      expanded: false,
    },
    {
      name: 'src',
      value: 'src',
      children: [
        {
          name: 'app',
          value: 'src/app',
          children: [
            {name: 'app.component.ts', value: 'src/app/app.component.ts'},
            {name: 'app.module.ts', value: 'src/app/app.module.ts', disabled: true},
            {name: 'app.css', value: 'src/app/app.css'},
          ],
          expanded: false,
        },
        {
          name: 'assets',
          value: 'src/assets',
          children: [{name: 'logo.png', value: 'src/assets/logo.png'}],
          expanded: false,
        },
        {
          name: 'environments',
          value: 'src/environments',
          children: [
            {
              name: 'environment.prod.ts',
              value: 'src/environments/environment.prod.ts',
              expanded: false,
            },
            {name: 'environment.ts', value: 'src/environments/environment.ts'},
          ],
          expanded: false,
        },
        {name: 'main.ts', value: 'src/main.ts'},
        {name: 'polyfills.ts', value: 'src/polyfills.ts'},
        {name: 'styles.css', value: 'src/styles.css', disabled: true},
        {name: 'test.ts', value: 'src/test.ts'},
      ],
      expanded: false,
    },
    {name: 'angular.json', value: 'angular.json'},
    {name: 'package.json', value: 'package.json'},
    {name: 'README.md', value: 'README.md'},
  ];
}
