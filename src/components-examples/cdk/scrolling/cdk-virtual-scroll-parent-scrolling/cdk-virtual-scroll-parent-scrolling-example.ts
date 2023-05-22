import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ScrollingModule} from '@angular/cdk/scrolling';

/** @title Virtual scrolling viewport parent element */
@Component({
  selector: 'cdk-virtual-scroll-parent-scrolling-example',
  styleUrls: ['cdk-virtual-scroll-parent-scrolling-example.css'],
  templateUrl: 'cdk-virtual-scroll-parent-scrolling-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ScrollingModule],
})
export class CdkVirtualScrollParentScrollingExample {
  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);
}
