/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-card-scene',
  templateUrl: './card-scene.html',
  styleUrls: ['./card-scene.scss'],
  imports: [MatCardModule],
})
export class CardScene {}
