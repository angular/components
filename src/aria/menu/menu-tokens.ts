/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import type {Menu} from './menu';
import type {MenuBar} from './menu-bar';

/** Token used to expose menus to their child components. */
export const MENU_COMPONENT = new InjectionToken<Menu<any> | MenuBar<any>>('MENU_COMPONENT');
