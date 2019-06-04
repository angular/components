/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, EventEmitter} from '@angular/core';
import {ThemePalette} from '@angular/material/core';

export abstract class MatDatepickerInputBase<D> {
  value: D | null;
  min: D | null;
  max: D | null;
  disabled: boolean;
  _disabledChange: EventEmitter<boolean>;
  abstract getConnectedOverlayOrigin(): ElementRef;
  abstract _dateFilter: (date: D | null) => boolean;
  abstract _getThemePalette(): ThemePalette;
}
