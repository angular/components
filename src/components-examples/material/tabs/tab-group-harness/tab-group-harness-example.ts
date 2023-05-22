import {Component} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * @title Testing with MatTabGroupHarness
 */
@Component({
  selector: 'tab-group-harness-example',
  templateUrl: 'tab-group-harness-example.html',
  standalone: true,
  imports: [MatTabsModule],
})
export class TabGroupHarnessExample {}
