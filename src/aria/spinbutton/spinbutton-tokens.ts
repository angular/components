/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import type {SpinButton} from './spinbutton';
import type {SpinButtonInput} from './spinbutton-input';

/** Token used to expose the spinbutton container. */
export const SPINBUTTON = new InjectionToken<SpinButton>('SPINBUTTON');

/** Token used to expose the spinbutton input element. */
export const SPINBUTTON_INPUT = new InjectionToken<SpinButtonInput>('SPINBUTTON_INPUT');
