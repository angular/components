/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewEncapsulation
} from '@angular/core';
import {MDCCircularProgressFoundation} from '@material/circular-progress'

@Component({
  selector: 'mat-progress-spinner',
  exportAs: 'matProgressSpinner',
  templateUrl: 'progress-spinner.html',
  styleUrls: ['progress-spinner.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatProgressSpinner implements AfterViewInit, OnDestroy{
  private _circularProgressFoundation: MDCCircularProgressFoundation;

  constructor() {
    this._circularProgressFoundation = new MDCCircularProgressFoundation();
  }

  ngAfterViewInit() {
    this._circularProgressFoundation.init();
  }

  ngOnDestroy() {
    this._circularProgressFoundation.destroy();
  }
}
