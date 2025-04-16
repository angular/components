/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  InjectionToken,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  numberAttribute,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {MatOption, ThemePalette} from '../core';
import {MatSelect} from '../select';
import {MatIconButton} from '../button';
import {MatTooltip} from '../tooltip';
import {MatFormField, MatFormFieldAppearance} from '../form-field';
import {Observable, ReplaySubject, Subscription} from 'rxjs';
import {MatPaginatorIntl} from './paginator-intl';

/** The default page size if there is no page size and there are no provided page size options. */
const DEFAULT_PAGE_SIZE = 50;

/** Object that can used to configure the underlying `MatSelect` inside a `MatPaginator`. */
export interface MatPaginatorSelectConfig {
  /** Whether to center the active option over the trigger. */
  disableOptionCentering?: boolean;

  /** Classes to be passed to the select panel. */
  panelClass?: string | string[] | Set<string> | {[key: string]: any};
}

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

  /** The current page size. */
  pageSize: number;

  /** The current total number of items being paged. */
  length: number;
}

// Note that while `MatPaginatorDefaultOptions` and `MAT_PAGINATOR_DEFAULT_OPTIONS` are identical
// between the MDC and non-MDC versions, we have to duplicate them, because the type of
// `formFieldAppearance` is narrower in the MDC version.

/** Object that can be used to configure the default options for the paginator module. */
export interface MatPaginatorDefaultOptions {
  /** Number of items to display on a page. By default set to 50. */
  pageSize?: number;

  /** The set of provided page size options to display to the user. */
  pageSizeOptions?: number[];

  /** Whether to hide the page size selection UI from the user. */
  hidePageSize?: boolean;

  /** Whether to show the first/last buttons UI to the user. */
  showFirstLastButtons?: boolean;

  /** The default form-field appearance to apply to the page size options selector. */
  formFieldAppearance?: MatFormFieldAppearance;
}

/** Injection token that can be used to provide the default options for the paginator module. */
export const MAT_PAGINATOR_DEFAULT_OPTIONS = new InjectionToken<MatPaginatorDefaultOptions>(
  'MAT_PAGINATOR_DEFAULT_OPTIONS',
);

/**
 * Component to provide navigation between paged information. Displays the size of the current
 * page, user-selectable options to change that size, what items are being shown, and
 * navigational button to go to the previous or next page.
 */
@Component({
  selector: 'mat-paginator',
  exportAs: 'matPaginator',
  templateUrl: 'paginator.html',
  styleUrl: 'paginator.css',
  host: {
    'class': 'mat-mdc-paginator',
    'role': 'group',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MatFormField, MatSelect, MatOption, MatIconButton, MatTooltip],
})
export class MatPaginator implements OnInit, OnDestroy {
  _intl = inject(MatPaginatorIntl);
  private _changeDetectorRef = inject(ChangeDetectorRef);

  /** If set, styles the "page size" form field with the designated style. */
  _formFieldAppearance?: MatFormFieldAppearance;

  /** ID for the DOM node containing the paginator's items per page label. */
  readonly _pageSizeLabelId = inject(_IdGenerator).getId('mat-paginator-page-size-label-');

  private _intlChanges: Subscription;
  private _isInitialized = false;
  private _initializedStream = new ReplaySubject<void>(1);

  /**
   * Theme color of the underlying form controls. This API is supported in M2
   * themes only,it has no effect in M3 themes. For color customization in M3, see https://material.angular.io/components/paginator/styling.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.io/guide/material-2-theming#optional-add-backwards-compatibility-styles-for-color-variants
   */
  @Input() color: ThemePalette;

  /** The zero-based page index of the displayed list of items. Defaulted to 0. */
  @Input({transform: numberAttribute})
  get pageIndex(): number {
    return this._pageIndex;
  }
  set pageIndex(value: number) {
    this._navigate(value);
  }
  private _pageIndex = 0;

  /** The length of the total number of items that are being paginated. Defaulted to 0. */
  @Input({transform: numberAttribute})
  get length(): number {
    return this._length;
  }
  set length(value: number) {
    this._length = value || 0;
    this._changeDetectorRef.markForCheck();
  }
  private _length = 0;

  /** Number of items to display on a page. By default set to 50. */
  @Input({transform: numberAttribute})
  get pageSize(): number {
    return this._pageSize;
  }
  set pageSize(value: number) {
    this._pageSize = Math.max(value || 0, 0);
    this._updateDisplayedPageSizeOptions();
  }
  private _pageSize: number;

