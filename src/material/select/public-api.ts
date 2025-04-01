/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export * from './module';
export * from './select';
export * from './select-animations';

// Re-export these since they're required to be used together with `mat-select`.
// Also they used to be provided implicitly with `MatSelectModule`.
export {MatOption, MatOptgroup} from '@angular/material/core';
export {
  MatFormField,
  MatLabel,
  MatHint,
  MatError,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
