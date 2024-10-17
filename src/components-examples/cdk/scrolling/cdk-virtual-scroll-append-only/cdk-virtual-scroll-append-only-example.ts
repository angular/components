import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ScrollingModule} from '@angular/cdk/scrolling';

/** @title Virtual scroll with view recycling disabled. */
@Component({
  selector: 'cdk-virtual-scroll-append-only-example',
  styleUrl: 'cdk-virtual-scroll-append-only-example.css',
  templateUrl: 'cdk-virtual-scroll-append-only-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollingModule],
})
export class CdkVirtualScrollAppendOnlyExample {
  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);
}
