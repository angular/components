import {Component, ViewChild} from '@angular/core';
import {MatMenuTrigger} from '@angular/material/menu';

/**
 * @title Basic menu
 */
@Component({
  selector: 'menu-overview-example',
  templateUrl: 'menu-overview-example.html',
})
export class MenuOverviewExample {
  @ViewChild(MatMenuTrigger) trigger?: MatMenuTrigger;
  doubleOpen() {
    this.trigger?.openMenu();
    this.trigger?.openMenu();
  }
}
