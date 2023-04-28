import {Component} from '@angular/core';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {ScrollingModule as ExperimentalScrollingModule} from '@angular/cdk-experimental/scrolling';

const itemSizeSample = [100, 25, 50, 50, 100, 200, 75, 100, 50, 250];

@Component({
  selector: 'virtual-scroll-e2e',
  templateUrl: 'virtual-scroll-e2e.html',
  styleUrls: ['virtual-scroll-e2e.css'],
  standalone: true,
  imports: [ScrollingModule, ExperimentalScrollingModule],
})
export class VirtualScrollE2E {
  uniformItems = Array(1000).fill(50);
  variableItems = Array(100)
    .fill(0)
    .reduce(acc => acc.concat(itemSizeSample), []);
}
