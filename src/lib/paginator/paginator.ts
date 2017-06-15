/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
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

/**
 * Component to provide navigation between paged information. Displays the length of the current
 * page, user-selectable options to change that length, what items are being shown, and
 * navigational button to go to the previous or next page.
 */
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
export class MdPaginator implements OnInit {
  private _initialized: boolean;

  /** The zero-based current page index of the displayed list of items. Defaulted to 0. */
  @Input() currentPageIndex: number = 0;

  /** The list length of the total number of items that are being paginated. Defaulted to 0. */
  @Input() listLength: number = 0;

  /** Number of items to display on a page. By default set to the first of page length option. */
  @Input()
  set pageLength(pageLength: number) {
    this._pageLength = pageLength;
    this._updateDisplayedPageLengthOptions();
  }
  get pageLength(): number { return this._pageLength; }
  _pageLength: number;

  /** The set of provided page length options to display to the user. */
  @Input()
  set pageLengthOptions(pageLengthOptions: number[]) {
    this._pageLengthOptions = pageLengthOptions;
    this._updateDisplayedPageLengthOptions();
  }
  get pageLengthOptions(): number[] { return this._pageLengthOptions; }
  _pageLengthOptions: number[] = [];

  /** Event emitted when the paginator changes the page length or current page index. */
  @Output() pageChange = new EventEmitter<PageChangeEvent>();

  /** Displayed set of page length options. Will be sorted and include current page length. */
  _displayedPageLengthOptions: number[];

  constructor(public _intl: MdPaginatorIntl) { }

  ngOnInit() {
    this._initialized = true;

    // If no page length or options have been provided, use the list length as the only option.
    // Otherwise if there is no page length but there are options, then use the first option.
    if (this.pageLength == undefined) {
      this.pageLength = this.pageLengthOptions.length != 0 ?
          this.pageLengthOptions[0] :
          this.listLength;
    }

    this._updateDisplayedPageLengthOptions();
  }

  /** Increments the current page index to the next page index if a next page exists. */
  navigateToNextPage() {
    if (!this.canNavigateToNextPage()) { return; }
    this.currentPageIndex++;
    this._sendPageEvent();
  }

  /** Decrements the current page index to the previous page index if a next page exists. */
  navigateToPreviousPage() {
    if (!this.canNavigateToPreviousPage()) { return; }
    this.currentPageIndex--;
    this._sendPageEvent();
  }

  /** Returns true if the user can go to the next page. */
  canNavigateToPreviousPage() {
    return (this.currentPageIndex - 1) >= 0 && this.pageLength != 0;
  }

  /** Returns true if the user can go to the next page. */
  canNavigateToNextPage() {
    const numberOfPages = Math.ceil(this.listLength / this.pageLength) - 1;
    return (this.currentPageIndex + 1) <= numberOfPages && this.pageLength != 0;
  }

  /**
   * Changes the current page length so that the first item displayed on the page will still be
   * displayed using the new page length.
   *
   * For example, if the page length is 10 and on the second page (items indexed 10-19) then
   * switching so that the page length is 5 will set the third page as the current page so
   * that the 10th item will still be displayed.
   */
  _changePageLength(pageLength: number) {
    // Current page needs to be updated to reflect the new page length. Navigate to the page
    // containing the previous page's first item.
    const startIndex = this.currentPageIndex * this.pageLength;
    this.currentPageIndex = Math.floor(startIndex / pageLength) || 0;

    this.pageLength = pageLength;
    this._sendPageEvent();
  }

  /**
   * Updates the list of page length options to display to the user. Includes making sure that
   * the current page length is an option and that the list is sorted.
   */
  private _updateDisplayedPageLengthOptions() {
    if (!this._initialized) { return; }

    this._displayedPageLengthOptions = this.pageLengthOptions.slice();
    if (this._displayedPageLengthOptions.indexOf(this.pageLength) == -1) {
      this._displayedPageLengthOptions.push(this.pageLength);
    }

    // Sort the numbers using a number-specific sort function.
    this._displayedPageLengthOptions.sort((a, b) => (a - b));
  }

  /** Emits an event notifying that a change of the paginator's properties has been triggered. */
  private _sendPageEvent() {
    this.pageChange.next({
      currentPageIndex: this.currentPageIndex,
      pageLength: this.pageLength,
      listLength: this.listLength
    });
  }
}
