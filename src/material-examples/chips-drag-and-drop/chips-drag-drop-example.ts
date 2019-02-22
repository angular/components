import { Component } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

export interface Vegetable {
    name: string;
}

/**
 * @title Chips Drag and Drop
 */

@Component({
    selector: 'chips-drag-drop-example',
    templateUrl: 'chips-drag-drop-example.html',
    styleUrls: ['chips-drag-drop-example.css']
})
export class ChipsDragDropExample {

    public vegetables: Vegetable[] = [
        { name: 'apple' },
        { name: 'banana' },
        { name: 'strawberry' },
        { name: 'orange' },
        { name: 'kiwi' },
        { name: 'cherry' },
    ]

    drop(event: CdkDragDrop<Vegetable[]>) {
        moveItemInArray(this.vegetables, event.previousIndex, event.currentIndex);
    }
}