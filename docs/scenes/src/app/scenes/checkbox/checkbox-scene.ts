/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-checkbox-scene',
  templateUrl: './checkbox-scene.html',
  styleUrls: ['./checkbox-scene.scss'],
  imports: [MatCheckboxModule],
})
export class CheckboxScene {}
