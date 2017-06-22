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
import {StickyParentDirective, StickyHeaderDirective} from './sticky-header-dir';



@NgModule({
    imports: [OverlayModule, MdCommonModule, CommonModule],
    declarations: [StickyParentDirective, StickyHeaderDirective],
    exports: [StickyParentDirective, StickyHeaderDirective, MdCommonModule],
})
export class CdkStickyHeaderModule {}


export * from './sticky-header-dir';
