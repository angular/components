/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-slide-toggle-scene',
  templateUrl: './slide-toggle-scene.html',
  styleUrls: ['./slide-toggle-scene.scss'],
  imports: [MatIconModule, MatSlideToggleModule],
})
export class SlideToggleScene {}
