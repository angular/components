import {Component} from '@angular/core';
import {
  CdkTab,
  CdkTabs,
  CdkTabList,
  CdkTabPanel,
  CdkTabContent,
} from '@angular/cdk-experimental/tabs';

/** @title Disabled Tabs are Skipped */
@Component({
  selector: 'cdk-tabs-disabled-skipped-example',
  exportAs: 'cdkTabsDisabledSkippedExample',
  templateUrl: 'cdk-tabs-disabled-skipped-example.html',
  styleUrls: ['../cdk-tabs-common.css'],
  standalone: true,
  imports: [CdkTabList, CdkTab, CdkTabs, CdkTabPanel, CdkTabContent],
})
export class CdkTabsDisabledSkippedExample {}
