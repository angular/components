import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling';

/** @title Virtual scrolling window */
@Component({
  selector: 'cdk-virtual-scroll-window-scrolling-example',
  styleUrls: ['cdk-virtual-scroll-window-scrolling-example.css'],
  templateUrl: 'cdk-virtual-scroll-window-scrolling-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, ScrollingModule],
})
export class CdkVirtualScrollWindowScrollingExample {
  @Input() shouldRun = /(^|.)(stackblitz|webcontainer).(io|com)$/.test(window.location.host);

  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);
}
