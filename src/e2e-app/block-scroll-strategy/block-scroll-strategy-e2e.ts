import {Overlay, ScrollStrategy} from '@angular/cdk/overlay';
import {Component} from '@angular/core';

@Component({
  selector: 'block-scroll-strategy-e2e',
  templateUrl: 'block-scroll-strategy-e2e.html',
  styleUrls: ['block-scroll-strategy-e2e.css'],
})
export class BlockScrollStrategyE2E {
  constructor(private _overlay: Overlay) {}
  scrollStrategy: ScrollStrategy = this._overlay.scrollStrategies.block();
}
