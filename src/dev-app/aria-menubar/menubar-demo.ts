/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {
  MenuBarExample,
  MenuBarRTLExample,
  MenuBarDisabledExample,
} from '@angular/components-examples/aria/menubar';

@Component({
  templateUrl: 'menubar-demo.html',
  styleUrl: 'menubar-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MenuBarExample, MenuBarRTLExample, MenuBarDisabledExample],
})
export class MenubarDemo {}
