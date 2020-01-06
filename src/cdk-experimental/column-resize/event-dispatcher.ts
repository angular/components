/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgZone} from '@angular/core';
import {combineLatest, MonoTypeOperatorFunction, Observable, Subject} from 'rxjs';
import {distinctUntilChanged, map, share, skip, startWith} from 'rxjs/operators';

import {_closest} from '@angular/cdk-experimental/popover-edit';

import {HEADER_ROW_SELECTOR} from './constants';

@Injectable()
export class HeaderRowEventDispatcher {
  readonly headerCellHovered = new Subject<Element|null>();

  // element refers to header row
  readonly overlayHandleActiveForCell = new Subject<Element|null>();

  constructor(private readonly _ngZone: NgZone) {}

  readonly headerCellHoveredDistinct = this.headerCellHovered.pipe(
      distinctUntilChanged(),
      share(),
  );

  readonly headerRowHoveredOrActiveDistinct = combineLatest(
      this.headerCellHoveredDistinct.pipe(
          map(cell => _closest(cell, HEADER_ROW_SELECTOR)),
          startWith(null),
          distinctUntilChanged(),
       ),
      this.overlayHandleActiveForCell.pipe(
          map(cell => _closest(cell, HEADER_ROW_SELECTOR)),
          startWith(null),
          distinctUntilChanged(),
      ),
  ).pipe(
      skip(1), // Ignore initial [null, null] emission.
      map(([hovered, active]) => active || hovered),
      distinctUntilChanged(),
      share(),
  );

  private readonly _headerRowHoveredOrActiveDistinctReenterZone =
      this.headerRowHoveredOrActiveDistinct.pipe(
          this._enterZone(),
          share(),
      );

  // Optimization: Share row events observable with subsequent callers.
  // At startup, calls will be sequential by row (and typically there's only one).
  private _lastSeenRow: Element|null = null;
  private _lastSeenRowHover: Observable<boolean>|null = null;

  resizeOverlayVisibleForHeaderRow(row: Element): Observable<boolean> {
    if (row !== this._lastSeenRow) {
      this._lastSeenRow = row;
      this._lastSeenRowHover = this._headerRowHoveredOrActiveDistinctReenterZone.pipe(
        map(hoveredRow => hoveredRow === row),
        distinctUntilChanged(),
        share(),
      );
    }

    return this._lastSeenRowHover!;
  }

  private _enterZone<T>(): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>) =>
        new Observable<T>((observer) => source.subscribe({
          next: (value) => this._ngZone.run(() => observer.next(value)),
          error: (err) => observer.error(err),
          complete: () => observer.complete()
        }));
  }
}
