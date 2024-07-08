import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

/**
 * @title Testing with MatCardHarness
 */
@Component({
  selector: 'card-harness-example',
  templateUrl: 'card-harness-example.html',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
})
export class CardHarnessExample {}
