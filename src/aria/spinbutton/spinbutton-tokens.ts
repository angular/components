/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import type {SpinButtonGroup} from './spinbutton-group';

/** Injection token for the SpinButtonGroup directive. */
export const SPINBUTTON_GROUP = new InjectionToken<SpinButtonGroup>('SPINBUTTON_GROUP');
