/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatBadgeModule} from '@angular/material/badge';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-badge-scene',
  templateUrl: './badge-scene.html',
  styleUrls: ['./badge-scene.scss'],
  imports: [MatIconModule, MatBadgeModule],
})
export class BadgeScene {}
