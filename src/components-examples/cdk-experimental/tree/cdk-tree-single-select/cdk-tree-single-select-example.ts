import {Component} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {
  CdkTree,
  CdkTreeItem,
  CdkTreeItemGroup,
  CdkTreeItemGroupContent,
} from '@angular/cdk-experimental/tree';

/** @title Tree using CdkTree and CdkTreeItem. */
@Component({
  selector: 'cdk-tree-single-select-example',
  exportAs: 'cdkTreeSingleSelectExample',
  templateUrl: 'cdk-tree-single-select-example.html',
  styleUrl: 'cdk-tree-single-select-example.css',
  imports: [CdkTree, CdkTreeItem, CdkTreeItemGroup, CdkTreeItemGroupContent, NgTemplateOutlet],
})
export class CdkTreeSingleSelectExample {
  treeData = [
    {
      value: 'Fruits',
      children: [{value: 'Apple'}, {value: 'Banana'}, {value: 'Cherry'}],
    },
    {
      value: 'Vegetables',
      children: [{value: 'Asparagus'}, {value: 'Broccoli'}, {value: 'Carrot'}],
    },
    {
      value: 'Meat',
      children: [
        {
          value: 'Red Meat',
          children: [{value: 'Beef'}, {value: 'Goat'}, {value: 'Pork'}],
        },
        {
          value: 'Poultry',
          children: [{value: 'Chicken'}, {value: 'Turkey'}],
        },
        {
          value: 'Seafood',
          children: [
            {value: 'Bass'},
            {value: 'Crab'},
            {value: 'Lobster'},
            {value: 'Oyster'},
            {value: 'Shrimp'},
          ],
        },
      ],
    },
  ];
}
