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
import {MDCCheckboxFoundation} from '@material/checkbox';
import {MDCFormFieldFoundation} from '@material/form-field';

@Component({
  moduleId: module.id,
  selector: 'mat-checkbox',
  templateUrl: 'checkbox.html',
  styleUrls: ['checkbox.css'],
  host: {
    '(animationend)': '_checkboxFoundation.handleAnimationEnd()',
  },
  exportAs: 'matCheckbox',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatCheckbox implements AfterViewInit, OnDestroy {
  _checkboxFoundation: MDCCheckboxFoundation;

  private _formFieldFoundation: MDCFormFieldFoundation;

  constructor() {
    this._checkboxFoundation = new MDCCheckboxFoundation();
    this._formFieldFoundation = new MDCFormFieldFoundation();
  }

  ngAfterViewInit() {
    this._checkboxFoundation.init();
    this._formFieldFoundation.init();
  }

  ngOnDestroy() {
    this._checkboxFoundation.destroy();
    this._formFieldFoundation.destroy();
  }
}
