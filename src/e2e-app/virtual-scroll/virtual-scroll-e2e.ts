import {Component} from '@angular/core';


const itemSizeSample = [100, 25, 200, 50, 50, 100, 250, 75, 100, 50];


@Component({
  moduleId: module.id,
  selector: 'virtual-scroll-e2e',
  templateUrl: 'virtual-scroll-e2e.html',
})
export class VirtualScrollE2E {
  uniformItems = Array(1000).fill(50);
  variableItems = Array(100).fill(0).reduce(acc => acc.concat(itemSizeSample), []);
}
