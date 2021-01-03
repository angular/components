/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter, Inject, Injectable, Optional, OnDestroy} from '@angular/core';
import {DIR_DOCUMENT} from './dir-document-token';

/** Possible values for the layout direction of a node. */
export type Direction = 'ltr' | 'rtl';


/**
 * The directionality (LTR / RTL) context for the application (or a subtree of it).
 * Exposes the current direction and a stream of direction changes.
 */
@Injectable({providedIn: 'root'})
export class Directionality implements OnDestroy {
  protected _isInitialized: boolean;

  /** Current layout direction of the element. */
  get value(): Direction { return this.dir; }

  /** Stream that emits whenever the 'ltr' / 'rtl' state changes. */
  readonly change = new EventEmitter<Direction>();

  /** @docs-private */
  get dir(): Direction { return this._dir; }
  set dir(value: Direction) {
    const old = this._dir;
    const normalizedValue = value ? value.toLowerCase() : value;

    this._rawDir = value;
    this._dir = (normalizedValue === 'ltr' || normalizedValue === 'rtl') ? normalizedValue : 'ltr';

    if (old !== this._dir && this._isInitialized) {
      this.change.emit(this._dir);
    }
  }
  private _dir: Direction = 'ltr';

  /** Direction as passed in by the consumer. */
  _rawDir: string;

  constructor(@Optional() @Inject(DIR_DOCUMENT) _document?: any) {
    if (_document) {
      // TODO: handle 'auto' value -
      // We still need to account for dir="auto".
      // It looks like HTMLElemenet.dir is also "auto" when that's set to the attribute,
      // but getComputedStyle return either "ltr" or "rtl". avoiding getComputedStyle for now
      const bodyDir = _document.body ? _document.body.dir : null;
      const htmlDir = _document.documentElement ? _document.documentElement.dir : null;
      const value = bodyDir || htmlDir;
      this.dir = (value === 'ltr' || value === 'rtl') ? value : 'ltr';
    }

    this._isInitialized = true;
  }

  ngOnDestroy() {
    this.change.complete();
  }
}
