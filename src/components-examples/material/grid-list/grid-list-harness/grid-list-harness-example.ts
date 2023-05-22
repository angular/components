import {Component} from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';

/**
 * @title Testing with MatGridListHarness
 */
@Component({
  selector: 'grid-list-harness-example',
  templateUrl: 'grid-list-harness-example.html',
  standalone: true,
  imports: [MatGridListModule],
})
export class GridListHarnessExample {}
