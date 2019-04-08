/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceNumberProperty, coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {Subscription} from 'rxjs';
import {MatPaginatorIntl} from './paginator-intl';
import {
  HasInitialized,
  HasInitializedCtor,
  mixinInitialized,
  ThemePalette,
  mixinDisabled,
  CanDisableCtor,
  CanDisable,
} from '@angular/material/core';

/** The default page size if there is no page size and there are no provided page size options. */
const DEFAULT_PAGE_SIZE = 50;

/**
 * Change event object that is emitted when the user selects a
 * different page size or navigates to another page.
 */
export class PageEvent {
  /** The current page index. */
  pageIndex: number;

  /**
   * Index of the page that was selected previously.
   * @breaking-change 8.0.0 To be made into a required property.
   */
  previousPageIndex?: number;

  /** The current page size */
  pageSize: number;

  /** The current total number of items being paged */
  length: number;
}

// Boilerplate for applying mixins to MatPaginator.
/** @docs-private */
export class MatPaginatorBase {}
export const _MatPaginatorBase: CanDisableCtor & HasInitializedCtor & typeof MatPaginatorBase =
    mixinDisabled(mixinInitialized(MatPaginatorBase));

/**
 * Component to provide navigation between paged information. Displays the size of the current
 * page, user-selectable options to change that size, what items are being shown, and
 * navigational button to go to the previous or next page.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-paginator',
  exportAs: 'matPaginator',
  templateUrl: 'paginator.html',
  styleUrls: ['paginator.css'],
  inputs: ['disabled'],
  host: {
    'class': 'mat-paginator',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatPaginator extends _MatPaginatorBase implements OnInit, OnDestroy, CanDisable,
  HasInitialized {
  private _initialized: boolean;
  private _intlChanges: Subscription;

  /** Theme color to be used for the underlying form controls. */
  @Input() color: ThemePalette;

  /** The zero-based page index of the displayed list of items. Defaulted to 0. */
  @Input()
  get pageIndex(): number { return this._pageIndex; }
  set pageIndex(value: number) {
    this._pageIndex = Math.max(coerceNumberProperty(value), 0);
    this._changeDetectorRef.markForCheck();
  }
  private _pageIndex = 0;

  /** The length of the total number of items that are being paginated. Defaulted to 0. */
  @Input()
  get length(): number { return this._length; }
  set length(value: number) {
    this._length = coerceNumberProperty(value);
    this._changeDetectorRef.markForCheck();
  }
  private _length = 0;

  /** Number of items to display on a page. By default set to 50. */
  @Input()
  get pageSize(): number { return this._pageSize; }
  set pageSize(value: number) {
    this._pageSize = Math.max(coerceNumberProperty(value), 0);
    this._updateDisplayedPageSizeOptions();
  }
  private _pageSize: number;

  /** The set of provided page size options to display to the user. */
  @Input()
  get pageSizeOptions(): number[] { return this._pageSizeOptions; }
  set pageSizeOptions(value: number[]) {
    this._pageSizeOptions = (value || []).map(p => coerceNumberProperty(p));
    this._updateDisplayedPageSizeOptions();
  }
  private _pageSizeOptions: number[] = [];

  /** Whether to hide the page size selection UI from the user. */
  @Input()
  get hidePageSize(): boolean { return this._hidePageSize; }
  set hidePageSize(value: boolean) {
    this._hidePageSize = coerceBooleanProperty(value);
  }
  private _hidePageSize = false;


  /** Whether to show the first/last buttons UI to the user. */
  @Input()
  get showFirstLastButtons(): boolean { return this._showFirstLastButtons; }
  set showFirstLastButtons(value: boolean) {
    this._showFirstLastButtons = coerceBooleanProperty(value);
  }
  private _showFirstLastButtons = false;

  /** Whether to show the page number UI to the user. */
  @Input()
  get showPageNumbers(): boolean { return this._showPageNumbers; }
  set showPageNumbers(value: boolean) {
    this._showPageNumbers = coerceBooleanProperty(value);
  }
  private _showPageNumbers = false;

  /**
   * Total count of page numbers to display, if shown.  Default to 3.
   * Even numbers are incremented to allow for equal previous and next sections, plus current page
   */
  @Input()
  get pageNumberCount(): number { return this._pageNumberCount; }
  set pageNumberCount(value: number) {
    this._pageNumberCount = Math.max(coerceNumberProperty(value), 0);
    this._updateDisplayedPageSizeOptions();
  }
  private _pageNumberCount: number = 3;

  /** Event emitted when the paginator changes the page size or page index. */
  @Output() readonly page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  /** Displayed set of page size options. Will be sorted and include current page size. */
  _displayedPageSizeOptions: number[];

  constructor(public _intl: MatPaginatorIntl,
              private _changeDetectorRef: ChangeDetectorRef) {
    super();
    this._intlChanges = _intl.changes.subscribe(() => this._changeDetectorRef.markForCheck());
  }

  ngOnInit() {
    this._initialized = true;
    this._updateDisplayedPageSizeOptions();
    this._markInitialized();
  }

  ngOnDestroy() {
    this._intlChanges.unsubscribe();
  }

  /** Advances to the next page if it exists. */
  nextPage(): void {
    if (!this.hasNextPage()) { return; }

    const previousPageIndex = this.pageIndex;
    this.pageIndex++;
    this._emitPageEvent(previousPageIndex);
  }

  /** Move back to the previous page if it exists. */
  previousPage(): void {
    if (!this.hasPreviousPage()) { return; }

    const previousPageIndex = this.pageIndex;
    this.pageIndex--;
    this._emitPageEvent(previousPageIndex);
  }

  /** Move to the first page if not already there. */
  firstPage(): void {
    // hasPreviousPage being false implies at the start
    if (!this.hasPreviousPage()) { return; }

    const previousPageIndex = this.pageIndex;
    this.pageIndex = 0;
    this._emitPageEvent(previousPageIndex);
  }

  /** Move to the last page if not already there. */
  lastPage(): void {
    // hasNextPage being false implies at the end
    if (!this.hasNextPage()) { return; }

    const previousPageIndex = this.pageIndex;
    this.pageIndex = this.getNumberOfPages() - 1;
    this._emitPageEvent(previousPageIndex);
  }

  /** Whether there is a previous page. */
  hasPreviousPage(): boolean {
    return this.pageIndex >= 1 && this.pageSize != 0;
  }

  /** Whether there is a next page. */
  hasNextPage(): boolean {
    const maxPageIndex = this.getNumberOfPages() - 1;
    return this.pageIndex < maxPageIndex && this.pageSize != 0;
  }

  /** Determines currently selected page number to display */
  currentPageNumber() {
    return this.pageIndex + 1;
  }

  /** Navigate to selected page number, if it exists. */
  clickPageNumber(nextPage: number) {
    if (nextPage > (this.getNumberOfPages()) || nextPage < 1) {
      return;
    }
    const previousPageIndex = this.pageIndex;
    this.pageIndex = nextPage - 1;
    this._emitPageEvent(previousPageIndex);
  }

  /** Determines list of 'previous' page numbers to display */
  previousPageNumbers() {
    const previousPageNumbers = [];
    const previousPageCount = Math.floor(this._pageNumberCount / 2)
                            + Math.floor(this._pageNumberCount / 2) - this.nextPageNumbers().length;
    for (let i = 1; i <= previousPageCount; i++) {
      const prev = this.currentPageNumber() - i;
      if (prev > 0) {
        previousPageNumbers.push(prev);
      }
    }
    previousPageNumbers.reverse();
    return previousPageNumbers;
  }

  /** Determines list of 'next' page numbers to display */
  nextPageNumbers() {
    const nextPageNumbers = [];
    const nextPageCount = Math.floor(this._pageNumberCount / 2) <= this.pageIndex
      ? Math.floor(this._pageNumberCount / 2) + 1 : this._pageNumberCount - this.pageIndex;
    for (let i = 1; i < nextPageCount; i++) {
      const next = this.currentPageNumber() + i;
      if (next <= Math.ceil(this.length / this.pageSize)) {
        nextPageNumbers.push(next);
      }
    }
    return nextPageNumbers;
  }

  /** Calculate the number of pages */
  getNumberOfPages(): number {
    if (!this.pageSize) {
      return 0;
    }

    return Math.ceil(this.length / this.pageSize);
  }


  /**
   * Changes the page size so that the first item displayed on the page will still be
   * displayed using the new page size.
   *
   * For example, if the page size is 10 and on the second page (items indexed 10-19) then
   * switching so that the page size is 5 will set the third page as the current page so
   * that the 10th item will still be displayed.
   */
  _changePageSize(pageSize: number) {
    // Current page needs to be updated to reflect the new page size. Navigate to the page
    // containing the previous page's first item.
    const startIndex = this.pageIndex * this.pageSize;
    const previousPageIndex = this.pageIndex;

    this.pageIndex = Math.floor(startIndex / pageSize) || 0;
    this.pageSize = pageSize;
    this._emitPageEvent(previousPageIndex);
  }

  /** Checks whether the buttons for going forwards should be disabled. */
  _nextButtonsDisabled() {
    return this.disabled || !this.hasNextPage();
  }

  /** Checks whether the buttons for going backwards should be disabled. */
  _previousButtonsDisabled() {
    return this.disabled || !this.hasPreviousPage();
  }

  /**
   * Updates the list of page size options to display to the user. Includes making sure that
   * the page size is an option and that the list is sorted.
   */
  private _updateDisplayedPageSizeOptions() {
    if (!this._initialized) { return; }

    // If no page size is provided, use the first page size option or the default page size.
    if (!this.pageSize) {
      this._pageSize = this.pageSizeOptions.length != 0 ?
          this.pageSizeOptions[0] :
          DEFAULT_PAGE_SIZE;
    }

    this._displayedPageSizeOptions = this.pageSizeOptions.slice();

    if (this._displayedPageSizeOptions.indexOf(this.pageSize) === -1) {
      this._displayedPageSizeOptions.push(this.pageSize);
    }

    // Sort the numbers using a number-specific sort function.
    this._displayedPageSizeOptions.sort((a, b) => a - b);
    this._changeDetectorRef.markForCheck();
  }

  /** Emits an event notifying that a change of the paginator's properties has been triggered. */
  private _emitPageEvent(previousPageIndex: number) {
    this.page.emit({
      previousPageIndex,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      length: this.length
    });
  }
}
