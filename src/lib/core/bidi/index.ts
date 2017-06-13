/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ModuleWithProviders, NgModule} from '@angular/core';
import {Dir} from './dir';
import {Directionality, DIRECTIONALITY_PROVIDER} from './directionality';

export {
  Directionality,
  DIRECTIONALITY_PROVIDER,
  Direction
} from './directionality';
export {Dir} from './dir';

@NgModule({
  exports: [Dir],
  declarations: [Dir],
  providers: [Directionality]
})
export class BidiModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: BidiModule,
      providers: [DIRECTIONALITY_PROVIDER]
    };
  }
}
