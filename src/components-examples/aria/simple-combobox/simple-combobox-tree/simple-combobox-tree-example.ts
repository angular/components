/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/simple-combobox';
import {Tree, TreeItem, TreeItemGroup} from '@angular/aria/tree';
import {Component, computed, signal, viewChild} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {OverlayModule} from '@angular/cdk/overlay';

interface FoodNode {
  name: string;
  children?: FoodNode[];
  expanded?: boolean;
}

/** @title */
@Component({
  selector: 'simple-combobox-tree-example',
  templateUrl: 'simple-combobox-tree-example.html',
  styleUrl: '../simple-combobox-examples.css',
  imports: [
    Combobox,
    ComboboxPopup,
    ComboboxWidget,
    NgTemplateOutlet,
    Tree,
    TreeItem,
    TreeItemGroup,
    OverlayModule,
  ],
})
export class SimpleComboboxTreeExample {
  readonly tree = viewChild(Tree);

  popupExpanded = signal(false);
  searchString = signal('');
  selectedValues = signal<FoodNode[]>([]);

  readonly dataSource = signal(FOOD_DATA);

  filteredGroups = computed(() => {
    const search = this.searchString().toLowerCase();
    const data = this.dataSource();

    if (!search) {
      return data;
    }

    const filterNode = (node: FoodNode): FoodNode | null => {
      const matches = node.name.toLowerCase().includes(search);
      const children = node.children
        ?.map(child => filterNode(child))
        .filter((child): child is FoodNode => child !== null);

      if (matches || (children && children.length > 0)) {
        return {
          ...node,
          children,
          expanded: children && children.length > 0,
        };
      }

      return null;
    };

    return data.map(node => filterNode(node)).filter((node): node is FoodNode => node !== null);
  });

  onCommit() {
    const selected = this.selectedValues();
    if (selected.length > 0) {
      const value = selected[0];
      this.searchString.set(value.name);
      this.popupExpanded.set(false);
    }
  }
}

const FOOD_DATA: FoodNode[] = [
  {
    name: 'Fruits',
    children: [
      {name: 'Apples'},
      {name: 'Bananas'},
      {
        name: 'Berries',
        children: [{name: 'Strawberry'}, {name: 'Blueberry'}, {name: 'Raspberry'}],
      },
      {name: 'Oranges'},
    ],
  },
  {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [{name: 'Broccoli'}, {name: 'Brussels sprouts'}],
      },
      {
        name: 'Orange',
        children: [{name: 'Pumpkins'}, {name: 'Carrots'}],
      },
      {name: 'Onions'},
    ],
  },
];
