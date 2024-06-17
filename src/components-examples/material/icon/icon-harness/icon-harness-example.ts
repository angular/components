import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

/**
 * @title Testing with MatIconHarness
 */
@Component({
  selector: 'icon-harness-example',
  templateUrl: 'icon-harness-example.html',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconHarnessExample {}
