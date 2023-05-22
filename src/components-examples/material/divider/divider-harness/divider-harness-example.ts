import {Component} from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';

/**
 * @title Testing with MatDividerHarness
 */
@Component({
  selector: 'divider-harness-example',
  templateUrl: 'divider-harness-example.html',
  standalone: true,
  imports: [MatDividerModule],
})
export class DividerHarnessExample {}
