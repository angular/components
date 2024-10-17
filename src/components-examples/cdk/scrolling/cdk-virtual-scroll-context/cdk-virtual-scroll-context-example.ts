import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ScrollingModule} from '@angular/cdk/scrolling';

/** @title Virtual scroll context variables */
@Component({
  selector: 'cdk-virtual-scroll-context-example',
  styleUrl: 'cdk-virtual-scroll-context-example.css',
  templateUrl: 'cdk-virtual-scroll-context-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollingModule],
})
export class CdkVirtualScrollContextExample {
  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);
}
