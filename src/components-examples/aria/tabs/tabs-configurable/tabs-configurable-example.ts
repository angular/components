import {Component} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {Tabs, TabList, Tab, TabPanel, TabContent} from '@angular/aria/tabs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

/** @title Configurable Tabs. */
@Component({
  selector: 'tabs-configurable-example',
  exportAs: 'TabsConfigurableExample',
  templateUrl: 'tabs-configurable-example.html',
  styleUrls: ['../tabs-common.css'],
  standalone: true,
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
  tabSelection = 'tab-1';

  wrap = new FormControl(true, {nonNullable: true});
  disabled = new FormControl(false, {nonNullable: true});
  skipDisabled = new FormControl(true, {nonNullable: true});
}
