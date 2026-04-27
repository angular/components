/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import type {Listbox} from './listbox';
import {SortedCollection} from '../private/utils/collection';
import type {Option} from './option';

export const LISTBOX = new InjectionToken<Listbox<any>>('LISTBOX');

export const LISTBOX_COLLECTION = new InjectionToken<SortedCollection<Option<any>>>(
  'LISTBOX_COLLECTION',
);
