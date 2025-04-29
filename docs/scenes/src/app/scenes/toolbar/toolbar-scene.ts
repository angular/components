/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-toolbar-scene',
  templateUrl: './toolbar-scene.html',
  styleUrls: ['./toolbar-scene.scss'],
  imports: [MatToolbarModule, MatIconModule],
})
export class ToolbarScene {}
