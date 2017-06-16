/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, MdCommonModule} from '../core';
import {CdkStickyRegion, CdkStickyHeader} from './sticky-header-dir';



@NgModule({
    imports: [OverlayModule, MdCommonModule, CommonModule],
    declarations: [CdkStickyRegion, CdkStickyHeader],
    exports: [CdkStickyRegion, CdkStickyHeader, MdCommonModule],
})
export class CdkStickyHeaderModule {}


export * from './sticky-header-dir';
