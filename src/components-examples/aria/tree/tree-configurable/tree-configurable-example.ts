/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component, model} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {Tree, TreeItem, TreeItemGroup} from '@angular/aria/tree';
import {NODES, TreeNode} from '../tree-data';

/** @title Configurable Tree. */
@Component({
  selector: 'tree-configurable-example',
  templateUrl: 'tree-configurable-example.html',
  styleUrl: '../tree-common.css',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    NgTemplateOutlet,
    Tree,
    TreeItem,
    TreeItemGroup,
  ],
})
export class TreeConfigurableExample {
  nodes: TreeNode[] = NODES;

  selectionMode: 'explicit' | 'follow' = 'explicit';
  focusMode: 'roving' | 'activedescendant' = 'roving';

  multi = new FormControl(false, {nonNullable: true});
  disabled = new FormControl(false, {nonNullable: true});
  wrap = new FormControl(true, {nonNullable: true});
  softDisabled = new FormControl(false, {nonNullable: true});
  nav = new FormControl(false, {nonNullable: true});

  selectedValues = model<string[]>(['package.json']);
}
