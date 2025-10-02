import {Component} from '@angular/core';
import {Tab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';

/** @title Explicit selection */
@Component({
  selector: 'tabs-explicit-selection-example',
  exportAs: 'TabsExplicitSelectionExample',
  templateUrl: 'tabs-explicit-selection-example.html',
  styleUrls: ['../tabs-common.css'],
  standalone: true,
  imports: [TabList, Tab, Tabs, TabPanel, TabContent],
})
export class TabsExplicitSelectionExample {}
