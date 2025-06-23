import {Component} from '@angular/core';
import {
  CdkTab,
  CdkTabs,
  CdkTabList,
  CdkTabPanel,
  CdkTabContent,
} from '@angular/cdk-experimental/tabs';

/** @title Vertical */
@Component({
  selector: 'cdk-tabs-vertical-example',
  exportAs: 'cdkTabsVerticalExample',
  templateUrl: 'cdk-tabs-vertical-example.html',
  styleUrls: ['../cdk-tabs-common.css'],
  standalone: true,
  imports: [CdkTabList, CdkTab, CdkTabs, CdkTabPanel, CdkTabContent],
})
export class CdkTabsVerticalExample {}
