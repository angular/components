/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatPaginatorModule} from '@angular/material/paginator';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-paginator-scene',
  templateUrl: './paginator-scene.html',
  styleUrls: ['./paginator-scene.scss'],
  imports: [MatPaginatorModule],
})
export class PaginatorScene {}
