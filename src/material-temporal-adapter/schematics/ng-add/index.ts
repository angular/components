/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule} from '@angular-devkit/schematics';

/**
 * Schematic entry point for ng-add.
 *
 * This is a no-op schematic that allows users to run `ng add @angular/material-temporal-adapter`.
 * It provides a foundation for future enhancements like automatic setup.
 */
export default function (): Rule {
  // Noop schematic so the CLI doesn't throw if users try to `ng add` this package.
  // Also allows us to add more functionality in the future.
  return () => {};
}
