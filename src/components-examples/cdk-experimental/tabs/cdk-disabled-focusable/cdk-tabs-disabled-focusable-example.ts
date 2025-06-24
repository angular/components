import {Component} from '@angular/core';
import {
  CdkTab,
  CdkTabs,
  CdkTabList,
  CdkTabPanel,
  CdkTabContent,
} from '@angular/cdk-experimental/tabs';

/** @title Disabled Tabs are Focusable */
@Component({
  selector: 'cdk-tabs-disabled-focusable-example',
  exportAs: 'cdkTabsDisabledFocusableExample',
  templateUrl: 'cdk-tabs-disabled-focusable-example.html',
  styleUrls: ['../cdk-tabs-common.css'],
  standalone: true,
  imports: [CdkTabList, CdkTab, CdkTabs, CdkTabPanel, CdkTabContent],
})
export class CdkTabsDisabledFocusableExample {}
