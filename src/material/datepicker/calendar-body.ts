/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  NgZone,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import {take} from 'rxjs/operators';

/**
 * Extra CSS classes that can be associated with a calendar cell.
 */
export type MatCalendarCellCssClasses = string | string[] | Set<string> | {[key: string]: any};

/**
 * An internal class that represents the data corresponding to a single calendar cell.
 * @docs-private
 */
export class MatCalendarCell {
  constructor(public value: number,
              public displayValue: string,
              public ariaLabel: string,
              public enabled: boolean,
              public cssClasses: MatCalendarCellCssClasses = {}) {}
}


/**
 * An internal component used to display calendar data in a table.
 * @docs-private
 */
@Component({
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
})
export class MatCalendarBody implements OnChanges, OnDestroy {
  /** The label for the table. (e.g. "Jan 2017"). */
  @Input() label: string;

  /** The cells to display in the table. */
  @Input() rows: MatCalendarCell[][];

  /** The value in the table that corresponds to today. */
  @Input() todayValue: number;

  /** The value in the table that is currently selected. */
  // @Input() selectedValue: number;

  @Input() startValue: number;

  @Input() endValue: number;

  /** The minimum number of free cells needed to fit the label in the first row. */
  @Input() labelMinRequiredCells: number;

  /** The number of columns in the table. */
  @Input() numCols: number = 7;

  /** The cell number of the active cell in the table. */
  @Input() activeCell: number = 0;

  /**
   * The aspect ratio (width / height) to use for the cells in the table. This aspect ratio will be
   * maintained even as the table resizes.
   */
  @Input() cellAspectRatio: number = 1;

  /** Emits when a new value is selected. */
  @Output() readonly selectedValueChange: EventEmitter<number> = new EventEmitter<number>();

  /** The number of blank cells to put at the beginning for the first row. */
  _firstRowOffset: number;

  /** Padding for the individual date cells. */
  _cellPadding: string;

  /** Width of an individual cell. */
  _cellWidth: string;

  _hoveredValue: number;

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ngZone: NgZone) {

    _ngZone.runOutsideAngular(() => {
      const element = _elementRef.nativeElement;
      element.addEventListener('mouseenter', this._enterHandler, true);
      element.addEventListener('focus', this._enterHandler, true);
      element.addEventListener('mouseleave', this._leaveHandler, true);
      element.addEventListener('blur', this._leaveHandler, true);
    });
  }

  /** Called when a cell is clicked. */
  _cellClicked(cell: MatCalendarCell): void {
    if (cell.enabled) {
      this.selectedValueChange.emit(cell.value);
    }
  }

  /** Returns whether a cell should be marked as selected. */
  _isSelected(cell: MatCalendarCell) {
    return this.startValue === cell.value || this.endValue === cell.value;
  }

  ngOnChanges(changes: SimpleChanges) {
    const columnChanges = changes['numCols'];
    const {rows, numCols} = this;

    if (changes['rows'] || columnChanges) {
      this._firstRowOffset = rows && rows.length && rows[0].length ? numCols - rows[0].length : 0;
    }

    if (changes['cellAspectRatio'] || columnChanges || !this._cellPadding) {
      this._cellPadding = `${50 * this.cellAspectRatio / numCols}%`;
    }

    if (columnChanges || !this._cellWidth) {
      this._cellWidth = `${100 / numCols}%`;
    }
  }

  ngOnDestroy() {
    const element = this._elementRef.nativeElement;
    element.removeEventListener('mouseenter', this._enterHandler, true);
    element.removeEventListener('focus', this._enterHandler, true);
    element.removeEventListener('mouseleave', this._leaveHandler, true);
    element.removeEventListener('blur', this._leaveHandler, true);
  }

  /** Returns whether a cell is active. */
  _isActiveCell(rowIndex: number, colIndex: number): boolean {
    let cellNumber = rowIndex * this.numCols + colIndex;

    // Account for the fact that the first row may not have as many cells.
    if (rowIndex) {
      cellNumber -= this._firstRowOffset;
    }

    return cellNumber == this.activeCell;
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

  /** Gets whether the calendar is currently selecting a range. */
  _isRange(): boolean {
    return this.startValue !== this.endValue;
  }

  /** Gets whether a value is within the currently-selected range. */
  _isInRange(value: number): boolean {
    if (!this._isRange() || value < this.startValue) {
      return false;
    }

    return value <= this.endValue || value <= this._hoveredValue;
  }

  /**
   * Event handler for when the user enters an element
   * inside the calendar body (e.g. by hovering in or focus).
   */
  private _enterHandler = (event: Event) => {
    // We only need to hit the zone when we're selecting a range, we
    // have a start value without an end value and we've hovered over a date cell.
    if (!event.target || !this._isRange() || !this.startValue || this.endValue) {
      return;
    }

    const cell = this._getCellFromElement(event.target as HTMLElement);

    if (cell) {
      this._ngZone.run(() => {
        this._hoveredValue = cell.value;
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  /**
   * Event handler for when the user's pointer leaves an element
   * inside the calendar body (e.g. by hovering out or blurring).
   */
  private _leaveHandler = (event: Event) => {
    // We only need to hit the zone when we're selecting a range.
    if (this._isRange() && this._hoveredValue !== -1) {
      // Only reset the hovered value when leaving cells. This looks better, because
      // we have a gap between the cells and the rows and we don't want to remove the
      // range just for it to show up again when the user moves a few pixels to the side.
      if (event.target && isTableCell(event.target as HTMLElement)) {
        this._ngZone.run(() => {
          this._hoveredValue = -1;
          this._changeDetectorRef.markForCheck();
        });
      }
    }
  }

  /** Finds the MatCalendarCell that corresponds to a DOM node. */
  private _getCellFromElement(element: HTMLElement): MatCalendarCell | null {
    let cell: HTMLElement | undefined;

    if (isTableCell(element)) {
      cell = element;
    } else if (isTableCell(element.parentNode!)) {
      cell = element.parentNode as HTMLElement;
    }

    if (cell) {
      const row = cell.getAttribute('data-mat-row');
      const col = cell.getAttribute('data-mat-col');

      if (row && col) {
        return this.rows[parseInt(row)][parseInt(col)];
      }
    }

    return null;
  }

}

/** Checks whether a node is a table cell element. */
function isTableCell(node: Node): node is HTMLTableCellElement {
  return node.nodeName === 'TD';
}
