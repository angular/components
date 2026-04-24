import {afterRenderEffect, Component, viewChildren} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {Tabs, Tab, TabList, TabPanel, TabContent} from '@angular/aria/tabs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

/** @title Configurable Tabs. */
@Component({
  selector: 'tabs-configurable-example',
  templateUrl: 'tabs-configurable-example.html',
  styleUrls: ['../tabs-common.css', 'tabs-configurable-example.css'],
  imports: [
    Tabs,
    TabList,
    Tab,
    TabPanel,
    TabContent,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
})
export class TabsConfigurableExample {
  orientation: 'vertical' | 'horizontal' = 'horizontal';
  focusMode: 'roving' | 'activedescendant' = 'roving';
  selectionMode: 'explicit' | 'follow' = 'follow';
  selectedTab = 'tab1';

  wrap = new FormControl(true, {nonNullable: true});
  disabled = new FormControl(false, {nonNullable: true});
  softDisabled = new FormControl(true, {nonNullable: true});

  tabs = viewChildren(Tab);

  tabsData = [
    {label: 'Tab 1', value: 'tab1'},
    {label: 'Tab 2', value: 'tab2'},
    {label: 'Tab 3', value: 'tab3'},
    {label: 'Tab 4', value: 'tab4'},
    {label: 'Tab 5', value: 'tab5'},
  ];

  constructor() {
    afterRenderEffect(() => {
      const tab = this.tabs().find(tab => tab.active());
      tab?.element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
    });
  }
}
