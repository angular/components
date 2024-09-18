/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'mat-timepicker',
  exportAs: 'matTimepicker',
  templateUrl: 'timepicker.html',
  styleUrl: 'timepicker.css',
  host: {
    'class': 'mat-timepicker',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
})
export class MatTimepicker {}
