import 'zone.js';

import {ErrorHandler} from '@angular/core';
import {MATERIAL_ANIMATIONS} from '@angular/material/core';
import {
  BootstrapContext,
  bootstrapApplication,
  provideClientHydration,
} from '@angular/platform-browser';
import {provideServerRendering, renderApplication} from '@angular/platform-server';
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

renderApplication(bootstrap, {
  document: readFileSync(indexPath, 'utf-8'),
})
  .then(content => writeFileSync(outputPath, content))
  .catch(error => {
    // If rendering fails, print the error and exit the process with a non-zero exit code.
    console.error(error);
    process.exit(1);
  });

function bootstrap(context: BootstrapContext) {
  return bootstrapApplication(
    KitchenSink,
    {
      providers: [
        {
          provide: MATERIAL_ANIMATIONS,
          useValue: {
            animationsDisabled: true,
          },
        },
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
    },
    context,
  );
}
