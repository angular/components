import 'reflect-metadata';
import 'zone.js';

// TODO(devversion): Remove when APF ships pre-linked output.
import '@angular/compiler';

import {ErrorHandler} from '@angular/core';
import {bootstrapApplication, provideClientHydration} from '@angular/platform-browser';
import {provideServerRendering, renderApplication} from '@angular/platform-server';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {runfiles} from '@bazel/runfiles';
import {readFileSync, writeFileSync} from 'fs';

import {AUTOMATED_KITCHEN_SINK, KitchenSink} from './kitchen-sink/kitchen-sink';

const outputPath = process.argv[2];
const indexPath = runfiles.resolvePackageRelative('./index-source.html');

// Debug mode disables some automated interactions to make it easier to debug components locally.
const isDebugMode = process.argv.includes('--debug');

if (!outputPath) {
  throw new Error('Cannot determine output path for prerendered content');
}

// Do not enable production mode, because otherwise the `MatCommonModule` won't execute
// the browser related checks that could cause NodeJS issues.

renderApplication(bootstrap, {
  document: readFileSync(indexPath, 'utf-8'),
})
  .then(content => writeFileSync(outputPath, content))
  .catch(error => {
    // If rendering fails, print the error and exit the process with a non-zero exit code.
    console.error(error);
    process.exit(1);
  });

function bootstrap() {
  return bootstrapApplication(KitchenSink, {
    providers: [
      provideNoopAnimations(),
      provideServerRendering(),
      provideClientHydration(),
      {
        provide: AUTOMATED_KITCHEN_SINK,
        useValue: !isDebugMode,
      },
      {
        // If an error is thrown asynchronously during server-side rendering
        // it'll get logged to stderr, but it won't cause the build to fail.
        // We still want to catch these errors so we provide an ErrorHandler
        // that rethrows the error and causes the process to exit correctly.
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
