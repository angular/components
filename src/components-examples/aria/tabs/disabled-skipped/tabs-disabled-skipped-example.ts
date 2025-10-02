import {Component} from '@angular/core';
import {Tab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';

/** @title Disabled Tabs are Skipped */
@Component({
  selector: 'tabs-disabled-skipped-example',
  exportAs: 'TabsDisabledSkippedExample',
  templateUrl: 'tabs-disabled-skipped-example.html',
  styleUrls: ['../tabs-common.css'],
  standalone: true,
  imports: [TabList, Tab, Tabs, TabPanel, TabContent],
})
export class TabsDisabledSkippedExample {}
