/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Combobox,
  ComboboxInput,
  ComboboxPopup,
  ComboboxPopupContainer,
} from '@angular/aria/combobox';
import {Tree, TreeItem, TreeItemGroup, TreeItemGroupContent} from '@angular/aria/tree';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';
import {TREE_NODES, TreeNode} from '../data';
import {NgTemplateOutlet} from '@angular/common';

/** @title Combobox with tree popup and auto-select filtering. */
@Component({
  selector: 'combobox-tree-auto-select-example',
  templateUrl: 'combobox-tree-auto-select-example.html',
  styleUrl: '../combobox-examples.css',
  imports: [
    Combobox,
    ComboboxInput,
    ComboboxPopup,
    ComboboxPopupContainer,
    Tree,
    TreeItem,
    TreeItemGroup,
    TreeItemGroupContent,
    NgTemplateOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxTreeAutoSelectExample {
  popover = viewChild<ElementRef>('popover');
  tree = viewChild<Tree<TreeNode>>(Tree);
  combobox = viewChild<Combobox<any>>(Combobox);

  searchString = signal('');

  nodes = computed(() => this.filterTreeNodes(TREE_NODES));

  firstMatch = computed<string | undefined>(() => {
    const flatNodes = this.flattenTreeNodes(this.nodes());
    const node = flatNodes.find(n => this.isMatch(n));
    return node?.name;
  });

  flattenTreeNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes.flatMap(node => {
      return node.children ? [node, ...this.flattenTreeNodes(node.children)] : [node];
    });
  }

  filterTreeNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes.reduce((acc, node) => {
      const children = node.children ? this.filterTreeNodes(node.children) : undefined;
      if (this.isMatch(node) || (children && children.length > 0)) {
        acc.push({...node, children});
      }
      return acc;
    }, [] as TreeNode[]);
  }

  isMatch(node: TreeNode) {
    return node.name.toLowerCase().includes(this.searchString().toLowerCase());
  }

  constructor() {
    afterRenderEffect(() => {
      const popover = this.popover()!;
      const combobox = this.combobox()!;
      combobox.pattern.expanded() ? this.showPopover() : popover.nativeElement.hidePopover();

      // TODO(wagnermaciel): Make this easier for developers to do.
      this.tree()?.pattern.inputs.activeItem()?.element().scrollIntoView({block: 'nearest'});
    });
  }

  showPopover() {
    const popover = this.popover()!;
    const combobox = this.combobox()!;

    const comboboxRect = combobox.pattern.inputs.inputEl()?.getBoundingClientRect();
    const popoverEl = popover.nativeElement;

    if (comboboxRect) {
      popoverEl.style.width = `${comboboxRect.width}px`;
      popoverEl.style.top = `${comboboxRect.bottom}px`;
      popoverEl.style.left = `${comboboxRect.left - 1}px`;
    }

    popover.nativeElement.showPopover();
  }
}
