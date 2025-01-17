/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '../common-behaviors/common-module';
import {MatRipple} from './ripple';

export * from './ripple';
export * from './ripple-ref';
export {RippleRenderer, RippleTarget, defaultRippleAnimationConfig} from './ripple-renderer';

@NgModule({
  imports: [MatCommonModule, MatRipple],
  exports: [MatRipple, MatCommonModule],
})
export class MatRippleModule {}
