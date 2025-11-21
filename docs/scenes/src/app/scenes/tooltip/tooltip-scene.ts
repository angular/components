/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, AfterViewInit, ViewEncapsulation, viewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule, MatTooltip} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-tooltip-scene',
  templateUrl: './tooltip-scene.html',
  styleUrls: ['./tooltip-scene.scss'],
  imports: [MatButtonModule, MatTooltipModule, MatIconModule],
})
export class TooltipScene implements AfterViewInit {
  readonly tooltip = viewChild.required(MatTooltip);

  ngAfterViewInit() {
    this.tooltip().toggle();
  }
}
