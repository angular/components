/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  DateAdapter,
  MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER,
  MatDateSelectionModel,
  MatSingleDateSelectionModel
} from '@angular/material/core';
import {Subscription} from 'rxjs';
import {take} from 'rxjs/operators';

/**
 * Extra CSS classes that can be associated with a calendar cell.
 */
export type MatCalendarCellCssClasses = string | string[] | Set<string> | {[key: string]: any};

/**
 * An internal class that represents the data corresponding to a single calendar cell.
 * @docs-private
 * @breaking-change 9.0.0 remove generic default type
 */
export class MatCalendarCell<D = unknown> {
  constructor(
      /** The range of dates represented by this cell (inclusive). */
      public range: { start: D, end: D },
      /** The text value to display in the cell. */
      public displayValue: string,
      /** The aria-label to use for the cell. */
      public ariaLabel: string,
      /** Whether the cell is enabled. */
      public enabled: boolean,
      /** Optional CSS classes to include on the DOM element for this cell. */
      public cssClasses?: MatCalendarCellCssClasses) {}
}



/**
 * An internal component used to display calendar data in a table.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: '[mat-calendar-body]',
  templateUrl: 'calendar-body.html',
  styleUrls: ['calendar-body.css'],
  host: {
    'class': 'mat-calendar-body',
    'role': 'grid',
    'aria-readonly': 'true'
  },
  exportAs: 'matCalendarBody',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER],
})
// @breaking-change 9.0.0 remove generic default type
export class MatCalendarBody<D = unknown> implements OnChanges, OnDestroy {
  /** The label for the table. (e.g. "Jan 2017"). */
  @Input() label: string;

  /** The cells to display in the table. */
  @Input() rows: MatCalendarCell<D>[][];

  /**
   * The value in the table that corresponds to today.
   * @deprecated No longer needed since MatCalendarBody now gets today value from DateAdapter.
   * @breaking-change 9.0.0 remove this property
   */
  @Input() todayValue: number;

  /**
   * The value in the table that is currently selected.
   * @deprecated Please get/set the selection via the `MatDateSelectionModel` instead.
   * @breaking-change 9.0.0 remove this property.
   */
  @Input()
  get selectedValue(): number {
    if (this._selectionModel instanceof MatSingleDateSelectionModel) {
      const date = this._selectionModel.getSelection();
      if (date) {
        const granularity = this._getFirstCellGranularity();
        if (granularity == 'day') {
          return this._dateAdapter.getDate(date);
        } else if (granularity == 'month') {
          return this._dateAdapter.getMonth(date);
        } else {
          return this._dateAdapter.getYear(date);
        }
      }
    }
    return null!;
  }
  set selectedValue(value: number) {
    if (this._selectionModel instanceof MatSingleDateSelectionModel) {
      if (value !== null) {
        const date = this._selectionModel.getSelection() || this._getFirstCellRange().start;
        const granularity = this._getFirstCellGranularity();
        const year = granularity == 'year' ? value : this._dateAdapter.getYear(date);
        const month = granularity == 'month' ? value : this._dateAdapter.getMonth(date);
        const day = granularity == 'day' ? value : this._dateAdapter.getDate(date);
        this._selectionModel.setSelection(this._dateAdapter.createDate(year, month, day));
      } else {
        this._selectionModel.setSelection(null);
      }
    }
  }

  /** The minimum number of free cells needed to fit the label in the first row. */
  @Input() labelMinRequiredCells: number;

  /** The number of columns in the table. */
  @Input() numCols = 7;

  /** The cell number of the active cell in the table. */
  @Input() activeCell = 0;

  /**
   * The aspect ratio (width / height) to use for the cells in the table. This aspect ratio will be
   * maintained even as the table resizes.
   */
  @Input() cellAspectRatio = 1;

  /**
   * Emits when a new value is selected.
   * @deprecated Please listen for selection change via the `MatDateSelectionModel` instead.
   * @breaking-change 9.0.0 remove this property.
   */
  @Output() readonly selectedValueChange: EventEmitter<number> = new EventEmitter<number>();

  /** The number of blank cells to put at the beginning for the first row. */
  _firstRowOffset: number;

  /** Padding for the individual date cells. */
  _cellPadding: string;

  /** Width of an individual cell. */
  _cellWidth: string;

  private _today: D;
  private _selectionSubscription: Subscription;

  constructor(private _elementRef: ElementRef<HTMLElement>,
              private _ngZone: NgZone,
              private _cdr: ChangeDetectorRef,
              private _dateAdapter: DateAdapter<D>,
              private readonly _selectionModel: MatDateSelectionModel<D>) {
    this._updateToday();

    this._selectionSubscription =
        this._selectionModel.selectionChange.subscribe(() => this._cdr.markForCheck());
  }

  ngOnDestroy() {
    this._selectionSubscription.unsubscribe();
  }

  _cellClicked(cell: MatCalendarCell<D>): void {
    if (cell.enabled && this._selectionModel instanceof MatSingleDateSelectionModel) {
      const date = cell.range.start;
      const granularity = this._getFirstCellGranularity();
      if (granularity == 'year') {
        this.selectedValueChange.emit(this._dateAdapter.getYear(date));
      } else if (granularity == 'month') {
        this.selectedValueChange.emit(this._dateAdapter.getMonth(date));
      } else {
        this.selectedValueChange.emit(this._dateAdapter.getDate(date));
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const columnChanges = changes.numCols;
    const {rows, numCols} = this;

    if (changes.rows || columnChanges) {
      this._firstRowOffset = rows && rows.length && rows[0].length ? numCols - rows[0].length : 0;
    }

    if (changes.cellAspectRatio || columnChanges || !this._cellPadding) {
      this._cellPadding = `${50 * this.cellAspectRatio / numCols}%`;
    }

    if (columnChanges || !this._cellWidth) {
      this._cellWidth = `${100 / numCols}%`;
    }
  }

  _isActiveCell(rowIndex: number, colIndex: number): boolean {
    let cellNumber = rowIndex * this.numCols + colIndex;

    // Account for the fact that the first row may not have as many cells.
    if (rowIndex) {
      cellNumber -= this._firstRowOffset;
    }

    return cellNumber == this.activeCell;
  }

  _isSelected(item: MatCalendarCell<D>): boolean {
    return this._selectionModel.overlaps(item.range);
  }

  _isToday(item: MatCalendarCell<D>): boolean {
    return this._dateAdapter.compareDate(item.range.start, this._today) <= 0 &&
        this._dateAdapter.compareDate(item.range.end, this._today) >= 0;
  }

  /** Focuses the active cell after the microtask queue is empty. */
  _focusActiveCell() {
    this._ngZone.runOutsideAngular(() => {
      this._ngZone.onStable.asObservable().pipe(take(1)).subscribe(() => {
        const activeCell: HTMLElement | null =
            this._elementRef.nativeElement.querySelector('.mat-calendar-body-active');

        if (activeCell) {
          activeCell.focus();
        }
      });
    });
  }

  _updateToday() {
    this._today = this._dateAdapter.today();
    // Note(mmalerba): This is required to zero out the time portion of the date.
    // Revisit this when we support time picking.
    this._today = this._dateAdapter.createDate(
        this._dateAdapter.getYear(this._today),
        this._dateAdapter.getMonth(this._today),
        this._dateAdapter.getDate(this._today));
  }

  // @breaking-change 9.0.0 remove when deprecated properties relying on it are removed.
  private _getFirstCellRange() {
    return (this.rows && this.rows[0] && this.rows[0][0] && this.rows[0][0].range);
  }

  // @breaking-change 9.0.0 remove when deprecated properties relying on it are removed.
  private _getFirstCellGranularity(): 'day' | 'month' | 'year' {
    const range = this._getFirstCellRange();
    if (this._dateAdapter.getYear(range.start) == this._dateAdapter.getYear(range.end)) {
      if (this._dateAdapter.getMonth(range.start) == this._dateAdapter.getMonth(range.end)) {
        if (this._dateAdapter.getDate(range.start) == this._dateAdapter.getDate(range.end)) {
          return 'day';
        }
        return 'month';
      }
      return 'year';
    }
    return 'day';
  }
}
