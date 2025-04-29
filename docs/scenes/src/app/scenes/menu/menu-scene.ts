/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AfterViewInit, Component, ViewEncapsulation, viewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-button-scene',
  templateUrl: './menu-scene.html',
  styleUrls: ['./menu-scene.scss'],
  imports: [MatButtonModule, MatMenuModule, MatIconModule],
})
export class MenuScene implements AfterViewInit {
  readonly trigger = viewChild.required<MatMenuTrigger>('menuTrigger');

  ngAfterViewInit() {
    this.trigger().openMenu();
  }
}
