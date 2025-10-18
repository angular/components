import {Component} from '@angular/core';
import {Tab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';

/** @title Selection Follows Focus */
@Component({
  selector: 'tabs-selection-follows-focus-example',
  templateUrl: 'tabs-selection-follows-focus-example.html',
  styleUrls: ['../tabs-common.css'],
  imports: [TabList, Tab, Tabs, TabPanel, TabContent],
})
export class TabsSelectionFollowsFocusExample {}
