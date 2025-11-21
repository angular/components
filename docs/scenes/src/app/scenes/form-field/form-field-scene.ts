/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-form-field-scene',
  templateUrl: './form-field-scene.html',
  imports: [MatFormFieldModule, MatInputModule, MatIconModule],
})
export class FormFieldScene {}
