import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * @title Tab group with aligned labels
 */
@Component({
  selector: 'tab-group-align-example',
  templateUrl: 'tab-group-align-example.html',
  styleUrl: 'tab-group-align-example.css',
  imports: [MatTabsModule, MatButtonModule],
})
export class TabGroupAlignExample {
  alignment: 'start' | 'center' | 'end' = 'start';
}
