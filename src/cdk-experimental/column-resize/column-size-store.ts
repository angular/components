/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

/**
 * Can be provided by the host application to enable persistence of column resize state.
 */
@Injectable()
export abstract class ColumnSizeStore {
  abstract getSize(tableId: string, columnId: string): number;
  abstract setSize(tableId: string, columnId: string): void;
}
