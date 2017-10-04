/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {platformBrowser} from '@angular/platform-browser';
import {E2eAppModuleNgFactory} from './e2e-app-module.ngfactory';

platformBrowser().bootstrapModuleFactory(E2eAppModuleNgFactory);
