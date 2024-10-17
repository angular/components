/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@Component({
  selector: 'slide-toggle-demo',
  templateUrl: 'slide-toggle-demo.html',
  styleUrl: 'slide-toggle-demo.css',
  imports: [FormsModule, MatButtonModule, MatSlideToggleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlideToggleDemo {
  firstToggle = false;
  formToggle = false;

  onFormSubmit() {
    alert(`You submitted the form. Value: ${this.formToggle}.`);
  }
}
