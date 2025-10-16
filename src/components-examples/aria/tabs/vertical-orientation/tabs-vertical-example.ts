import {Component} from '@angular/core';
import {Tab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';

/** @title Vertical */
@Component({
  selector: 'tabs-vertical-example',
  templateUrl: 'tabs-vertical-example.html',
  styleUrls: ['../tabs-common.css'],
  imports: [TabList, Tab, Tabs, TabPanel, TabContent],
})
export class TabsVerticalExample {}
