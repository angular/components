import {Component} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {
  CdkTabs,
  CdkTabList,
  CdkTab,
  CdkTabPanel,
  CdkTabContent,
} from '@angular/cdk-experimental/tabs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

/** @title Tabs using UI Patterns. */
@Component({
  selector: 'cdk-tabs-example',
  exportAs: 'cdkTabsExample',
  templateUrl: 'cdk-tabs-example.html',
  styleUrl: 'cdk-tabs-example.css',
  imports: [
    CdkTabs,
    CdkTabList,
    CdkTab,
    CdkTabPanel,
    CdkTabContent,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
})
export class CdkTabsExample {
  orientation: 'vertical' | 'horizontal' = 'horizontal';
  focusMode: 'roving' | 'activedescendant' = 'roving';
  selectionMode: 'explicit' | 'follow' = 'follow';
  tabSelection = 'tab-1';

  wrap = new FormControl(true, {nonNullable: true});
  disabled = new FormControl(false, {nonNullable: true});
  skipDisabled = new FormControl(true, {nonNullable: true});
}
