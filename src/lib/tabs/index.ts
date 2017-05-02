import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdTab} from './tab';
import {MdTabGroup} from './tab-group';
import {MdTabLabel} from './tab-label';
import {MdTabLabelWrapper} from './tab-label-wrapper';
import {MdTabNavBar, MdTabLink, MdTabLinkRipple} from './tab-nav-bar/tab-nav-bar';
import {MdInkBar} from './ink-bar';
import {MdTabBody} from './tab-body';
import {MdTabHeader} from './tab-header';
import {
  PortalModule,
  MdRippleModule,
  ObserveContentModule,
  _VIEWPORT_RULER_PROVIDER,
  _SCROLL_DISPATCHER_PROVIDER
} from '@angular/material/core';


@NgModule({
  imports: [
    CommonModule,
    PortalModule,
    MdRippleModule,
    ObserveContentModule,
  ],
  // Don't export all components because some are only to be used internally.
  exports: [
    MdTabGroup,
    MdTabLabel,
    MdTab,
    MdTabNavBar,
    MdTabLink,
    MdTabLinkRipple
  ],
  declarations: [
    MdTabGroup,
    MdTabLabel,
    MdTab,
    MdInkBar,
    MdTabLabelWrapper,
    MdTabNavBar,
    MdTabLink,
    MdTabBody,
    MdTabLinkRipple,
    MdTabHeader
  ],
  providers: [_VIEWPORT_RULER_PROVIDER, _SCROLL_DISPATCHER_PROVIDER],
})
export class MdTabsModule {}


export * from './tab-group';
export {MdTabLink, MdTabNavBar} from './tab-nav-bar';
export {MdInkBar} from './ink-bar';
export {MdTabBody, MdTabBodyOriginState, MdTabBodyPositionState} from './tab-body';
export {MdTabHeader, ScrollDirection} from './tab-header';
export {MdTabLabelWrapper} from './tab-label-wrapper';
export {MdTab} from './tab';
export {MdTabLabel} from './tab-label';
