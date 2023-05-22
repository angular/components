import {
  FixedSizeVirtualScrollStrategy,
  ScrollingModule,
  VIRTUAL_SCROLL_STRATEGY,
} from '@angular/cdk/scrolling';
import {ChangeDetectionStrategy, Component} from '@angular/core';

export class CustomVirtualScrollStrategy extends FixedSizeVirtualScrollStrategy {
  constructor() {
    super(50, 250, 500);
  }
}

/** @title Virtual scroll with a custom strategy */
@Component({
  selector: 'cdk-virtual-scroll-custom-strategy-example',
  styleUrls: ['cdk-virtual-scroll-custom-strategy-example.css'],
  templateUrl: 'cdk-virtual-scroll-custom-strategy-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: VIRTUAL_SCROLL_STRATEGY, useClass: CustomVirtualScrollStrategy}],
  standalone: true,
  imports: [ScrollingModule],
})
export class CdkVirtualScrollCustomStrategyExample {
  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);
}
