/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'radio-demo',
  templateUrl: 'radio-demo.html',
  styleUrl: 'radio-demo.css',
  standalone: true,
  imports: [
    CommonModule,
    MatRadioModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioDemo {
  isAlignEnd = false;
  isDisabled = false;
  isRequired = false;
  disabledInteractive = true;
  favoriteSeason = 'Autumn';
  seasonOptions = ['Winter', 'Spring', 'Summer', 'Autumn'];
}
