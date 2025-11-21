/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-chips-scene',
  templateUrl: './chips-scene.html',
  styleUrls: ['./chips-scene.scss'],
  imports: [MatChipsModule],
})
export class ChipsScene {}
