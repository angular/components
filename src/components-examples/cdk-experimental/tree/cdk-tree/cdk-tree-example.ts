import {Component, model, input} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {
  CdkTree,
  CdkTreeItem,
  CdkTreeItemGroup,
  CdkTreeItemGroupContent,
} from '@angular/cdk-experimental/tree';

interface ExampleNode {
  value: string;
  label?: string;
  disabled?: boolean;
  expanded?: boolean;
  children?: ExampleNode[];
}

@Component({
  selector: 'example-node',
  styleUrl: 'cdk-tree-example.css',
  template: `
    <li
      cdkTreeItem
      class="example-tree-item example-selectable"
      [value]="node().value"
      [label]="node().label || node().value"
      [disabled]="node().disabled"
      [parent]="parent()"
      #treeItem="cdkTreeItem"
    >
      <span
        class="example-tree-item-content example-stateful"
        [style.paddingLeft.px]="(treeItem.pattern.level() - 1) * 24"
      >
        <mat-icon class="example-tree-item-icon" aria-hidden="true">
          @if (treeItem.pattern.expandable()) {
            {{ treeItem.pattern.expanded() ? 'expand_less' : 'expand_more' }}
          }
        </mat-icon>
        {{ node().label }}
      </span>

      @if (node().children !== undefined && node().children!.length > 0) {
        <div cdkTreeItemGroup [ownedBy]="treeItem" #group="cdkTreeItemGroup">
          <ng-template cdkTreeItemGroupContent>
            @for (child of node().children; track child) {
              <example-node [node]="child" [parent]="group" />
            }
          </ng-template>
        </div>
      }
    </li>
  `,
  imports: [MatIconModule, CdkTreeItem, CdkTreeItemGroup, CdkTreeItemGroupContent],
})
export class ExampleNodeComponent {
  node = input.required<ExampleNode>();

  parent = input.required<CdkTree<string> | CdkTreeItemGroup<string>>();
}

/** @title Tree using CdkTree and CdkTreeItem. */
@Component({
  selector: 'cdk-tree-example',
  exportAs: 'cdkTreeExample',
  templateUrl: 'cdk-tree-example.html',
  styleUrl: 'cdk-tree-example.css',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    NgTemplateOutlet,
    CdkTree,
    CdkTreeItem,
    CdkTreeItemGroup,
    CdkTreeItemGroupContent,
    ExampleNodeComponent,
  ],
})
export class CdkTreeExample {
  // Tree data
  treeData: ExampleNode[] = [
    {
      value: 'electronics',
      label: 'electronics',
      children: [
        {
          value: 'audio',
          label: 'audio equipment',
          children: [
            {value: 'headphones', label: 'headphones'},
            {value: 'speakers', label: 'speakers (disabled)', disabled: true},
            {value: 'amps', label: 'amplifiers'},
          ],
        },
        {
          value: 'computers',
          label: 'computers & tablets',
          children: [
            {value: 'laptops', label: 'laptops'},
            {value: 'desktops', label: 'desktops'},
            {value: 'tablets', label: 'tablets'},
          ],
        },
        {value: 'cameras', label: 'cameras'},
      ],
    },
    {
      value: 'furniture',
      label: 'furniture',
      children: [
        {value: 'tables', label: 'tables'},
        {value: 'chairs', label: 'chairs'},
        {value: 'sofas', label: 'sofas'},
      ],
    },
    {
      value: 'books',
      label: 'books (no children)',
    },
    {
      value: 'clothing',
      label: 'clothing (disabled parent)',
      disabled: true,
      children: [
        {value: 'shirts', label: 'shirts'},
        {value: 'pants', label: 'pants'},
      ],
    },
  ];

  // TODO(ok7sai): add styling to horizontal tree view.
  orientation: 'vertical' | 'horizontal' = 'vertical';
  selectionMode: 'explicit' | 'follow' = 'explicit';
  focusMode: 'roving' | 'activedescendant' = 'roving';

  multi = new FormControl(false, {nonNullable: true});
  disabled = new FormControl(false, {nonNullable: true});
  wrap = new FormControl(true, {nonNullable: true});
  skipDisabled = new FormControl(true, {nonNullable: true});
  nav = new FormControl(false, {nonNullable: true});

  selectedValues = model<string[]>(['books']);
}
