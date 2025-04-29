/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-expansion-scene',
  templateUrl: './expansion-scene.html',
  styleUrls: ['./expansion-scene.scss'],
  imports: [MatExpansionModule, MatIconModule],
})
export class ExpansionScene {}
