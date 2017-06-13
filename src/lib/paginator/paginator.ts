import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'md-paginator, mat-paginator',
  templateUrl: 'paginator.html',
  styleUrls: ['paginator.css'],
  host: {
    'class': 'mat-paginator',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdPaginator {
  @Input() startIndex = 0;
  @Input() endIndex = 100;

  @Input() listLength = 100;

  @Input() pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 25, 100];

  @Output() pageLengthChange = new EventEmitter<number>();
  @Output() increasePage = new EventEmitter<void>();
  @Output() decreasePage = new EventEmitter<void>();
}