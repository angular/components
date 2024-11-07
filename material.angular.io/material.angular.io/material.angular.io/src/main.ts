import {ErrorHandler} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';

import {unregisterServiceWorkers} from './unregister-service-workers';
import {MaterialDocsApp} from './app/material-docs-app';
import {MATERIAL_DOCS_ROUTES} from './app/routes';
import {withInMemoryScrolling, provideRouter} from '@angular/router';
import {provideAnimations, provideNoopAnimations} from '@angular/platform-browser/animations';
import {bootstrapApplication} from '@angular/platform-browser';
import {AnalyticsErrorReportHandler} from './app/shared/analytics/error-report-handler';
import {LocationStrategy, PathLocationStrategy} from '@angular/common';

const prefersReducedMotion =
  typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion)').matches : false;


// Unregister all installed service workers and force reload the page if there was
// an old service worker from a previous version of the docs.
unregisterServiceWorkers()
  .then(hadServiceWorker => hadServiceWorker && location.reload());

bootstrapApplication(MaterialDocsApp, {
  providers: [
    prefersReducedMotion ? provideNoopAnimations() : provideAnimations(),
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    {provide: ErrorHandler, useClass: AnalyticsErrorReportHandler},
    provideRouter(MATERIAL_DOCS_ROUTES, withInMemoryScrolling({
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled'
    })),
    provideHttpClient(),
  ]
})
  .catch(err => console.error(err));
