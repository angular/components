import {Component} from '@angular/core';
import {Tab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';

/** @title Disabled Tabs are Focusable */
@Component({
  selector: 'tabs-disabled-focusable-example',
  templateUrl: 'tabs-disabled-focusable-example.html',
  styleUrls: ['../tabs-common.css'],
  imports: [TabList, Tab, Tabs, TabPanel, TabContent],
})
export class TabsDisabledFocusableExample {}
