import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {ScrollingModule} from '@angular/cdk/scrolling';

/** @title Horizontal virtual scroll */
@Component({
  selector: 'cdk-virtual-scroll-horizontal-example',
  styleUrls: ['cdk-virtual-scroll-horizontal-example.css'],
  templateUrl: 'cdk-virtual-scroll-horizontal-example.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ScrollingModule],
})
export class CdkVirtualScrollHorizontalExample {
  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);
}
