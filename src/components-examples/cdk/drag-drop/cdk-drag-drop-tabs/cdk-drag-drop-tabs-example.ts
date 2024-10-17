import {Component, ViewEncapsulation} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * @title Drag&Drop tabs
 */
@Component({
  selector: 'cdk-drag-drop-tabs-example',
  templateUrl: 'cdk-drag-drop-tabs-example.html',
  styleUrl: 'cdk-drag-drop-tabs-example.css',
  imports: [CdkDrag, CdkDropList, MatTabsModule],
  encapsulation: ViewEncapsulation.None,
})
export class CdkDragDropTabsExample {
  protected tabs = ['One', 'Two', 'Three', 'Four', 'Five'];
  protected selectedTabIndex = 0;

  drop(event: CdkDragDrop<string[]>) {
    const prevActive = this.tabs[this.selectedTabIndex];
    moveItemInArray(this.tabs, event.previousIndex, event.currentIndex);
    this.selectedTabIndex = this.tabs.indexOf(prevActive);
  }
}
