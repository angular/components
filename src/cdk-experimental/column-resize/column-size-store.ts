/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

/**
 * Can be provided by the host application to enable persistence of column resize state.
 */
@Injectable()
export abstract class ColumnSizeStore {
  /** Returns the persisted size of the specified column in the specified table. */
  abstract getSize(tableId: string, columnId: string): Observable<number | null> | null;

  /** Persists the size of the specified column in the specified table. */
  abstract setSize(tableId: string, columnId: string, sizePx: number): void;
}
