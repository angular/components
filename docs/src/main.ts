/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ErrorHandler, provideZoneChangeDetection} from '@angular/core';

import {LocationStrategy, PathLocationStrategy} from '@angular/common';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withInMemoryScrolling} from '@angular/router';
import {MaterialDocsApp} from './app/material-docs-app';
import {MATERIAL_DOCS_ROUTES} from './app/routes';
import {AnalyticsErrorReportHandler} from './app/shared/analytics/error-report-handler';
import {unregisterServiceWorkers} from './unregister-service-workers';

// Unregister all installed service workers and force reload the page if there was
// an old service worker from a previous version of the docs.
unregisterServiceWorkers().then(hadServiceWorker => hadServiceWorker && location.reload());

bootstrapApplication(MaterialDocsApp, {
  providers: [
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    {provide: ErrorHandler, useClass: AnalyticsErrorReportHandler},
    provideRouter(
      MATERIAL_DOCS_ROUTES,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    provideZoneChangeDetection(),
  ],
}).catch(err => console.error(err));
