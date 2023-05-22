import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ScrollingModule} from '@angular/cdk/scrolling';

/** @title Fixed size virtual scroll with custom buffer parameters */
@Component({
  selector: 'cdk-virtual-scroll-fixed-buffer-example',
  styleUrls: ['cdk-virtual-scroll-fixed-buffer-example.css'],
  templateUrl: 'cdk-virtual-scroll-fixed-buffer-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ScrollingModule],
})
export class CdkVirtualScrollFixedBufferExample {
  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);
}
