/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// ========================
// Approach A: Single unified adapter with mode configuration
// ========================
export * from './adapter/index';

// ========================
// Approach B: Split adapters (one per Temporal type)
// ========================
// These are exported under a 'split' namespace to differentiate from the unified adapter.
// Usage: import { providePlainDateAdapter } from '@angular/material-temporal-adapter/split';
export * from './adapter/split/index';
