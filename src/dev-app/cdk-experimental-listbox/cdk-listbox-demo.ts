/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {CdkListboxModule} from '@angular/cdk-experimental/listbox';
import {CommonModule} from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';

@Component({
  templateUrl: 'cdk-listbox-demo.html',
  styleUrls: ['cdk-listbox-demo.css'],
  standalone: true,
  imports: [CdkListboxModule, CommonModule, FormsModule, MatSelectModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkListboxDemo {
  multiSelectable = false;
  activeDescendant = true;
  fruitControl = new FormControl();

  get fruit() {
    return this.fruitControl.value;
  }
  set fruit(value) {
    this.fruitControl.patchValue(value);
  }

  toggleFormDisabled() {
    if (this.fruitControl.disabled) {
      this.fruitControl.enable();
    } else {
      this.fruitControl.disable();
    }
  }

  toggleMultiple() {
    this.multiSelectable = !this.multiSelectable;
  }

  toggleActiveDescendant() {
    this.activeDescendant = !this.activeDescendant;
  }
}
