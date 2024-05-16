import {Component, signal} from '@angular/core';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title Testing with MatBadgeHarness
 */
@Component({
  selector: 'badge-harness-example',
  templateUrl: 'badge-harness-example.html',
  standalone: true,
  imports: [MatButtonModule, MatBadgeModule],
})
export class BadgeHarnessExample {
  simpleContent = signal('S');
  overlap = signal(true);
  disabled = signal(true);
}
