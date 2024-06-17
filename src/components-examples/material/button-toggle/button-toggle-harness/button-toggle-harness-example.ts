import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {MatButtonToggleAppearance, MatButtonToggleModule} from '@angular/material/button-toggle';

/**
 * @title Testing with MatButtonToggleHarness
 */
@Component({
  selector: 'button-toggle-harness-example',
  templateUrl: 'button-toggle-harness-example.html',
  standalone: true,
  imports: [MatButtonToggleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleHarnessExample {
  disabled = signal(false);
  appearance = signal<MatButtonToggleAppearance>('standard');
}
