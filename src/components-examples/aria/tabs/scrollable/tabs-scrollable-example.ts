import {afterRenderEffect, Component, viewChildren} from '@angular/core';
import {Tab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';

/** @title Scrollable tabs */
@Component({
  selector: 'tabs-scrollable-example',
  templateUrl: 'tabs-scrollable-example.html',
  styleUrls: ['../tabs-common.css', 'tabs-scrollable-example.css'],
  imports: [TabList, Tab, Tabs, TabPanel, TabContent],
})
export class TabsScrollableExample {
  tabs = viewChildren(Tab);
  tabsList = Array.from({length: 15}, (_, i) => i + 1);

  constructor() {
    afterRenderEffect(() => {
      const tab = this.tabs().find(t => t.active());
      tab?.element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
    });
  }
}