  /** The set of provided page size options to display to the user. */
  @Input()
  get pageSizeOptions(): number[] {
    return this._pageSizeOptions;
  }
  set pageSizeOptions(value: number[] | readonly number[]) {
    this._pageSizeOptions = (value || ([] as number[])).map(p => numberAttribute(p, 0));
    this._updateDisplayedPageSizeOptions();
  }
  private _pageSizeOptions: number[] = [];

  /** Whether to hide the page size selection UI from the user. */
  @Input({transform: booleanAttribute})
  hidePageSize: boolean = false;

  /** Whether to show the first/last buttons UI to the user. */
  @Input({transform: booleanAttribute})
  showFirstLastButtons: boolean = false;

  /** Used to configure the underlying `MatSelect` inside the paginator. */
  @Input() selectConfig: MatPaginatorSelectConfig = {};

  /** Whether the paginator is disabled. */
  @Input({transform: booleanAttribute})
  disabled: boolean = false;

  /** Event emitted when the paginator changes the page size or page index. */
  @Output() readonly page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  /** Displayed set of page size options. Will be sorted and include current page size. */
  _displayedPageSizeOptions: number[];

  /** Emits when the paginator is initialized. */
  initialized: Observable<void> = this._initializedStream;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const _intl = this._intl;
    const defaults = inject<MatPaginatorDefaultOptions>(MAT_PAGINATOR_DEFAULT_OPTIONS, {
      optional: true,
    });

    this._intlChanges = _intl.changes.subscribe(() => this._changeDetectorRef.markForCheck());

    if (defaults) {
      const {pageSize, pageSizeOptions, hidePageSize, showFirstLastButtons} = defaults;

      if (pageSize != null) {
        this._pageSize = pageSize;
      }

      if (pageSizeOptions != null) {
        this._pageSizeOptions = pageSizeOptions;
      }

      if (hidePageSize != null) {
        this.hidePageSize = hidePageSize;
      }

      if (showFirstLastButtons != null) {
        this.showFirstLastButtons = showFirstLastButtons;
      }
    }

    this._formFieldAppearance = defaults?.formFieldAppearance || 'outline';
  }

  ngOnInit() {
    this._isInitialized = true;
    this._updateDisplayedPageSizeOptions();
    this._initializedStream.next();
  }

  ngOnDestroy() {
    this._initializedStream.complete();
    this._intlChanges.unsubscribe();
  }

  /** Advances to the next page if it exists. */
  nextPage(): void {
    if (this.hasNextPage()) {
      this._navigate(this.pageIndex + 1);
    }
  }

  /** Move back to the previous page if it exists. */
  previousPage(): void {
    if (this.hasPreviousPage()) {
      this._navigate(this.pageIndex - 1);
    }
  }

  /** Move to the first page if not already there. */
  firstPage(): void {
    // hasPreviousPage being false implies at the start
    if (this.hasPreviousPage()) {
      this._navigate(0);
    }
  }

  /** Move to the last page if not already there. */
  lastPage(): void {
    // hasNextPage being false implies at the end
    if (this.hasNextPage()) {
      this._navigate(this.getNumberOfPages() - 1);
    }
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
    this.pageSize = pageSize;
    this.pageIndex = Math.floor(startIndex / pageSize) || 0;
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
    if (!this._isInitialized) {
      return;
    }

    // If no page size is provided, use the first page size option or the default page size.
    if (!this.pageSize) {
      this._pageSize =
        this.pageSizeOptions.length != 0 ? this.pageSizeOptions[0] : DEFAULT_PAGE_SIZE;
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
      length: this.length,
    });
  }

  /** Navigates to a specific page index. */
  private _navigate(index: number) {
    if (index !== this.pageIndex) {
      const previousPageIndex = this._pageIndex;
      this._pageIndex = Math.max(index || 0, 0);
      this._changeDetectorRef.markForCheck();
      this._emitPageEvent(previousPageIndex);
    }
  }

  /**
   * Callback invoked when one of the navigation buttons is called.
   * @param targetIndex Index to which the paginator should navigate.
   * @param isDisabled Whether the button is disabled.
   */
  protected _buttonClicked(targetIndex: number, isDisabled: boolean) {
    // Note that normally disabled buttons won't dispatch the click event, but the paginator ones
    // do, because we're using `disabledInteractive` to allow them to be focusable. We need to
    // check here to avoid the navigation.
    if (!isDisabled) {
      this._navigate(targetIndex);
    }
  }
}
