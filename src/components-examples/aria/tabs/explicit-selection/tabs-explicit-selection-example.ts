import {afterRenderEffect, Component, viewChildren} from '@angular/core';
import {Tab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';

/** @title Explicit selection */
@Component({
  selector: 'tabs-explicit-selection-example',
  templateUrl: 'tabs-explicit-selection-example.html',
  styleUrls: ['../tabs-common.css'],
  imports: [TabList, Tab, Tabs, TabPanel, TabContent],
})
export class TabsExplicitSelectionExample {
  tabs = viewChildren(Tab);

  constructor() {
    afterRenderEffect(() => {
      const tab = this.tabs().find(t => t.active());
      tab?.element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
    });
  }
}
