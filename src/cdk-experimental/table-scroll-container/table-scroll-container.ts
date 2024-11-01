/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CSP_NONCE, Directive, ElementRef, OnDestroy, OnInit, inject} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {DOCUMENT} from '@angular/common';
import {Directionality} from '@angular/cdk/bidi';
import {_getShadowRoot} from '@angular/cdk/platform';
import {
  STICKY_POSITIONING_LISTENER,
  StickyPositioningListener,
  StickySize,
  StickyUpdate,
} from '@angular/cdk/table';

/**
 * Applies styles to the host element that make its scrollbars match up with
 * the non-sticky scrollable portions of the CdkTable contained within.
 *
 * This visual effect only works in Webkit and Blink based browsers (eg Chrome,
 * Safari, Edge). Other browsers such as Firefox will gracefully degrade to
 * normal scrollbar appearance.
 * Further note: These styles have no effect when the browser is using OS-default
 * scrollbars. The easiest way to force them into custom mode is to specify width
 * and height for the scrollbar and thumb.
 */
@Directive({
  selector: '[cdkTableScrollContainer]',
  host: {
    'class': 'cdk-table-scroll-container',
  },
  providers: [{provide: STICKY_POSITIONING_LISTENER, useExisting: CdkTableScrollContainer}],
})
export class CdkTableScrollContainer implements StickyPositioningListener, OnDestroy, OnInit {
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _document = inject<Document>(DOCUMENT);
  private readonly _directionality = inject(Directionality, {optional: true});
  private readonly _nonce = inject(CSP_NONCE, {optional: true});

  private readonly _uniqueClassName = inject(_IdGenerator).getId('cdk-table-scroll-container-');
  private _styleRoot!: Node;
  private _styleElement?: HTMLStyleElement;

  /** The most recent sticky column size values from the CdkTable. */
  private _startSizes: StickySize[] = [];
  private _endSizes: StickySize[] = [];
  private _headerSizes: StickySize[] = [];
  private _footerSizes: StickySize[] = [];

  ngOnInit() {
    this._elementRef.nativeElement.classList.add(this._uniqueClassName);
    this._styleRoot = _getShadowRoot(this._elementRef.nativeElement) ?? this._document.head;
  }

  ngOnDestroy(): void {
    this._styleElement?.remove();
    this._styleElement = undefined;
  }

  stickyColumnsUpdated({sizes}: StickyUpdate): void {
    this._startSizes = sizes;
    this._updateScrollbar();
  }

  stickyEndColumnsUpdated({sizes}: StickyUpdate): void {
    this._endSizes = sizes;
    this._updateScrollbar();
  }

  stickyHeaderRowsUpdated({sizes}: StickyUpdate): void {
    this._headerSizes = sizes;
    this._updateScrollbar();
  }

  stickyFooterRowsUpdated({sizes}: StickyUpdate): void {
    this._footerSizes = sizes;
    this._updateScrollbar();
  }

  /**
   * Set padding on the scrollbar track based on the sticky states from CdkTable.
   */
  private _updateScrollbar(): void {
    const topMargin = computeMargin(this._headerSizes);
    const bottomMargin = computeMargin(this._footerSizes);
    const startMargin = computeMargin(this._startSizes);
    const endMargin = computeMargin(this._endSizes);

    if (topMargin === 0 && bottomMargin === 0 && startMargin === 0 && endMargin === 0) {
      this._clearCss();
      return;
    }

    const direction = this._directionality ? this._directionality.value : 'ltr';
    const leftMargin = direction === 'rtl' ? endMargin : startMargin;
    const rightMargin = direction === 'rtl' ? startMargin : endMargin;

    this._applyCss(`${topMargin}px ${rightMargin}px ${bottomMargin}px ${leftMargin}px`);
  }

  /** Gets the stylesheet for the scrollbar styles and creates it if need be. */
  private _getStyleSheet(): CSSStyleSheet {
    if (!this._styleElement) {
      this._styleElement = this._document.createElement('style');

      if (this._nonce) {
        this._styleElement.setAttribute('nonce', this._nonce);
      }

      this._styleRoot.appendChild(this._styleElement);
    }

    return this._styleElement.sheet as CSSStyleSheet;
  }

  /** Updates the stylesheet with the specified scrollbar style. */
  private _applyCss(value: string) {
    this._clearCss();

    const selector = `.${this._uniqueClassName}::-webkit-scrollbar-track`;
    this._getStyleSheet().insertRule(`${selector} {margin: ${value}}`, 0);
  }

  private _clearCss() {
    const styleSheet = this._getStyleSheet();
    if (styleSheet.cssRules.length > 0) {
      styleSheet.deleteRule(0);
    }
  }
}

function computeMargin(sizes: (number | null | undefined)[]): number {
  let margin = 0;
  for (const size of sizes) {
    if (size == null) {
      break;
    }
    margin += size;
  }
  return margin;
}
