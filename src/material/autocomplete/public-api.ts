/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export * from './module';
export * from './autocomplete';
export * from './autocomplete-origin';
export * from './autocomplete-trigger';

// Re-export these since they're required to be used together with `mat-autocomplete`.
export {MatOption, MatOptgroup} from '@angular/material/core';
