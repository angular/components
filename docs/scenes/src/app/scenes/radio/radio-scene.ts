/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatRadioModule} from '@angular/material/radio';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-radio-scene',
  templateUrl: './radio-scene.html',
  styleUrls: ['./radio-scene.scss'],
  imports: [MatRadioModule],
})
export class RadioScene {}
