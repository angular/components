/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, InjectionToken} from '@angular/core';
import {CdkTable} from '@angular/cdk/table/table';
import {DOCUMENT} from '@angular/common';

/** Interface for a service that constructs the DOM structure for a {@link CdkTable}. */
export interface _TableLayoutStrategy {
  /** Constructs the DOM structure for a native table. */
  getNativeLayout(table: CdkTable<any>): DocumentFragment;
  /** Constructs the DOM structure for a flex table. */
  getFlexLayout(table: CdkTable<any>): DocumentFragment;
}

/** Injection token for {@link _TableLayoutStrategy}. */
export const _TABLE_LAYOUT_STRATEGY =
    new InjectionToken<_TableLayoutStrategy>('_TableLayoutStrategy');


export class _DefaultTableLayoutStrategy implements _TableLayoutStrategy {
  private readonly _document: Document;

  constructor(@Inject(DOCUMENT) document: any) {
    this._document = document;
  }

  getNativeLayout(table: CdkTable<any>): DocumentFragment {
    const documentFragment = this._document.createDocumentFragment();
    const sections = [
      {tag: 'thead', outlets: [table._headerRowOutlet]},
      {tag: 'tbody', outlets: [table._rowOutlet, table._noDataRowOutlet]},
      {tag: 'tfoot', outlets: [table._footerRowOutlet]},
    ];

    for (const section of sections) {
      const element = this._document.createElement(section.tag);
      element.setAttribute('role', 'rowgroup');

      for (const outlet of section.outlets) {
        element.appendChild(outlet.elementRef.nativeElement);
      }

      documentFragment.appendChild(element);
    }

    return documentFragment;
  }

  getFlexLayout(table: CdkTable<any>): DocumentFragment {
    return this._document.createDocumentFragment();
  }
}
