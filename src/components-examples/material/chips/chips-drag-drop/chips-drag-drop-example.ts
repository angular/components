import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
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
  imports: [MatChipsModule, CdkDropList, CdkDrag],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsDragDropExample {
  readonly vegetables = signal<Vegetable[]>([
    {name: 'apple'},
    {name: 'banana'},
    {name: 'strawberry'},
    {name: 'orange'},
    {name: 'kiwi'},
    {name: 'cherry'},
  ]);

  drop(event: CdkDragDrop<Vegetable[]>) {
    this.vegetables.update(vegetables => {
      moveItemInArray(vegetables, event.previousIndex, event.currentIndex);
      return [...vegetables];
    });
  }
}
