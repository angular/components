import {Component, inject} from '@angular/core';
import {Overlay, OverlayContainer} from '@angular/cdk/overlay';
import {ScrollingModule} from '@angular/cdk/scrolling';

@Component({
  selector: 'block-scroll-strategy-e2e',
  templateUrl: 'block-scroll-strategy-e2e.html',
  styleUrl: 'block-scroll-strategy-e2e.css',
  standalone: true,
  imports: [ScrollingModule],
})
export class BlockScrollStrategyE2E {
  scrollStrategy = inject(Overlay).scrollStrategies.block();

  constructor() {
    // This loads the structural styles for the test.
    inject(OverlayContainer).getContainerElement();
  }
}
