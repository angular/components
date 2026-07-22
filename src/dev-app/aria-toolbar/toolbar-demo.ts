/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {
  ToolbarBasicHorizontalExample,
  ToolbarBasicVerticalExample,
  ToolbarConfigurableExample,
  ToolbarRtlExample,
  ToolbarHardDisabledExample,
} from '@angular/components-examples/aria/toolbar';

@Component({
  templateUrl: 'toolbar-demo.html',
  imports: [
    ToolbarBasicHorizontalExample,
    ToolbarBasicVerticalExample,
    ToolbarConfigurableExample,
    ToolbarRtlExample,
    ToolbarHardDisabledExample,
  ],
  styleUrl: './toolbar-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarDemo {}
