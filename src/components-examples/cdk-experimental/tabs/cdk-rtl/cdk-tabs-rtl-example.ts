import {Component} from '@angular/core';
import {Dir} from '@angular/cdk/bidi';
import {
  CdkTab,
  CdkTabs,
  CdkTabList,
  CdkTabPanel,
  CdkTabContent,
} from '@angular/cdk-experimental/tabs';

/** * @title RTL */
@Component({
  selector: 'cdk-tabs-rtl-example',
  exportAs: 'cdkTabsRtlExample',
  templateUrl: 'cdk-tabs-rtl-example.html',
  styleUrls: ['../cdk-tabs-common.css'],
  standalone: true,
  imports: [CdkTabList, CdkTab, CdkTabs, CdkTabPanel, CdkTabContent, Dir],
})
export class CdkTabsRtlExample {
  selectedIndex = 0;
}
