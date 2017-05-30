import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, MdCommonModule} from '../core';
import {MdMenu} from '../menu/menu-directive';
import {MdMenuItem} from '../menu/menu-item';
import {MdMenuTrigger} from '../menu/menu-trigger';
import {MdRippleModule} from '../core/ripple/index';
import {StickyHeaderComponent} from './sticky-header';

@NgModule({
    imports: [OverlayModule, MdCommonModule],
    exports: [StickyHeaderComponent, MdCommonModule],
    declarations: [StickyHeaderComponent],
    entryComponents: [StickyHeaderComponent],
})
export class MdStickyHeaderModule {}


export * from './sticky-header';
