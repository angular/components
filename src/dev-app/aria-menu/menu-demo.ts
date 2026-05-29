/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {
  MenuContextExample,
  MenuTriggerExample,
  MenuStandaloneExample,
  MenuStandaloneDisabledExample,
  MenuTriggerDisabledExample,
  MenuCdkOverlayExample,
  SharedMenuExample,
} from '@angular/components-examples/aria/menu';

@Component({
  templateUrl: 'menu-demo.html',
  styleUrl: 'menu-demo.css',
  encapsulation: ViewEncapsulation.None,
  imports: [
    MenuContextExample,
    MenuTriggerExample,
    MenuTriggerDisabledExample,
    MenuStandaloneExample,
    MenuStandaloneDisabledExample,
    MenuCdkOverlayExample,
    SharedMenuExample,
  ],
})
export class MenuDemo {}
