/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'grid-list-demo',
  templateUrl: 'grid-list-demo.html',
  styleUrl: 'grid-list-demo.css',
  imports: [FormsModule, MatButtonModule, MatCardModule, MatGridListModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridListDemo {
  tiles: {text: string; cols: number; rows: number; color: string}[] = [
    {text: 'One', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Two', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Three', cols: 1, rows: 1, color: 'lightpink'},
    {text: 'Four', cols: 2, rows: 1, color: '#DDBDF1'},
  ];

  dogs: {name: string; human: string}[] = [
    {name: 'Porter', human: 'Kara'},
    {name: 'Mal', human: 'Jeremy'},
    {name: 'Koby', human: 'Igor'},
    {name: 'Razzle', human: 'Ward'},
    {name: 'Molly', human: 'Rob'},
    {name: 'Husi', human: 'Matias'},
  ];

  basicRowHeight = 80;
  fixedCols = 4;
  fixedRowHeight = 100;
  ratioGutter = '1px';
  fitListHeight = '400px';
  ratio = '4:1';

  addTileCols() {
    this.tiles[2].cols++;
  }
}
