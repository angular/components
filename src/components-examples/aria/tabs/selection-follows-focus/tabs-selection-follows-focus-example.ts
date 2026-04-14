import {afterRenderEffect, Component, viewChildren} from '@angular/core';
import {Tabs, Tab, TabList, TabPanel, TabContent} from '@angular/aria/tabs';

/** @title Selection Follows Focus */
@Component({
  selector: 'tabs-selection-follows-focus-example',
  templateUrl: 'tabs-selection-follows-focus-example.html',
  styleUrls: ['../tabs-common.css'],
  imports: [Tabs, TabList, Tab, TabPanel, TabContent],
})
export class TabsSelectionFollowsFocusExample {
  tabs = viewChildren(Tab);

  constructor() {
    afterRenderEffect(() => {
      const tab = this.tabs().find(t => t.active());
      tab?.element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
    });
  }
}
