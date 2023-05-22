import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ScrollingModule} from '@angular/cdk/scrolling';

/** @title Virtual scroll with no template caching */
@Component({
  selector: 'cdk-virtual-scroll-template-cache-example',
  styleUrls: ['cdk-virtual-scroll-template-cache-example.css'],
  templateUrl: 'cdk-virtual-scroll-template-cache-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ScrollingModule],
})
export class CdkVirtualScrollTemplateCacheExample {
  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);
}
