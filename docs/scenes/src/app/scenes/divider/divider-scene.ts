/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-divider-scene',
  templateUrl: './divider-scene.html',
  styleUrls: ['./divider-scene.scss'],
  imports: [MatListModule, MatIconModule, MatDividerModule],
})
export class DividerScene {}
