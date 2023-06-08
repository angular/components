import {Component} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * @title Tab group with dynamic height based on tab contents
 */
@Component({
  selector: 'tab-group-dynamic-height-example',
  templateUrl: 'tab-group-dynamic-height-example.html',
  styleUrls: ['tab-group-dynamic-height-example.css'],
  standalone: true,
  imports: [MatTabsModule],
})
export class TabGroupDynamicHeightExample {}
