/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {A11yModule} from '@angular/cdk/a11y';
import {BidiModule} from '@angular/cdk/bidi';
import {OverlayModule} from '@angular/cdk/overlay';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MatTooltip, TooltipComponent} from './tooltip';

@NgModule({
  imports: [A11yModule, OverlayModule, MatTooltip, TooltipComponent],
  exports: [MatTooltip, TooltipComponent, BidiModule, CdkScrollableModule],
})
export class MatTooltipModule {}
