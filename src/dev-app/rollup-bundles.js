/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const path = require('path');
const fs = require('fs');
const rollup = require('rollup');
const ngc = require('@angular/compiler-cli');
const {NgtscProgram} = require('@angular/compiler-cli/src/ngtsc/program');

/** Path that refers to the dev-app output directory. */
const devAppOut = 'dist/packages/dev-app';

/**
 * Rollup entry-points that need to be processed. Lazy route entry-points will be added
 * dynamically after the dev-app has been analyzed.
 */
const rollupInputs = {
  main: `${devAppOut}/main.js`,
};

/** Modules that need to be mapped to a given file system path. */
const rollupPathMappings = {
  '@angular/material': 'dist/packages/material',
  '@angular/cdk': 'dist/packages/cdk',
};
const pathMappingKeys = Object.keys(rollupPathMappings);

main();

/** Builds the dev-app rollup bundles. */
async function main() {
  const config = ngc.readConfiguration(path.join(__dirname, 'tsconfig-build.json'));
  const host = ngc.createCompilerHost({options: config.options});
  const program = new NgtscProgram(config.rootNames, config.options, host);

  // Determine all lazy routes in the dev-app and setup their entry-point in
  // the  rollup inputs object.
  program.listLazyRoutes().forEach(route => {
    console.log('>>> Building route entry-point:', route.route);

    rollupInputs[route.route.split('#')[0]] = `${devAppOut}/${path
      .relative(__dirname, route.referencedModule.filePath.split('#')[0])
      .replace('.ts', '.js')}`;
  });

  const build = await rollup.rollup({
    input: rollupInputs,
    plugins: [
      require('rollup-plugin-commonjs')({ignore: [ 'conditional-runtime-dependency' ]}),
      require('rollup-plugin-node-resolve')(),
      {resolveId: resolveModuleWithPathMapping}
    ],
  });

  await build.write({
    format: 'amd',
    name: 'dev-app',
    dir: 'dist/demo/',
    entryFileNames: '[name].js',
    exports: 'named',
  });
}

/**
 * Rollup custom resolve function that can be used to respect the previous
 * defined module path mappings.
 */
function resolveModuleWithPathMapping(importModule) {
  for (let moduleId of pathMappingKeys) {
    if (!importModule.startsWith(moduleId)) {
      continue;
    }

    const updatedPath = path.resolve(importModule.replace(moduleId, rollupPathMappings[moduleId]));

    if (fs.statSync(updatedPath).isDirectory()) {
      return path.join(updatedPath, 'index.js');
    } else {
      return updatedPath;
    }
  }
}
