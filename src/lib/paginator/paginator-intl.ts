/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

/**
 * Paginator labels that require internationalization. To modify the labels and text displayed,
 * extend this class with custom values and inject it as a custom provider.
 */
@Injectable()
export class MdPaginatorIntl {
  /** A label for the page size selector. */
  itemsPerPageLabel = 'Items per page:';

  /** A label for the button that increments the current page. */
  nextPageLabel = 'Next page';

  /** A label for the button that decrements the current page. */
  previousPageLabel = 'Previous page';

  /** A label for the range of items within the current page and the length of the whole list. */
  getRangeLabel(pageIndex: number, pageSize: number, length: number) {
    if (length == 0 || pageSize == 0) { return `0 of ${length}`; }

    length = Math.max(length, 0);

    const startIndex = pageIndex * pageSize;

    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;

    return `${startIndex + 1} - ${endIndex} of ${length}`;
  }
}
