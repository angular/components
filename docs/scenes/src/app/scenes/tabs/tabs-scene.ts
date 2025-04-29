/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'app-tabs-scene',
  templateUrl: './tabs-scene.html',
  styleUrls: ['./tabs-scene.scss'],
  imports: [MatTabsModule],
})
export class TabsScene {}
