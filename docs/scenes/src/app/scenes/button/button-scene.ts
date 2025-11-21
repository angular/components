/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-button-scene',
  templateUrl: './button-scene.html',
  styleUrls: ['./button-scene.scss'],
  imports: [MatButtonModule, MatIconModule],
})
export class ButtonScene {}
