import {Component} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

/**
 * @title Drag&Drop custom preview container example
 */
@Component({
  selector: 'cdk-drag-drop-custom-preview-container-example',
  templateUrl: 'cdk-drag-drop-custom-preview-container-example.html',
  styleUrls: ['cdk-drag-drop-custom-preview-container-example.css'],
})
export class CdkDragDropCustomPreviewContainerExample {
  moviesOne = [
    {
      title: 'Episode I - The Phantom Menace'
    },
    {
      title: 'Episode II - Attack of the Clones'
    },
    {
      title: 'Episode III - Revenge of the Sith'
    },
    {
      title: 'Episode IV - A New Hope'
    },
  ];

  moviesTwo = [
    {
      title: 'Episode V - The Empire Strikes Back'
    },
    {
      title: 'Episode VI - Return of the Jedi'
    },
    {
      title: 'Episode VII - The Force Awakens'
    },
    {
      title: 'Episode VIII - The Last Jedi'
    },
  ];

  drop(which: any[], event: CdkDragDrop<{title: string, poster: string}[]>) {
    moveItemInArray(which, event.previousIndex, event.currentIndex);
  }
}
