/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import type {Tabs} from './tabs';
import type {TabList} from './tab-list';
import {SortedCollection} from '../private/utils/collection';
import type {TabPanel} from './tab-panel';
import type {Tab} from './tab';

/** Token used to expose the `Tabs` directive to child directives. */
export const TABS = new InjectionToken<Tabs>('TABS');

/** Token used to expose the tab list. */
export const TAB_LIST = new InjectionToken<TabList>('TAB_LIST');

/** Token used to expose the collection of tab panels to child directives. */
export const TABS_PANEL_COLLECTION = new InjectionToken<SortedCollection<TabPanel>>(
  'TABS_PANEL_COLLECTION',
);

/** Token used to expose the collection of tabs to child directives. */
export const TAB_LIST_COLLECTION = new InjectionToken<SortedCollection<Tab>>('TAB_LIST_COLLECTION');
