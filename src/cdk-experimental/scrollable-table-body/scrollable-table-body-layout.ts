/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Inject, Injectable, Input} from '@angular/core';
import {CdkTable} from '@angular/cdk/table/table';
import {DOCUMENT} from '@angular/common';
import {
  _TABLE_LAYOUT_STRATEGY,
  _TableLayoutStrategy,
  _DefaultTableLayoutStrategy,
} from '@angular/cdk/table/table-layout-strategy';

/**
 * A {@link _TableLayoutStrategy} that enables scrollable body content for flex tables.
 */
@Injectable()
class ScrollableTableBodyLayoutStrategy implements _TableLayoutStrategy {
  private defaultLayout: _DefaultTableLayoutStrategy;
  private _pendingMaxHeight = 'none';
  private _scrollViewport?: HTMLElement;
  readonly headerCssClass = 'cdk-table-scrollable-table-header';
  readonly bodyCssClass = 'cdk-table-scrollable-table-body';
  readonly footerCssClass = 'cdk-table-scrollable-table-footer';

  constructor(@Inject(DOCUMENT) private readonly _document: any) {
    this.defaultLayout = new _DefaultTableLayoutStrategy(this._document);
  }

  /**
   * Returns the DOM structure for a native table. Scrollable body content is not supported for
   * native tables. Return `null` to use the default {@link CdkTable} native table layout.
   */
  getNativeLayout(table: CdkTable<unknown>): DocumentFragment {
    return this.defaultLayout.getNativeLayout(table);
  }

  /**
   * Returns the DOM structure for a flex table with scrollable body content. Each row outlet
   * (header, body, footer) is wrapped in a separate container. The specified max height is applied
   * to the body row outlet to make its content scrollable.
   */
  getFlexLayout(table: CdkTable<unknown>): DocumentFragment {
    const documentFragment = this._document.createDocumentFragment();
    const sections = [
      {selector: this.headerCssClass, outlets: [table._headerRowOutlet]},
      {selector: this.bodyCssClass, outlets: [table._rowOutlet, table._noDataRowOutlet]},
      {selector: this.footerCssClass, outlets: [table._footerRowOutlet]},
    ];

    for (const section of sections) {
      const element = this._document.createElement('div');
      element.classList.add(section.selector);
      for (const outlet of section.outlets) {
        element.appendChild(outlet.elementRef.nativeElement);
      }

      documentFragment.appendChild(element);
    }

    this._scrollViewport = documentFragment.querySelector(`.${this.bodyCssClass}`);
    this._scrollViewport!.style.overflow = 'auto';
    this._applyMaxHeight(this._scrollViewport!, this._pendingMaxHeight);

    return documentFragment;
  }

  /**
   * Show a scroll bar if the table's body exceeds this height. The height may be specified with
   * any valid CSS unit of measurement.
   */
  setMaxHeight(v: string) {
    this._pendingMaxHeight = v;
    if (this._scrollViewport) {
      this._applyMaxHeight(this._scrollViewport, v);
    }
  }

  private _applyMaxHeight(el: HTMLElement, maxHeight: string) {
    el.style.maxHeight = maxHeight;
  }
}

/** A directive that enables scrollable body content for flex tables. */
@Directive({
  selector: 'cdk-table[scrollableBody], mat-table[scrollableBody]',
  providers: [
    {provide: _TABLE_LAYOUT_STRATEGY, useClass: ScrollableTableBodyLayoutStrategy},
  ]
})
export class CdkScrollableTableBody {
  /**
   * Show a scroll bar if the table's body exceeds this height. The height may be specified with
   * any valid CSS unit of measurement.
   */
  @Input('scrollableBody')
  get maxHeight() {
    return this._maxHeight;
  }
  set maxHeight(v: string) {
    this._maxHeight = v;
    this._layoutStrategy.setMaxHeight(v);
  }
  private _maxHeight = '';

  constructor(@Inject(_TABLE_LAYOUT_STRATEGY)
              private readonly _layoutStrategy: ScrollableTableBodyLayoutStrategy) {
  }
}
