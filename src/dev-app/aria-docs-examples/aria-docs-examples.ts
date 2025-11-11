/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {
  AccordionGroup,
  AccordionTrigger,
  AccordionPanel,
  AccordionContent,
} from '@angular/aria/accordion';
import {Combobox, ComboboxInput} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {Grid, GridRow, GridCell, GridCellWidget} from '@angular/aria/grid';
import {Menu, MenuItem} from '@angular/aria/menu';
import {Tab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';
import {Toolbar, ToolbarWidget} from '@angular/aria/toolbar';
import {Tree, TreeItem, TreeItemGroup} from '@angular/aria/tree';

@Component({
  templateUrl: 'aria-docs-examples.html',
  styleUrl: 'aria-docs-examples.css',
  imports: [
    AccordionGroup,
    AccordionTrigger,
    AccordionPanel,
    AccordionContent,
    Combobox,
    ComboboxInput,
    Listbox,
    Option,
    Grid,
    GridRow,
    GridCell,
    GridCellWidget,
    Menu,
    MenuItem,
    TabList,
    Tab,
    Tabs,
    TabPanel,
    TabContent,
    Toolbar,
    ToolbarWidget,
    Tree,
    TreeItem,
    TreeItemGroup,
    OverlayModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AriaDocsExamples {}
