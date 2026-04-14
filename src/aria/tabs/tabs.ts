/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, computed, effect, inject, signal} from '@angular/core';
import {TabList} from './tab-list';
import {TabPanel} from './tab-panel';
import {TABS} from './tab-tokens';

/**
 * A Tabs container.
 *
 * The `ngTabs` directive represents a set of layered sections of content. It acts as the
 * overarching container for a tabbed interface, coordinating the behavior of `ngTabList`,
 * `ngTab`, and `ngTabPanel` directives.
 *
 * ```html
 * <div ngTabs>
 *   <ul ngTabList [(selectedTab)]="selectedTabValue">
 *     <li ngTab value="tab1">Tab 1</li>
 *     <li ngTab value="tab2">Tab 2</li>
 *     <li ngTab value="tab3">Tab 3</li>
 *   </ul>
 *
 *   <div ngTabPanel value="tab1">
 *      <ng-template ngTabContent>Content for Tab 1</ng-template>
 *   </div>
 *   <div ngTabPanel value="tab2">
 *      <ng-template ngTabContent>Content for Tab 2</ng-template>
 *   </div>
 *   <div ngTabPanel value="tab3">
 *      <ng-template ngTabContent>Content for Tab 3</ng-template>
 *   </div>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Tabs](guide/aria/tabs)
 */
@Directive({
  selector: '[ngTabs]',
  exportAs: 'ngTabs',
  providers: [{provide: TABS, useExisting: Tabs}],
})
export class Tabs {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The TabList registered for this container. */
  private readonly _tabList = signal<TabList | undefined>(undefined);

  /** The TabPanels registered for this container. */
  private readonly _tabPanels = signal(new Set<TabPanel>());

  /** The TabPanels registered for this container. */
  private readonly _tabPanelsList = computed(() => [...this._tabPanels()]);

  constructor() {
    effect(() => {
      if (this._tabList()) {
        for (const tab of this._tabList()!._sortedTabs()) {
          const panel = this._tabPanelsList().find(panel => panel === tab.panel());

          if (panel) {
            panel._tabPattern.set(tab._pattern);
          }
        }
      }
    });
  }

  _registerList(list: TabList) {
    this._tabList.set(list);
  }

  _unregisterList(list: TabList) {
    this._tabList.set(undefined);
  }

  _registerPanel(panel: TabPanel) {
    this._tabPanels().add(panel);
    this._tabPanels.set(new Set(this._tabPanels()));
  }

  _unregisterPanel(panel: TabPanel) {
    this._tabPanels().delete(panel);
    this._tabPanels.set(new Set(this._tabPanels()));
  }

  findTabPanel(id?: string) {
    return id ? this._tabPanelsList().find(panel => panel.id() === id) : undefined;
  }
}
