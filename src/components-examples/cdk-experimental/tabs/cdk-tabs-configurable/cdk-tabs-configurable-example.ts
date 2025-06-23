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

/** @title Configurable Tabs. */
@Component({
  selector: 'cdk-tabs-configurable-example',
  exportAs: 'cdkTabsConfigurableExample',
  templateUrl: 'cdk-tabs-configurable-example.html',
  styleUrls: ['../cdk-tabs-common.css'],
  standalone: true,
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
export class CdkTabsConfigurableExample {
  orientation: 'vertical' | 'horizontal' = 'horizontal';
  focusMode: 'roving' | 'activedescendant' = 'roving';
  selectionMode: 'explicit' | 'follow' = 'follow';
  tabSelection = 'tab-1';

  wrap = new FormControl(true, {nonNullable: true});
  disabled = new FormControl(false, {nonNullable: true});
  skipDisabled = new FormControl(true, {nonNullable: true});
}
