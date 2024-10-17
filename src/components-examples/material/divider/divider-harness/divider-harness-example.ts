import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';

/**
 * @title Testing with MatDividerHarness
 */
@Component({
  selector: 'divider-harness-example',
  templateUrl: 'divider-harness-example.html',
  imports: [MatDividerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerHarnessExample {}
