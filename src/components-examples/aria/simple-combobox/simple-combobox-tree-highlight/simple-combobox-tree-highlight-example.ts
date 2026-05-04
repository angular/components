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
  effect,
  signal,
  viewChild,
  untracked,
  ChangeDetectionStrategy,
} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {OverlayModule} from '@angular/cdk/overlay';

interface SeasonNode {
  name: string;
  children?: SeasonNode[];
  expanded?: boolean;
}

/** @title Combobox with tree popup and highlight filtering. */
@Component({
  selector: 'simple-combobox-tree-highlight-example',
  templateUrl: 'simple-combobox-tree-highlight-example.html',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleComboboxTreeHighlightExample {
  readonly tree = viewChild(Tree);

  popupExpanded = signal(false);
  searchString = signal('');
  selectedValues = signal<string[]>([]);
  navigated = signal(false);

  readonly dataSource = signal(SEASON_DATA);

  constructor() {
    afterRenderEffect(() => this._focusAndSelectFirstMatch());

    afterRenderEffect(() => {
      const active = this.tree()?._pattern.activeItem();
      if (active) {
        untracked(() => {
          active.element()?.scrollIntoView({block: 'nearest'});
        });
      }
    });

    effect(() => {
      if (!this.popupExpanded()) {
        this.navigated.set(false);
      }
    });
  }

  // Selects the first matching child within the tree filters.
  private _focusAndSelectFirstMatch() {
    this.filteredGroups();

    const option = this.firstMatchingOption();
    const treeInstance = this.tree();
    if (option && treeInstance) {
      untracked(() => {
        const matchedItem = treeInstance._pattern.items().find(item => item.value() === option);
        if (matchedItem) {
          treeInstance._pattern.treeBehavior.goto(matchedItem, {selectOne: true});
        }
      });
    }
  }

  filteredData = computed(() => {
    const search = this.searchString().trim().toLowerCase();
    const data = this.dataSource();

    if (!search) {
      return {groups: data, firstMatch: undefined};
    }

    let firstMatch: string | undefined = undefined;

    const filterNode = (node: SeasonNode): SeasonNode | null => {
      // Find the first leaf node that starts with the search string
      if (!firstMatch && !node.children && node.name.toLowerCase().startsWith(search)) {
        firstMatch = node.name;
      }

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

    const groups = data
      .map(node => filterNode(node))
      .filter((node): node is SeasonNode => node !== null);
    return {groups, firstMatch};
  });

  filteredGroups = computed(() => this.filteredData().groups);
  firstMatchingOption = computed(() => this.filteredData().firstMatch);

  onCommit() {
    const treeInstance = this.tree();
    if (!treeInstance) return;

    const activeItem = treeInstance._pattern.activeItem();

    if (activeItem) {
      if (activeItem.selectable()) {
        // Selectable child: commit value and close popup.
        const selected = this.selectedValues();
        if (selected.length > 0) {
          this.searchString.set(selected[0]);
          this.popupExpanded.set(false);
        }
      } else {
        // Non-selectable parent: expand and focus its first child.
        const children = activeItem.children();
        if (children.length > 0) {
          const firstChild = children[0];
          treeInstance._pattern.treeBehavior.goto(firstChild);
        }
      }
    }
  }
}

const SEASON_DATA: SeasonNode[] = [
  {name: 'Winter', children: [{name: 'December'}, {name: 'January'}, {name: 'February'}]},
  {name: 'Spring', children: [{name: 'March'}, {name: 'April'}, {name: 'May'}]},
  {name: 'Summer', children: [{name: 'June'}, {name: 'July'}, {name: 'August'}]},
  {name: 'Fall', children: [{name: 'September'}, {name: 'October'}, {name: 'November'}]},
];
