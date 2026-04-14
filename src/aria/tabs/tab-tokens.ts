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

/** Token used to expose the `Tabs` directive to child directives. */
export const TABS = new InjectionToken<Tabs>('TABS');

/** Token used to expose the tab list. */
export const TAB_LIST = new InjectionToken<TabList>('TAB_LIST');
