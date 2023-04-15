import {importProvidersFrom} from '@angular/core';

import {AppComponent} from './app/app.component';
import {MatNativeDateModule} from '@angular/material/core';
import {provideAnimations} from '@angular/platform-browser/animations';
import {routes} from './app/app-routes';
import {BrowserModule, bootstrapApplication} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';
import {SceneOverlayContainer} from './app/scene-overlay-container';
import {Platform} from '@angular/cdk/platform';
import {OverlayContainer} from '@angular/cdk/overlay';
import {provideRouter} from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      MatNativeDateModule
    ),
    {
      provide: OverlayContainer,
      useFactory: (doc: any, platform: Platform) => new SceneOverlayContainer(doc, platform),
      deps: [DOCUMENT, Platform]
    },
    provideAnimations(),
    provideRouter(routes),
  ]
}).catch(err => console.error(err));
