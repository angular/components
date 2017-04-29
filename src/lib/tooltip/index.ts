import {NgModule} from '@angular/core';
import {OverlayModule, MdCommonModule, PlatformModule} from '@angular/material/core';
import {MdTooltip, TooltipComponent} from './tooltip';


@NgModule({
  imports: [OverlayModule, MdCommonModule, PlatformModule],
  exports: [MdTooltip, TooltipComponent, MdCommonModule],
  declarations: [MdTooltip, TooltipComponent],
  entryComponents: [TooltipComponent],
})
export class MdTooltipModule {}


export * from './tooltip';
