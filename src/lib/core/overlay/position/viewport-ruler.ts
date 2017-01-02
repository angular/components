import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import 'rxjs/add/operator/debounceTime';


/**
 * Simple utility for getting the bounds of the browser viewport.
 * @docs-private
 */
@Injectable()
export class ViewportRuler {

  /** Cached document client rectangle. */
  private _documentRect: ClientRect;

  constructor() {
    this._updateDocumentRect();

    // Listen for resize events in the window and update the document rectangle.
    Observable.fromEvent(window, 'resize')
      .debounceTime(100)
      .subscribe(() => this._updateDocumentRect());
  }

  /** Gets a ClientRect for the viewport's bounds. */
  getViewportRect(documentRect = this._documentRect): ClientRect {
    // Use the document element's bounding rect rather than the window scroll properties
    // (e.g. pageYOffset, scrollY) due to in issue in Chrome and IE where window scroll
    // properties and client coordinates (boundingClientRect, clientX/Y, etc.) are in different
    // conceptual viewports. Under most circumstances these viewports are equivalent, but they
    // can disagree when the page is pinch-zoomed (on devices that support touch).
    // See https://bugs.chromium.org/p/chromium/issues/detail?id=489206#c4
    // We use the documentElement instead of the body because, by default (without a css reset)
    // browsers typically give the document body an 8px margin, which is not included in
    // getBoundingClientRect().
    const scrollPosition = this.getViewportScrollPosition(documentRect);
    const height = window.innerHeight;
    const width = window.innerWidth;

    return {
      top: scrollPosition.top,
      left: scrollPosition.left,
      bottom: scrollPosition.top + height,
      right: scrollPosition.left + width,
      height,
      width,
    };
  }


  /**
   * Gets the (top, left) scroll position of the viewport.
   * @param documentRect
   */
  getViewportScrollPosition(documentRect = this._documentRect) {
    // The top-left-corner of the viewport is determined by the scroll position of the document
    // body, normally just (scrollLeft, scrollTop). However, Chrome and Firefox disagree about
    // whether `document.body` or `document.documentElement` is the scrolled element, so reading
    // `scrollTop` and `scrollLeft` is inconsistent. However, using the bounding rect of
    // `document.documentElement` works consistently, where the `top` and `left` values will
    // equal negative the scroll position.
    const top = -documentRect.top || document.body.scrollTop || window.scrollY || 0;
    const left = -documentRect.left || document.body.scrollLeft || window.scrollX || 0;

    return {top, left};
  }

  /** Updates the document rect and caches it in the service. */
  private _updateDocumentRect() {
    this._documentRect = document.documentElement.getBoundingClientRect();
  }

}
