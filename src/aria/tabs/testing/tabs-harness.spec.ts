/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ComponentHarness, HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Tabs, TabList, Tab, TabPanel, TabContent} from '../../tabs';
import {TabsHarness} from './tabs-harness';

class TestContentHarness extends ComponentHarness {
  static hostSelector = '.test-content';
  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}

describe('TabsHarness', () => {
  let fixture: ComponentFixture<TabsHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness with tabs container', async () => {
    await expectAsync(loader.getHarness(TabsHarness)).toBeResolved();
  });

  it('should get tabs', async () => {
    const tabs = await loader.getHarness(TabsHarness);

    const tabItems = await tabs.getTabs();

    expect(tabItems.length).toBe(3);
  });

  it('should get tab panel content via ContentContainerComponentHarness', async () => {
    const tabs = await loader.getHarness(TabsHarness);
    const tabItems = await tabs.getTabs();

    const contentHarness = await tabItems[0].getHarness(TestContentHarness);

    expect(await contentHarness.getText()).toBe('Content 1');
  });

  it('should get selected tab', async () => {
    const tabs = await loader.getHarness(TabsHarness);

    const selectedTab = await tabs.getSelectedTab();

    expect(await selectedTab?.getTitle()).toBe('Tab 1');
  });

  it('should switch tabs on click', async () => {
    const tabs = await loader.getHarness(TabsHarness);
    const tabItems = await tabs.getTabs();
    expect(await tabItems[0].isSelected()).toBe(true);
    expect(await tabItems[1].isSelected()).toBe(false);

    await tabItems[1].select();

    expect(await tabItems[0].isSelected()).toBe(false);
    expect(await tabItems[1].isSelected()).toBe(true);
  });

  it('should select tab matching filters', async () => {
    const tabs = await loader.getHarness(TabsHarness);
    const tabItems = await tabs.getTabs();

    expect(await tabItems[0].isSelected()).toBe(true);
    expect(await tabItems[1].isSelected()).toBe(false);

    await tabs.selectTab({title: 'Tab 2'});

    expect(await tabItems[0].isSelected()).toBe(false);
    expect(await tabItems[1].isSelected()).toBe(true);
  });

  it('should check disabled state', async () => {
    const tabs = await loader.getHarness(TabsHarness);
    const tabItems = await tabs.getTabs();

    expect(await tabItems[0].isDisabled()).toBe(false);
    expect(await tabItems[2].isDisabled()).toBe(true);
  });

  it('should check active state', async () => {
    const tabs = await loader.getHarness(TabsHarness);
    const tabItems = await tabs.getTabs();

    expect(await tabItems[0].isActive()).toBe(true);
    expect(await tabItems[1].isActive()).toBe(false);
  });

  it('should filter tabs by title', async () => {
    const tabs = await loader.getHarness(TabsHarness);

    const filteredTabs = await tabs.getTabs({title: 'Tab 2'});

    expect(filteredTabs.length).toBe(1);
    expect(await filteredTabs[0].getTitle()).toBe('Tab 2');
  });

  it('should filter tabs by selected state', async () => {
    const tabs = await loader.getHarness(TabsHarness);

    const filteredTabs = await tabs.getTabs({selected: true});

    expect(filteredTabs.length).toBe(1);
    expect(await filteredTabs[0].getTitle()).toBe('Tab 1');
  });

  it('should filter tabs by disabled state', async () => {
    const tabs = await loader.getHarness(TabsHarness);

    const filteredTabs = await tabs.getTabs({disabled: true});

    expect(filteredTabs.length).toBe(1);
    expect(await filteredTabs[0].getTitle()).toBe('Tab 3');
  });
});

@Component({
  template: `
    <div ngTabs>
      <ul ngTabList [selectedTab]="'tab1'">
        <li ngTab panel="tab1">Tab 1</li>
        <li ngTab panel="tab2">Tab 2</li>
        <li ngTab panel="tab3" [disabled]="true">Tab 3</li>
      </ul>


      <div ngTabPanel id="tab1">
        <ng-template ngTabContent>
          <div class="test-content">Content 1</div>
        </ng-template>
      </div>
      <div ngTabPanel id="tab2">
        <ng-template ngTabContent>Content 2</ng-template>
      </div>
      <div ngTabPanel id="tab3">
        <ng-template ngTabContent>Content 3</ng-template>
      </div>
    </div>
  `,
  imports: [Tabs, TabList, Tab, TabPanel, TabContent],
})
class TabsHarnessTest {}
