import {Component, signal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * @title Tab group where the tab content is loaded lazily (when activated)
 */
@Component({
  selector: 'tab-group-lazy-loaded-example',
  templateUrl: 'tab-group-lazy-loaded-example.html',
  imports: [MatTabsModule, DatePipe],
})
export class TabGroupLazyLoadedExample {
  protected tabLoadTimes = signal<Record<number, Date>>({
    1: new Date(),
  });

  protected markTimeLoaded(index: number) {
    this.tabLoadTimes.update(current =>
      current[index]
        ? current
        : {
            ...current,
            [index]: new Date(),
          },
    );
  }
}
