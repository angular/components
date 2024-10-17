import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {ScrollingModule} from '@angular/cdk/scrolling';

/** @title Virtual scrolling window */
@Component({
  selector: 'cdk-virtual-scroll-window-scrolling-example',
  styleUrl: 'cdk-virtual-scroll-window-scrolling-example.css',
  templateUrl: 'cdk-virtual-scroll-window-scrolling-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollingModule],
})
export class CdkVirtualScrollWindowScrollingExample {
  readonly shouldRun = input(/(^|.)(stackblitz|webcontainer).(io|com)$/.test(window.location.host));

  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);
}
