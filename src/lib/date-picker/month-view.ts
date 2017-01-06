import {Component, ViewEncapsulation, ChangeDetectionStrategy, Input} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'md-month-view, mat-month-view',
  templateUrl: 'month-view.html',
  styleUrls: ['month-view.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdMonthView {
  @Input() date: Date = new Date();

  localeSettings = {
    firstDayOfWeek: 0,
    getDateString: (d: number) => '' + d,
    getMonthLabel: (m: number, y: number) => {
      let months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUL', 'AUG', 'SEP', 'OCT', 'DEC'];
      return `${months[m]} ${y}`;
    }
  };

  label: string;

  weeks: number[][];

  padding: number;

  constructor() {
    this.label = this.localeSettings.getMonthLabel(this.date.getMonth(), this.date.getFullYear());
    this._calculateWeeks();
  }

  private _calculateWeeks() {
    let firstOfMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
    let daysInMonth = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
    let padding = (7 + firstOfMonth.getDay() - this.localeSettings.firstDayOfWeek) % 7;

    // Fill in empty cells at the beginning of the month.
    this.weeks = [[]];
    for (let i = 0; i < padding; i++) {
      this.weeks[0].push(0);
    }

    // Fill in the date cells.
    for (let i = 0, cell = padding; i < daysInMonth; i++, cell++) {
      if (cell == 7) {
        this.weeks.push([]);
        cell = 0;
      }
      this.weeks[this.weeks.length - 1].push(i + 1);
    }
  }

  getDateString(date: number) {
    return date == 0 ? '' : this.localeSettings.getDateString(date);
  }
}
