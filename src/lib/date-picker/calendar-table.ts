import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output
} from '@angular/core';



/**
 * An internal class that represents the data corresponding to a single calendar cell.
 * @docs-private
 */
export class MdCalendarCell {
  constructor(public value: number, public displayValue: string) {}
}


/**
 * An internal component used to display calendar data in a table.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'md-calendar-table, mat-calendar-table',
  templateUrl: 'calendar-table.html',
  styleUrls: ['calendar-table.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdCalendarTable {
  /** The label for the table. */
  @Input() label: string;

  /** The cells to display in the table. */
  @Input() data: MdCalendarCell[][];

  /** The value in the table that corresponds to today. */
  @Input() todayValue: number;

  /** The value in the table that is currently selected. */
  @Input() selectedValue: number;

  /** The minimum number of free cells needed to fit the label in the first row. */
  @Input() labelMinCells: number;

  /** The number of columns in the table. */
  @Input() numCols = 7;

  /** Emits when a new value is selected. */
  @Output() selectedValueChange = new EventEmitter<number>();

  _cellClicked(value: number) {
    if (this.selectedValue && this.selectedValue === value) {
      return;
    }
    this.selectedValueChange.emit(value);
  }

  _firstRowOffset() {
    return this.data && this.data.length && this.data[0].length ?
        this.numCols - this.data[0].length : 0;
  }
}
