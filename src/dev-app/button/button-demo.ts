/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  MatAnchor,
  MatButton,
  MatButtonAppearance,
  MatFabAnchor,
  MatFabButton,
  MatIconAnchor,
  MatIconButton,
  MatMiniFabAnchor,
  MatMiniFabButton,
} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'button-demo',
  templateUrl: 'button-demo.html',
  styleUrl: 'button-demo.css',
  imports: [
    FormsModule,
    MatAnchor,
    MatButton,
    MatCheckbox,
    MatFabAnchor,
    MatFabButton,
    MatIcon,
    MatIconAnchor,
    MatIconButton,
    MatMiniFabAnchor,
    MatMiniFabButton,
    MatProgressSpinner,
    MatTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDemo {
  isDisabled = false;
  showProgress = false;
  clickCounter = 0;
  toggleDisable = false;
  tooltipText = 'This is a button tooltip!';
  disabledInteractive = false;
  appearances: MatButtonAppearance[] = ['text', 'elevated', 'outlined', 'filled', 'tonal'];
}
