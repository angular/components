/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import type {Combobox} from './combobox';

/** Token used to provide the combobox to child components. */
export const COMBOBOX = new InjectionToken<Combobox<unknown>>('COMBOBOX');
