import 'reflect-metadata';
import 'zone.js';

import {ErrorHandler} from '@angular/core';
import {bootstrapApplication, provideClientHydration} from '@angular/platform-browser';
import {renderApplication} from '@angular/platform-server';
import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import {runfiles} from '@bazel/runfiles';

import {KitchenSink} from './kitchen-sink/kitchen-sink';
import {provideNoopAnimations} from '@angular/platform-browser/animations';

// Do not enable production mode, because otherwise the `MatCommonModule` won't execute
// the browser related checks that could cause NodeJS issues.

// Resolve the path to the "index.html" through Bazel runfile resolution.
const indexHtmlPath = runfiles.resolvePackageRelative('./index.html');
const themeCssPath = runfiles.resolvePackageRelative('./theme.css');

function bootstrap() {
  return bootstrapApplication(KitchenSink, {
    providers: [
      provideNoopAnimations(),
      provideClientHydration(),
      {
        // If an error is thrown asynchronously during server-side rendering it'll get logged to
        // stderr, but it won't cause the build to fail. We still want to catch these errors so we
        // provide an ErrorHandler that rethrows the error and causes the process to exit correctly.
        provide: ErrorHandler,
        useValue: {
          handleError: (error: Error) => {
            throw error;
          },
        },
      },
    ],
  });
}

const result = renderApplication(bootstrap, {
  document: readFileSync(indexHtmlPath, 'utf-8'),
});
const outDir = process.env['TEST_UNDECLARED_OUTPUTS_DIR'] as string;

result
  .then(content => {
    const filename = join(outDir, 'index-prerendered.html');
    const themeFilename = join(outDir, 'theme.css');

    console.log('Inspect pre-rendered page here:');
    console.log(`file://${filename}`);
    writeFileSync(filename, content, 'utf-8');
    writeFileSync(themeFilename, readFileSync(themeCssPath, 'utf-8'), 'utf-8');
    console.log('Prerender done.');
  })
  // If rendering fails, print the error and exit the process with a non-zero exit code.
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
