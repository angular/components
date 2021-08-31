import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop horizontal sorting
 */
@Component({
  selector: 'cdk-drag-drop-horizontal-sorting-example',
  templateUrl: 'cdk-drag-drop-horizontal-sorting-example.html',
  styleUrls: ['cdk-drag-drop-horizontal-sorting-example.css'],
})
export class CdkDragDropHorizontalSortingExample {
  timePeriods =
      ['Bronze age', 'Iron age', 'Middle ages', 'Early modern period', 'Long nineteenth century'];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.timePeriods, event.previousIndex, event.currentIndex);
  }
}
