import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, MdCommonModule} from '../core';
import {StickyParentDirective, StickyHeaderDirective} from './sticky-header-dir';



@NgModule({
    imports: [OverlayModule, MdCommonModule, CommonModule],
    declarations: [StickyParentDirective, StickyHeaderDirective],
    exports: [StickyParentDirective, StickyHeaderDirective, MdCommonModule],
})
export class MdStickyHeaderModule {}


export * from './sticky-header-dir';
