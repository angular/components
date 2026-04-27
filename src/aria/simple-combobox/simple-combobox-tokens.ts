/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import type {ComboboxPopup} from './simple-combobox-popup';

/** Token used to expose the combobox popup. */
export const SIMPLE_COMBOBOX_POPUP = new InjectionToken<ComboboxPopup>('SIMPLE_COMBOBOX_POPUP');
