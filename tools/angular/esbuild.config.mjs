/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createEsbuildAngularOptimizePlugin} from '@angular/build-tooling/shared-scripts/angular-optimization/esbuild-plugin.mjs';

export default {
  // Note: We support `.mjs` here as this is the extension used by Angular APF packages.
  resolveExtensions: ['.mjs', '.js'],
  format: 'esm',
  plugins: [
    await createEsbuildAngularOptimizePlugin({
      enableLinker: {
        // Only run the linker on `fesm2022/` bundles. This should not have an effect on
        // the bundle output, but helps speeding up ESBuild when it visits other modules.
        filterPaths: /fesm2022/,
        linkerOptions: {
          // We enable JIT mode as unit tests may need it for overriding.
          linkerJitMode: true,
        },
      },
    }),
  ],
};
