/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-button-toggle-scene',
  templateUrl: './button-toggle-scene.html',
  styleUrls: ['./button-toggle-scene.scss'],
  imports: [MatButtonToggleModule, MatIconModule],
})
export class ButtonToggleScene {}
