/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClientArrayTableDataSource} from './table-data-source';

export * from './table-module';
export * from './cell';
export * from './table';
export * from './row';
export * from './table-data-source';

/**
 * @deprecated Use `ClientArrayTableDataSource` instead.
 * @breaking-change 9.0.0
 */
// tslint:disable-next-line:variable-name
export const MatTableDataSource = ClientArrayTableDataSource;
