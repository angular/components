/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  MatButton,
  MatAnchor,
  MatFabButton,
  MatFabAnchor,
  MatIconButton,
  MatIconAnchor,
  MatMiniFabButton,
  MatMiniFabAnchor,
} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatCheckbox} from '@angular/material/checkbox';

@Component({
  selector: 'button-demo',
  templateUrl: 'button-demo.html',
  styleUrls: ['button-demo.css'],
  standalone: true,
  imports: [
    MatButton,
    MatAnchor,
    MatFabButton,
    MatFabAnchor,
    MatMiniFabButton,
    MatMiniFabAnchor,
    MatIconButton,
    MatIconAnchor,
    MatIcon,
    MatTooltip,
    MatCheckbox,
    FormsModule,
  ],
})
export class ButtonDemo {
  isDisabled = false;
  clickCounter = 0;
  toggleDisable = false;
  tooltipText = 'This is a button tooltip!';
  disabledInteractive = false;
}
