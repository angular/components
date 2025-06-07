import {Component, Directive, model, inject, Injector} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {
  CdkTree,
  CdkTreeItem,
  CdkTreeGroup,
  CdkTreeGroupContent,
} from '@angular/cdk-experimental/tree';

/** Helper directive to obtain a parent injector for NgTemplateOutlet.  */
@Directive({
  selector: '[hierarchicalInjector]',
  exportAs: 'hierarchicalInjector',
})
export class HierarchicalInjector {
  readonly injector = inject(Injector);
}

interface ExampleNode {
  value: string;
  label?: string;
  disabled?: boolean;
  children?: ExampleNode[];
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
    CdkTreeGroup,
    CdkTreeGroupContent,
    HierarchicalInjector,
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

  selectedValues = model<string[]>(['headphones']);
}
