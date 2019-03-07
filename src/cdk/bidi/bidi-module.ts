/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule, Version} from '@angular/core';
import {Dir} from './dir';

// export private version constant to circumvent test/build issues
export const ɵVERSION = new Version('0.0.0-PLACEHOLDER');

@NgModule({
  exports: [Dir],
  declarations: [Dir],
})
export class BidiModule { }
