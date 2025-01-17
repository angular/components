import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

/**
 * @title Testing with MatIconHarness
 */
@Component({
  selector: 'icon-harness-example',
  templateUrl: 'icon-harness-example.html',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconHarnessExample {}
