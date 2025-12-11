import {afterRenderEffect, Component, viewChildren} from '@angular/core';
import {Tab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';

/** @title Active Descendant */
@Component({
  selector: 'tabs-active-descendant-example',
  templateUrl: 'tabs-active-descendant-example.html',
  styleUrls: ['../tabs-common.css'],
  imports: [TabList, Tab, Tabs, TabPanel, TabContent],
})
export class TabsActiveDescendantExample {
  tabs = viewChildren(Tab);

  constructor() {
    afterRenderEffect(() => {
      const tab = this.tabs().find(t => t.active());
      tab?.element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
    });
  }
}
