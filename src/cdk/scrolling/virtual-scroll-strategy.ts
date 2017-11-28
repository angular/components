import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';
import {InjectionToken} from '@angular/core';


/** The injection token used to specify the virtual scrolling strategy. */
export const VIRTUAL_SCROLL_STRATEGY =
    new InjectionToken<VirtualScrollStrategy>('VIRTUAL_SCROLL_STRATEGY');


/** A strategy that dictates which items should be rendered in the viewport. */
export interface VirtualScrollStrategy {
  /** Called after the viewport is initialized. */
  init(viewport: CdkVirtualScrollViewport): void;

  /** Called when the viewport is scrolled (debounced using requestAnimationFrame). */
  onContentScrolled();

  /** Called when the length of the data changes. */
  onDataLengthChanged();
}
