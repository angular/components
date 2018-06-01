/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';

/**
 * Workaround for circular dependency when using `providedIn` with `Overlay`
 * (without this, you'd have injectable ← module ← directives ← injectable).
 * @docs-private
 */
@NgModule({})
export class OverlayInjectionModule { }
