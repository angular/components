import {Component} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  copyArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';

/**
 * @title Drag&Drop copy between lists
 */
@Component({
  selector: 'cdk-drag-drop-copy-list-example',
  templateUrl: 'cdk-drag-drop-copy-list-example.html',
  styleUrl: 'cdk-drag-drop-copy-list-example.css',
  imports: [CdkDropList, CdkDrag],
})
export class CdkDragDropCopyListExample {
  products = ['Bananas', 'Oranges', 'Bread', 'Butter', 'Soda', 'Eggs'];
  cart = ['Tomatoes'];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      copyArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
