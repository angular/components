/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-core-scene',
  templateUrl: './core-scene.html',
  styleUrls: ['./core-scene.scss'],
  imports: [MatIconModule],
})
export class CoreScene {}
