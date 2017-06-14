import {Injectable} from '@angular/core';


/** Paginator labels that require internationalization. */
@Injectable()
export class MdPaginatorIntl {
  /** A label for the page size selector. */
  itemsPerPageLabel = 'Items per page:';

  /** A label for the button that increments the current page. */
  incrementLabel = 'Next page';

  /** A label for the button that decrements the current page. */
  decrementLabel = 'Previous page';

  getRangeLabel(currentPage: number, pageSize: number, listLength: number) {
    const startIndex = currentPage * pageSize;
    const endIndex = Math.min(startIndex + pageSize, listLength);

    return `${currentPage * pageSize + 1} - ${endIndex} of ${listLength}`;
  }
}
