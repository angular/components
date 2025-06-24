import {Component} from '@angular/core';
import {
  CdkTab,
  CdkTabs,
  CdkTabList,
  CdkTabPanel,
  CdkTabContent,
} from '@angular/cdk-experimental/tabs';

/** @title Selection Follows Focus */
@Component({
  selector: 'cdk-tabs-selection-follows-focus-example',
  exportAs: 'cdkTabsSelectionFollowsFocusExample',
  templateUrl: 'cdk-tabs-selection-follows-focus-example.html',
  styleUrls: ['../cdk-tabs-common.css'],
  standalone: true,
  imports: [CdkTabList, CdkTab, CdkTabs, CdkTabPanel, CdkTabContent],
})
export class CdkTabsSelectionFollowsFocusExample {}
