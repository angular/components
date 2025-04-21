import {AppComponent} from './app/app.component';
import {provideNativeDateAdapter, MATERIAL_ANIMATIONS} from '@angular/material/core';
import {routes} from './app/app-routes';
import {bootstrapApplication} from '@angular/platform-browser';
import {SceneOverlayContainer} from './app/scene-overlay-container';
import {OverlayContainer} from '@angular/cdk/overlay';
import {provideRouter} from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [
    provideNativeDateAdapter(),
    {
      provide: OverlayContainer,
      useClass: SceneOverlayContainer,
    },
    {
      provide: MATERIAL_ANIMATIONS,
      useValue: {animationsDisabled: true},
    },
    provideRouter(routes),
  ],
}).catch(err => console.error(err));
