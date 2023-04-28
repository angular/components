import {Component, inject} from '@angular/core';
import {Overlay} from '@angular/cdk/overlay';
import {ScrollingModule} from '@angular/cdk/scrolling';

@Component({
  selector: 'block-scroll-strategy-e2e',
  templateUrl: 'block-scroll-strategy-e2e.html',
  styleUrls: ['block-scroll-strategy-e2e.css'],
  standalone: true,
  imports: [ScrollingModule],
})
export class BlockScrollStrategyE2E {
  scrollStrategy = inject(Overlay).scrollStrategies.block();
}
