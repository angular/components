import {Component} from '@angular/core';
import {
  CdkTab,
  CdkTabs,
  CdkTabList,
  CdkTabPanel,
  CdkTabContent,
} from '@angular/cdk-experimental/tabs';

/** @title Active Descendant */
@Component({
  selector: 'cdk-tabs-active-descendant-example',
  exportAs: 'cdkTabsActiveDescendantExample',
  templateUrl: 'cdk-tabs-active-descendant-example.html',
  styleUrls: ['../cdk-tabs-common.css'],
  standalone: true,
  imports: [CdkTabList, CdkTab, CdkTabs, CdkTabPanel, CdkTabContent],
})
export class CdkTabsActiveDescendantExample {}
