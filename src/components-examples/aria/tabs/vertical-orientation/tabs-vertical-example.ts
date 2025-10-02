import {Component} from '@angular/core';
import {Tab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';

/** @title Vertical */
@Component({
  selector: 'tabs-vertical-example',
  exportAs: 'TabsVerticalExample',
  templateUrl: 'tabs-vertical-example.html',
  styleUrls: ['../tabs-common.css'],
  standalone: true,
  imports: [TabList, Tab, Tabs, TabPanel, TabContent],
})
export class TabsVerticalExample {}
