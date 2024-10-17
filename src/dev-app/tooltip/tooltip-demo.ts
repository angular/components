/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  TooltipAutoHideExample,
  TooltipCustomClassExample,
  TooltipDelayExample,
  TooltipDisabledExample,
  TooltipManualExample,
  TooltipMessageExample,
  TooltipModifiedDefaultsExample,
  TooltipOverviewExample,
  TooltipPositionAtOriginExample,
  TooltipPositionExample,
} from '@angular/components-examples/material/tooltip';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'tooltip-demo',
  templateUrl: 'tooltip-demo.html',
  imports: [
    TooltipAutoHideExample,
    TooltipCustomClassExample,
    TooltipDelayExample,
    TooltipDisabledExample,
    TooltipManualExample,
    TooltipMessageExample,
    TooltipModifiedDefaultsExample,
    TooltipOverviewExample,
    TooltipPositionExample,
    TooltipPositionAtOriginExample,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipDemo {}
