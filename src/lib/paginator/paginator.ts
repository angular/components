import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {MdPaginatorIntl} from './paginator-intl';
import {MATERIAL_COMPATIBILITY_MODE} from '../core';

/**
 * Change event object that is emitted when the user selects a
 * different page length or navigates to another page.
 */
export class PageChangeEvent {
  currentPageIndex: number;
  pageLength: number;
  listLength: number;
}

@Component({
  moduleId: module.id,
  selector: 'md-paginator, mat-paginator',
  templateUrl: 'paginator.html',
  styleUrls: ['paginator.css'],
  host: {
    'class': 'mat-paginator',
  },
  providers: [
    {provide: MATERIAL_COMPATIBILITY_MODE, useValue: false}
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MdPaginator {
  /** The zero-based current page index of the displayed list of items. */
  @Input() currentPageIndex: number;

  /** The number of items to display on each page. */
  @Input() pageLength: number;

  /** The list length of the total number of items that are being paginated. */
  @Input() listLength: number;

  /** The set of options from which the user can select to change the page length. */
  @Input() pageLengthOptions: number[];

  /** Event emitted when the paginator changes the page length or current page index. */
  @Output() pageChange = new EventEmitter<PageChangeEvent>();

  constructor(public _intl: MdPaginatorIntl) { }

  incrementPage(increment: number) {
    if (this._canIncrementPage(increment)) {
      this.currentPageIndex += increment;
      this._sendPageEvent();
    }
  }

  _changePageLength(pageLength: number) {
    // Current page needs to be updated to reflect the new page length. Navigate to the page
    // containing the previous page's first item.
    const startIndex = this.currentPageIndex * this.pageLength;
    this.currentPageIndex = Math.floor(startIndex / pageLength);

    this.pageLength = pageLength;
    this._sendPageEvent();
  }

  private _canIncrementPage(increment: number) {
    const incrementedPage = this.currentPageIndex + increment;
    const maxPages = Math.ceil(this.listLength / this.pageLength) - 1;

    return incrementedPage >= 0 && incrementedPage <= maxPages;
  }

  private _sendPageEvent() {
    this.pageChange.next({
      currentPageIndex: this.currentPageIndex,
      pageLength: this.pageLength,
      listLength: this.listLength
    });
  }
}
