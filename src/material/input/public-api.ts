/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {MatInput, MatInputConfig, MAT_INPUT_CONFIG} from './input';
export {MatInputModule} from './module';
export * from './input-value-accessor';
export * from './input-errors';

// Re-provide these for convenience since they used to be provided implicitly.
export {MatFormField, MatLabel, MatHint, MatError, MatPrefix, MatSuffix} from '../form-field';
