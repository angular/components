import {Component} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * @title Tab group with paginated tabs
 */
@Component({
  selector: 'tab-group-paginated-example',
  templateUrl: 'tab-group-paginated-example.html',
  standalone: true,
  imports: [MatTabsModule],
})
export class TabGroupPaginatedExample {
  lotsOfTabs = new Array(30).fill(0).map((_, index) => `Tab ${index}`);
}
