/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatStepperModule} from '@angular/material/stepper';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-stepper-scene',
  templateUrl: './stepper-scene.html',
  styleUrls: ['./stepper-scene.scss'],
  imports: [MatStepperModule, MatFormFieldModule, MatInputModule],
})
export class StepperScene {}
