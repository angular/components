/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-input-scene',
  templateUrl: './progress-spinner-scene.html',
  styleUrls: ['./progress-spinner-scene.scss'],
  imports: [MatProgressSpinnerModule],
})
export class ProgressSpinnerScene {}
