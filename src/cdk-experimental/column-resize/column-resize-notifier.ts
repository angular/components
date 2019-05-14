/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

export interface ColumnSize {
  readonly columnId: string;
  readonly size: number;
}

export interface ColumnSizeAction extends ColumnSize {
  readonly completeImmediately?: boolean;
}

@Injectable()
export class ColumnResizeNotifierSource {
  readonly resizeCanceled = new Subject<ColumnSizeAction>();
  readonly resizeCompleted = new Subject<ColumnSize>();
  readonly triggerResize = new Subject<ColumnSizeAction>();
}

/** Service for triggering column resizes imperatively or being notified of them. */
@Injectable()
export class ColumnResizeNotifier {
  readonly resizeCompleted: Observable<ColumnSize> = this._source.resizeCompleted.asObservable();

  constructor(private readonly _source: ColumnResizeNotifierSource) {}

  resize(columnId: string, size: number): void {
    this._source.triggerResize.next({columnId, size, completeImmediately: true});
  }
}
