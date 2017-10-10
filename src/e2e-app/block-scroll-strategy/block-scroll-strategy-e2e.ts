/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {Overlay, ScrollStrategy} from '@angular/cdk/overlay';

@Component({
  moduleId: module.id,
  selector: 'block-scroll-strategy-e2e',
  templateUrl: 'block-scroll-strategy-e2e.html',
  styleUrls: ['block-scroll-strategy-e2e.css'],
})
export class BlockScrollStrategyE2E {
  constructor(private _overlay: Overlay) { }
  scrollStrategy: ScrollStrategy = this._overlay.scrollStrategies.block();
}
