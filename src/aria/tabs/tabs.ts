/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computed,
  Directive,
  ElementRef,
  inject,
  signal,
  afterNextRender,
  OnDestroy,
} from '@angular/core';
import {TabList} from './tab-list';
import {TabPanel} from './tab-panel';
import {TABS} from './tab-tokens';
import {TabPanelPattern, TabPattern} from '../private';
import {SortedCollection} from '../private/utils/collection';

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
export class Tabs implements OnDestroy {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The TabList registered for this container. */
  readonly _tabList = signal<TabList | undefined>(undefined);

  /** The collection of TabPanels. */
  readonly _collection = new SortedCollection<TabPanel>();

  /** The Tab UIPattern of the child Tabs. */
  readonly _tabPatterns = computed<TabPattern[] | undefined>(() => this._tabList()?._tabPatterns());

  /** The TabPanel UIPattern of the child TabPanels. */
  readonly _tabPanelPatterns = computed<TabPanelPattern[]>(() =>
    this._collection.orderedItems().map(tabpanel => tabpanel._pattern),
  );

  /** A reactive map of tab values to their TabPanelPattern. */
  readonly _panelMap = computed(() => {
    const map = new Map<string, TabPanelPattern>();
    for (const panel of this._collection.orderedItems()) {
      map.set(panel.value(), panel._pattern);
    }
    return map;
  });

  /** A reactive map of tab values to their TabPattern. */
  readonly _tabMap = computed(() => {
    const map = new Map<string, TabPattern>();
    const tabList = this._tabList();
    if (tabList) {
      for (const tab of tabList._collection.orderedItems()) {
        map.set(tab.value(), tab._pattern);
      }
    }
    return map;
  });

  constructor() {
    afterNextRender(() => {
      this._collection.startObserving(this.element);
    });
  }

  ngOnDestroy() {
    this._collection.stopObserving();
  }

  _register(child: TabList) {
    this._tabList.set(child);
  }

  _unregister() {
    this._tabList.set(undefined);
  }
}
