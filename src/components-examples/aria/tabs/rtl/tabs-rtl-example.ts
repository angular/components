import {afterRenderEffect, Component, viewChildren} from '@angular/core';
import {Dir} from '@angular/cdk/bidi';
import {Tab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';

/** * @title RTL */
@Component({
  selector: 'tabs-rtl-example',
  templateUrl: 'tabs-rtl-example.html',
  styleUrls: ['../tabs-common.css'],
  imports: [TabList, Tab, Tabs, TabPanel, TabContent, Dir],
})
export class TabsRtlExample {
  tabs = viewChildren(Tab);

  constructor() {
    afterRenderEffect(() => {
      const tab = this.tabs().find(t => t.active());
      tab?.element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
    });
  }
}
