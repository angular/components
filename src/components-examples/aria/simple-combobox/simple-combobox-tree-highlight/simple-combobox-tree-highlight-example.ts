/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/simple-combobox';
import {Tree, TreeItem, TreeItemGroup} from '@angular/aria/tree';
import {
  Component,
  afterRenderEffect,
  computed,
  signal,
  viewChild,
  untracked,
  ChangeDetectionStrategy,
} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {OverlayModule} from '@angular/cdk/overlay';

interface FoodNode {
  name: string;
  children?: FoodNode[];
  expanded?: boolean;
}

/** @title Combobox with tree popup and highlight filtering. */
@Component({
  selector: 'simple-combobox-tree-highlight-example',
  templateUrl: 'simple-combobox-tree-highlight-example.html',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleComboboxTreeHighlightExample {
  readonly tree = viewChild(Tree);

  popupExpanded = signal(false);
  searchString = signal('');
  selectedValues = signal<string[]>([]);

  readonly dataSource = signal(FOOD_DATA);

  constructor() {
    afterRenderEffect(() => {
      if (this.popupExpanded()) {
        untracked(() => setTimeout(() => this.tree()?.gotoFirst()));
      }
    });

    // Highlight mode focus update
    afterRenderEffect(() => {
      this.filteredGroups();
    });

    afterRenderEffect(() => {
      const active = this.tree()?._pattern.inputs.activeItem();
      if (active) {
        untracked(() => {
          active.element()?.scrollIntoView({block: 'nearest'});
        });
      }
    });
  }

  filteredGroups = computed(() => {
    const search = this.searchString().trim().toLowerCase();
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
          expanded: children && children.length > 0 ? true : node.expanded,
        };
      }

      return null;
    };

    return data.map(node => filterNode(node)).filter((node): node is FoodNode => node !== null);
  });

  onCommit() {
    const selected = this.selectedValues();
    if (selected.length > 0) {
      this.searchString.set(selected[0]);
      this.popupExpanded.set(false);
    }
  }
}

const FOOD_DATA: FoodNode[] = [
  {name: 'Winter', children: [{name: 'December'}, {name: 'January'}, {name: 'February'}]},
  {name: 'Spring', children: [{name: 'March'}, {name: 'April'}, {name: 'May'}]},
  {name: 'Summer', children: [{name: 'June'}, {name: 'July'}, {name: 'August'}]},
  {name: 'Fall', children: [{name: 'September'}, {name: 'October'}, {name: 'November'}]},
];
