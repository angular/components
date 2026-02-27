/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import type {DisclosureTrigger} from './disclosure-trigger';

/** Token used to expose the disclosure trigger to its content. */
export const DISCLOSURE_TRIGGER = new InjectionToken<DisclosureTrigger>('DISCLOSURE_TRIGGER');
