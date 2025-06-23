import {Component} from '@angular/core';
import {
  CdkTab,
  CdkTabs,
  CdkTabList,
  CdkTabPanel,
  CdkTabContent,
} from '@angular/cdk-experimental/tabs';

/** @title Explicit selection */
@Component({
  selector: 'cdk-tabs-explicit-selection-example',
  exportAs: 'cdkTabsExplicitSelectionExample',
  templateUrl: 'cdk-tabs-explicit-selection-example.html',
  styleUrls: ['../cdk-tabs-common.css'],
  standalone: true,
  imports: [CdkTabList, CdkTab, CdkTabs, CdkTabPanel, CdkTabContent],
})
export class CdkTabsExplicitSelectionExample {}
