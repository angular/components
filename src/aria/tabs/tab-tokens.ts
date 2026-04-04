/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import type {Tabs} from './tabs';

/** Token used to expose the `Tabs` directive to child directives. */
export const TABS = new InjectionToken<Tabs>('TABS');
