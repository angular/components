import {Injectable, Optional, SkipSelf} from '@angular/core';


/**
 * Utilitity that allows for toggling scrolling of the viewport on/off.
 */
@Injectable()
export class DisableBodyScroll {
  private _bodyStyles: string = '';
  private _htmlStyles: string = '';
  private _previousScrollPosition: number = 0;
  private _isActive: boolean = false;

  /** Whether scrolling is disabled. */
  public get isActive(): boolean {
    return this._isActive;
  }

  /**
   * Disables scrolling if it hasn't been disabled already and if the body is scrollable.
   */
  activate(): void {
    if (!this.isActive && document.body.scrollHeight > window.innerHeight) {
      let body = document.body;
      let html = document.documentElement;
      let initialBodyWidth = body.clientWidth;

      this._htmlStyles = html.style.cssText || '';
      this._bodyStyles = body.style.cssText || '';
      this._previousScrollPosition = window.scrollY || window.pageYOffset || 0;

      body.style.position = 'fixed';
      body.style.width = '100%';
      body.style.top = -this._previousScrollPosition + 'px';
      html.style.overflowY = 'scroll';

      // TODO(crisbeto): this avoids issues if the body has a margin, however it prevents the
      // body from adapting if the window is resized. check whether it's ok to reset the body
      // margin in the core styles.
      body.style.maxWidth = initialBodyWidth + 'px';

      this._isActive = true;
    }
  }

  /**
   * Re-enables scrolling.
   */
  deactivate(): void {
    if (this.isActive) {
      document.body.style.cssText = this._bodyStyles;
      document.documentElement.style.cssText = this._htmlStyles;
      window.scroll(0, this._previousScrollPosition);
      this._isActive = false;
    }
  }
}

export function DISABLE_BODY_SCROLL_PROVIDER_FACTORY(parentDispatcher: DisableBodyScroll) {
  return parentDispatcher || new DisableBodyScroll();
};

export const DISABLE_BODY_SCROLL_PROVIDER = {
  provide: DisableBodyScroll,
  deps: [[new Optional(), new SkipSelf(), DisableBodyScroll]],
  useFactory: DISABLE_BODY_SCROLL_PROVIDER_FACTORY
};
