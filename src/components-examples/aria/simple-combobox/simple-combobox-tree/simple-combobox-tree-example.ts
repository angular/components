/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/simple-combobox';
import {Tree, TreeItem, TreeItemGroup} from '@angular/aria/tree';
import {Component, afterRenderEffect, computed, signal, viewChild, untracked} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {OverlayModule} from '@angular/cdk/overlay';

interface SeasonNode {
  name: string;
  children?: SeasonNode[];
  expanded?: boolean;
}

/** @title */
@Component({
  selector: 'simple-combobox-tree-example',
  templateUrl: 'simple-combobox-tree-example.html',
  styleUrl: '../simple-combobox-example.css',
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
  selectedValues = signal<string[]>([]);

  readonly dataSource = signal(SEASON_DATA);

  constructor() {
    afterRenderEffect(() => {
      const active = this.tree()?._pattern.activeItem();
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

    const filterNode = (node: SeasonNode): SeasonNode | null => {
      const matches = node.name.toLowerCase().includes(search);
      const children = node.children
        ?.map(child => filterNode(child))
        .filter((child): child is SeasonNode => child !== null);

      if (matches || (children && children.length > 0)) {
        return {
          ...node,
          children,
          expanded: children && children.length > 0 ? true : node.expanded,
        };
      }

      return null;
    };

    return data.map(node => filterNode(node)).filter((node): node is SeasonNode => node !== null);
  });

  onCommit() {
    const selected = this.selectedValues();
    if (selected.length > 0) {
      const value = selected[0];
      this.searchString.set(value);
      this.popupExpanded.set(false);
    }
  }
}

const SEASON_DATA: SeasonNode[] = [
  {name: 'Winter', children: [{name: 'December'}, {name: 'January'}, {name: 'February'}]},
  {name: 'Spring', children: [{name: 'March'}, {name: 'April'}, {name: 'May'}]},
  {name: 'Summer', children: [{name: 'June'}, {name: 'July'}, {name: 'August'}]},
  {name: 'Fall', children: [{name: 'September'}, {name: 'October'}, {name: 'November'}]},
];
