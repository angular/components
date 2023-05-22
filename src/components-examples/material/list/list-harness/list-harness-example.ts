import {Component} from '@angular/core';
import {MatListModule} from '@angular/material/list';

/**
 * @title Testing with MatListHarness
 */
@Component({
  selector: 'list-harness-example',
  templateUrl: 'list-harness-example.html',
  standalone: true,
  imports: [MatListModule],
})
export class ListHarnessExample {}
