import {Component, ViewEncapsulation} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * @title Tabs with drag*drop integration.
 */
@Component({
  selector: 'tab-group-drag-drop-example',
  templateUrl: 'tab-group-drag-drop-example.html',
  styleUrl: 'tab-group-drag-drop-example.css',
  imports: [CdkDrag, CdkDropList, MatTabsModule],
  encapsulation: ViewEncapsulation.None,
})
export class TabGroupDragDropExample {
  protected tabs = ['One', 'Two', 'Three', 'Four', 'Five'];
  protected selectedTabIndex = 0;

  drop(event: CdkDragDrop<string[]>) {
    const prevActive = this.tabs[this.selectedTabIndex];
    moveItemInArray(this.tabs, event.previousIndex, event.currentIndex);
    this.selectedTabIndex = this.tabs.indexOf(prevActive);
  }
}
