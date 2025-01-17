/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export interface Schema {
  /** Name of the project. */
  project: string;

  /** Whether the Angular browser animations module should be included and enabled. */
  animations: 'enabled' | 'disabled' | 'excluded';

  /** Name of pre-built theme to install. */
  theme: 'azure-blue' | 'rose-red' | 'magenta-violet' | 'cyan-orange' | 'custom';

  /** Whether to set up global typography styles. */
  typography: boolean;
}
