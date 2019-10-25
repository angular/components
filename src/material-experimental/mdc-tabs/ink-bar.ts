/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, QueryList} from '@angular/core';
import {
  MDCSlidingTabIndicatorFoundation,
  MDCTabIndicatorAdapter,
  MDCTabIndicatorFoundation
} from '@material/tab-indicator';

/**
 * Item inside a tab header relative to which the ink bar can be aligned.
 * @docs-private
 */
export interface MatInkBarItem {
  _foundation: MatInkBarFoundation;
  elementRef: ElementRef<HTMLElement>;
}

/**
 * Abstraction around the MDC tab indicator that manages the ink bar of a tab header.
 * @docs-private
 */
export class MatInkBar {
  /** Item to which the ink bar is aligned currently. */
  private _currentItem: MatInkBarItem|undefined;

  constructor(private _items: QueryList<MatInkBarItem>) {}

  /** Hides the ink bar. */
  hide() {
    this._items.forEach(item => item._foundation.deactivate());
  }

  /** Aligns the ink bar to a DOM node. */
  alignToElement(element: HTMLElement) {
    const correspondingItem = this._items.find(item => item.elementRef.nativeElement === element);
    const currentItem = this._currentItem;

    if (currentItem) {
      currentItem._foundation.deactivate();
    }

    if (correspondingItem) {
      const clientRect = currentItem ?
          currentItem._foundation.computeContentClientRect() : undefined;

      // The MDC indicator won't animate unless we give it the `ClientRect` of the previous item.
      correspondingItem._foundation.activate(clientRect);
      this._currentItem = correspondingItem;
    }
  }
}

/**
 * Implementation of MDC's sliding tab indicator foundation.
 * @docs-private
 */
export class MatInkBarFoundation {
  private _destroyed: boolean;
  private _foundation: MDCTabIndicatorFoundation;
  private _indicator: HTMLElement;
  private _indicatorContent: HTMLElement;
  private _adapter: MDCTabIndicatorAdapter = {
    addClass: className => {
      if (!this._destroyed) {
        this._element.classList.add(className);
      }
    },
    removeClass: className => {
      if (!this._destroyed) {
        this._element.classList.remove(className);
      }
    },
    setContentStyleProperty: (propName, value) => {
      this._indicatorContent.style.setProperty(propName, value);
    },
    computeContentClientRect: () => {
      // `getBoundingClientRect` isn't available on the server.
      return this._destroyed || !this._indicatorContent.getBoundingClientRect ? {
        width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0
      } : this._indicatorContent.getBoundingClientRect();
    }
  };

  /**
   * Whether the indicator should be appended to the content, which will cause the ink bar
   * to match the width of the content rather than the tab host element.
   */
  get fitToContent(): boolean { return this._fitToContent; }
  set fitToContent(fitToContent: boolean) {
    if (this._fitToContent !== fitToContent) {
      this._fitToContent = fitToContent;
      if (this._indicator) {
        this._appendIndicator();
      }
    }
  }
  private _fitToContent = false;

  constructor(private _element: HTMLElement, private _document: Document) {
    this._foundation = new MDCSlidingTabIndicatorFoundation(this._adapter);
  }

  /** Aligns the ink bar to the current item. */
  activate(clientRect?: ClientRect) {
    this._foundation.activate(clientRect);
  }

  /** Removes the ink bar from the current item. */
  deactivate() {
    this._foundation.deactivate();
  }

  /** Gets the ClientRect of the indicator. */
  computeContentClientRect() {
    return this._foundation.computeContentClientRect();
  }

  /** Initializes the foundation. */
  init() {
    this._createIndicator(this._document);
    this._foundation.init();
  }

  /** Destroys the foundation. */
  destroy() {
    const indicator = this._indicator;

    if (indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }

    this._element = this._indicator = this._indicatorContent = null!;
    this._foundation.destroy();
    this._destroyed = true;
  }

  /** Creates and appends the indicator element. */
  private _createIndicator(document: Document) {
    this._indicator = document.createElement('span');
    this._indicatorContent = document.createElement('span');

    this._indicator.className = 'mdc-tab-indicator';
    this._indicatorContent.className = 'mdc-tab-indicator__content' +
        ' mdc-tab-indicator__content--underline';

    this._indicator.appendChild(this._indicatorContent);
    this._appendIndicator();
  }

  /**
   * Appends the indicator to the tab host element or content, depending on whether
   * the indicator should fit to content.
   */
  private _appendIndicator() {
    if (!this._indicator) {
      throw Error('Ink bar indicator has not been created and cannot be appended');
    }

    const parentElement = this._fitToContent ?
        this._element.querySelector('.mdc-tab__content') :
        this._element;

    if (!parentElement) {
      throw Error('Missing element to append the ink bar indicator');
    }

    parentElement.appendChild(this._indicator);
  }
}
