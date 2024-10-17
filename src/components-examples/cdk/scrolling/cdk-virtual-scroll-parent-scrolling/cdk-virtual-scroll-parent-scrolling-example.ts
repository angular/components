import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ScrollingModule} from '@angular/cdk/scrolling';

/** @title Virtual scrolling viewport parent element */
@Component({
  selector: 'cdk-virtual-scroll-parent-scrolling-example',
  styleUrl: 'cdk-virtual-scroll-parent-scrolling-example.css',
  templateUrl: 'cdk-virtual-scroll-parent-scrolling-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollingModule],
})
export class CdkVirtualScrollParentScrollingExample {
  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);
}
