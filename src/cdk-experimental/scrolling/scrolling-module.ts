/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {CdkAutoSizeVirtualScroll} from './auto-size-virtual-scroll';

@NgModule({
  imports: [CdkAutoSizeVirtualScroll],
  exports: [CdkAutoSizeVirtualScroll],
})
export class ScrollingModule {}
