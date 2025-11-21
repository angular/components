/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-progress-bar-scene',
  templateUrl: './progress-bar-scene.html',
  styleUrls: ['./progress-bar-scene.scss'],
  imports: [MatProgressBarModule],
})
export class ProgressBarScene {}
