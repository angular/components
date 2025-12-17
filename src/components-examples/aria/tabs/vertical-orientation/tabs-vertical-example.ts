import {afterRenderEffect, Component, viewChildren} from '@angular/core';
import {Tab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';

/** @title Vertical */
@Component({
  selector: 'tabs-vertical-example',
  templateUrl: 'tabs-vertical-example.html',
  styleUrls: ['../tabs-common.css'],
  imports: [TabList, Tab, Tabs, TabPanel, TabContent],
})
export class TabsVerticalExample {
  tabs = viewChildren(Tab);

  constructor() {
    afterRenderEffect(() => {
      const tab = this.tabs().find(t => t.active());
      tab?.element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
    });
  }
}
