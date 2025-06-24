import {Component} from '@angular/core';
import {
  CdkTab,
  CdkTabs,
  CdkTabList,
  CdkTabPanel,
  CdkTabContent,
} from '@angular/cdk-experimental/tabs';

/** * @title RTL & Vertical */
@Component({
  selector: 'cdk-tabs-rtl-vertical-example',
  exportAs: 'cdkTabsRtlVerticalExample',
  templateUrl: 'cdk-tabs-rtl-vertical-example.html',
  styleUrls: ['../cdk-tabs-common.css'],
  standalone: true,
  imports: [CdkTabList, CdkTab, CdkTabs, CdkTabPanel, CdkTabContent],
})
export class CdkTabsRtlVerticalExample {
  selectedIndex = 0;
}
