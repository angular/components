import 'reflect-metadata';
import 'zone.js';

import {renderModuleFactory} from '@angular/platform-server';
import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';

import {KitchenSinkRootServerModuleNgFactory} from './kitchen-sink-root.ngfactory';

// Do not enable production mode, because otherwise the `MatCommonModule` won't execute
// the browser related checks that could cause NodeJS issues.

// Resolve the path to the "index.html" through Bazel runfile resolution.
const indexHtmlPath = require.resolve('./index.html');
const outputPath = join(__dirname, 'index-prerendered.html');

const result = renderModuleFactory(
    KitchenSinkRootServerModuleNgFactory,
    {document: readFileSync(indexHtmlPath, 'utf-8')});

result
  .then(content => {
    console.log('Inspect pre-rendered page here:');
    console.log(`file://${outputPath}`);
    writeFileSync(outputPath, content, 'utf-8');
    console.log('Prerender done.');
  })
  // If rendering the module factory fails, print the error and exit the process
  // with a non-zero exit code.
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

// Export the output path in case this file is imported as part of a test.
export {outputPath};
