/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Directive, ElementRef, inject, signal} from '@angular/core';
import {TabList} from './tab-list';
import {TabPanel} from './tab-panel';
import {TABS} from './utils';
import {TabPanelPattern, TabPattern} from '../private';

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

  /** The TabList nested inside of the container. */
  private readonly _tablist = signal<TabList | undefined>(undefined);

  /** The TabPanels nested inside of the container. */
  private readonly _unorderedPanels = signal(new Set<TabPanel>());

  /** The Tab UIPattern of the child Tabs. */
  readonly _tabPatterns = computed<TabPattern[] | undefined>(() => this._tablist()?._tabPatterns());

  /** The TabPanel UIPattern of the child TabPanels. */
  readonly _unorderedTabpanelPatterns = computed<TabPanelPattern[]>(() =>
    [...this._unorderedPanels()].map(tabpanel => tabpanel._pattern),
  );

  _register(child: TabList | TabPanel) {
    if (child instanceof TabList) {
      this._tablist.set(child);
    }

    if (child instanceof TabPanel) {
      this._unorderedPanels().add(child);
      this._unorderedPanels.set(new Set(this._unorderedPanels()));
    }
  }

  _unregister(child: TabList | TabPanel) {
    if (child instanceof TabList) {
      this._tablist.set(undefined);
    }

    if (child instanceof TabPanel) {
      this._unorderedPanels().delete(child);
      this._unorderedPanels.set(new Set(this._unorderedPanels()));
    }
  }
}
