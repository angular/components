/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import type {AccordionGroup} from './accordion-group';
import {SortedCollection} from '../private/utils/collection';
import type {AccordionTrigger} from './accordion-trigger';

/** Token used to expose the accordion group. */
export const ACCORDION_GROUP = new InjectionToken<AccordionGroup>('ACCORDION_GROUP');

export const ACCORDION_COLLECTION = new InjectionToken<SortedCollection<AccordionTrigger>>(
  'ACCORDION_COLLECTION',
);
