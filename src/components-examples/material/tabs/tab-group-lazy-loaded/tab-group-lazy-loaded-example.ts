import {Component} from '@angular/core';
import {DatePipe} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * @title Tab group where the tab content is loaded lazily (when activated)
 */
@Component({
  selector: 'tab-group-lazy-loaded-example',
  templateUrl: 'tab-group-lazy-loaded-example.html',
  standalone: true,
  imports: [MatTabsModule, DatePipe],
})
export class TabGroupLazyLoadedExample {
  tabLoadTimes: Date[] = [];

  getTimeLoaded(index: number) {
    if (!this.tabLoadTimes[index]) {
      this.tabLoadTimes[index] = new Date();
    }

    return this.tabLoadTimes[index];
  }
}
