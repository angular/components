import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

/**
 * @title Testing with MatCardHarness
 */
@Component({
  selector: 'card-harness-example',
  templateUrl: 'card-harness-example.html',
  imports: [MatCardModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardHarnessExample {}
