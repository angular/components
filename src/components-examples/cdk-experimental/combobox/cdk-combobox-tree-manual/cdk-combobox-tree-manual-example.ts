/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  CdkCombobox,
  CdkComboboxInput,
  CdkComboboxPopup,
  CdkComboboxPopupContent,
} from '@angular/cdk-experimental/combobox';
import {
  CdkTree,
  CdkTreeItem,
  CdkTreeItemGroup,
  CdkTreeItemGroupContent,
} from '@angular/cdk-experimental/tree';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  viewChild,
} from '@angular/core';
import {TREE_DATA, FoodNode} from '../data';
import {NgTemplateOutlet} from '@angular/common';

/** @title Combobox with tree popup and manual filtering. */
@Component({
  selector: 'cdk-combobox-tree-manual-example',
  templateUrl: 'cdk-combobox-tree-manual-example.html',
  styleUrl: '../cdk-combobox-examples.css',
  imports: [
    CdkCombobox,
    CdkComboboxInput,
    CdkComboboxPopup,
    CdkComboboxPopupContent,
    CdkTree,
    CdkTreeItem,
    CdkTreeItemGroup,
    CdkTreeItemGroupContent,
    NgTemplateOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkComboboxTreeManualExample {
  popover = viewChild<ElementRef>('popover');
  tree = viewChild<CdkTree<FoodNode>>(CdkTree);
  combobox = viewChild<CdkCombobox<FoodNode>>(CdkCombobox);

  nodes = TREE_DATA;

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
