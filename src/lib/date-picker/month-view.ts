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
  @Input() date: Date;
}
