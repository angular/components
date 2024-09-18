/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatTimepicker} from '@angular/material/timepicker';

@Component({
  selector: 'timepicker-demo',
  templateUrl: 'timepicker-demo.html',
  styleUrl: 'timepicker-demo.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTimepicker],
})
export class TimepickerDemo {}
