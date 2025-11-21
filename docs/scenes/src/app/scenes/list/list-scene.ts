/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-list-scene',
  templateUrl: './list-scene.html',
  styleUrls: ['./list-scene.scss'],
  imports: [MatListModule, MatIconModule],
})
export class ListScene {}
