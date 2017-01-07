import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output
} from '@angular/core';


const NUM_COLS = 7;


export class MdCalendarCell {
  constructor(public value: number, public displayValue: string) {}
}


@Component({
  moduleId: module.id,
  selector: 'md-month-view, mat-month-view',
  templateUrl: 'month-view.html',
  styleUrls: ['month-view.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdCalendarTable {
  @Input() label: string;

  @Input() data: MdCalendarCell[][];

  @Input() todayValue: number;

  @Input() selectedValue: number;

  @Input() labelMinCells: number;

  @Output() selectedValueChange = new EventEmitter<number>();

  _cellClicked(value: number) {
    if (this.selectedValue && this.selectedValue === value) {
      return;
    }
    this.selectedValueChange.emit(value);
  }

  _firstRowOffset() {
    return this.data && this.data.length && this.data[0].length ?
        NUM_COLS - this.data[0].length : 0;
  }
}
