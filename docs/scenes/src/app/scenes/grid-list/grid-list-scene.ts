/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';

@Component({
  selector: 'app-grid-list-scene',
  templateUrl: './grid-list-scene.html',
  styleUrls: ['./grid-list-scene.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [MatGridListModule],
})
export class GridListScene {
  tiles = [
    {cols: 3, rows: 1, color: '#f11'},
    {cols: 1, rows: 2, color: '#f77'},
    {cols: 1, rows: 1, color: '#c11'},
    {cols: 2, rows: 1, color: '#d66'},
  ];
}
