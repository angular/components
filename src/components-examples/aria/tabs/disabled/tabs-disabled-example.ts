import {Component} from '@angular/core';
import {Tab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';

/** @title Disabled */
@Component({
  selector: 'tabs-disabled-example',
  exportAs: 'TabsDisabledExample',
  templateUrl: 'tabs-disabled-example.html',
  styleUrls: ['../tabs-common.css'],
  standalone: true,
  imports: [TabList, Tab, Tabs, TabPanel, TabContent],
})
export class TabsDisabledExample {}
