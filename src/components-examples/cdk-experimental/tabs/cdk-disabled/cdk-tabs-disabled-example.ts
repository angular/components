import {Component} from '@angular/core';
import {
  CdkTab,
  CdkTabs,
  CdkTabList,
  CdkTabPanel,
  CdkTabContent,
} from '@angular/cdk-experimental/tabs';

/** @title Disabled */
@Component({
  selector: 'cdk-tabs-disabled-example',
  exportAs: 'cdkTabsDisabledExample',
  templateUrl: 'cdk-tabs-disabled-example.html',
  styleUrls: ['../cdk-tabs-common.css'],
  standalone: true,
  imports: [CdkTabList, CdkTab, CdkTabs, CdkTabPanel, CdkTabContent],
})
export class CdkTabsDisabledExample {}
