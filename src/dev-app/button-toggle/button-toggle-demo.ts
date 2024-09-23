/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'button-toggle-demo',
  templateUrl: 'button-toggle-demo.html',
  styleUrl: 'button-toggle-demo.css',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonToggleModule, MatCheckboxModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleDemo {
  isVertical = false;
  isDisabled = false;
  disabledInteractive = false;
  hideSingleSelectionIndicator = false;
  hideMultipleSelectionIndicator = false;
  favoritePie = 'Apple';
  pieOptions = ['Apple', 'Cherry', 'Pecan', 'Lemon'];
}
