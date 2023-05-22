import {Component} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * @title Tab group that keeps its content inside the DOM when it's off-screen.
 */
@Component({
  selector: 'tab-group-preserve-content-example',
  templateUrl: 'tab-group-preserve-content-example.html',
  standalone: true,
  imports: [MatTabsModule],
})
export class TabGroupPreserveContentExample {}
