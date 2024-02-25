import {Component} from '@angular/core';
import {CdkDragDrop, moveItemInArray, CdkDrag, CdkDropList} from '@angular/cdk/drag-drop';
import {MatChipsModule} from '@angular/material/chips';

export interface Vegetable {
  name: string;
}

/**
 * @title Chips Drag and Drop
 */
@Component({
  selector: 'chips-drag-drop-example',
  templateUrl: 'chips-drag-drop-example.html',
  styleUrl: 'chips-drag-drop-example.css',
  standalone: true,
  imports: [MatChipsModule, CdkDropList, CdkDrag],
})
export class ChipsDragDropExample {
  vegetables: Vegetable[] = [
    {name: 'apple'},
    {name: 'banana'},
    {name: 'strawberry'},
    {name: 'orange'},
    {name: 'kiwi'},
    {name: 'cherry'},
  ];

  drop(event: CdkDragDrop<Vegetable[]>) {
    moveItemInArray(this.vegetables, event.previousIndex, event.currentIndex);
  }
}
