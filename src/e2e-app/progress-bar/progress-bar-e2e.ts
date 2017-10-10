/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'progress-bar-e2e',
  templateUrl: 'progress-bar-e2e.html',
  styles: [`
    mat-progress-bar {
      margin-bottom: 10px;
    }
  `]
})
export class ProgressBarE2E {
  determinateValue: number = 57;
  bufferValue: number = 35;
}
