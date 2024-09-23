/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Load `$localize` for examples using it.
import '@angular/localize/init';

import {provideHttpClient} from '@angular/common/http';
import {
  importProvidersFrom,
  provideExperimentalZonelessChangeDetection,
  // tslint:disable-next-line:no-zone-dependencies -- Allow manual testing of dev-app with zones
  provideZoneChangeDetection,
} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';

import {Directionality} from '@angular/cdk/bidi';
import {FullscreenOverlayContainer, OverlayContainer} from '@angular/cdk/overlay';
import {MAT_RIPPLE_GLOBAL_OPTIONS, provideNativeDateAdapter} from '@angular/material/core';

import {DevApp} from './dev-app';
import {DevAppDirectionality} from './dev-app/dev-app-directionality';
import {getAppState} from './dev-app/dev-app-state';
import {DevAppRippleOptions} from './dev-app/ripple-options';
import {DEV_APP_ROUTES} from './routes';

// We need to insert this stylesheet manually since it depends on the value from the app state.
// It uses a different file, instead of toggling a class, to avoid other styles from bleeding in.
const cachedAppState = getAppState();
const theme = document.createElement('link');
theme.href = cachedAppState.m3Enabled ? 'theme-m3.css' : 'theme.css';
theme.id = 'theme-styles';
theme.rel = 'stylesheet';

// Bootstrap the app after the theme has loaded so we can properly test the
// theme loaded checks. This also avoids a flicker if it takes too long to load.
theme.addEventListener('load', bootstrap, {once: true});
document.head.appendChild(theme);

function bootstrap(): void {
  bootstrapApplication(DevApp, {
    providers: [
      importProvidersFrom(
        BrowserAnimationsModule.withConfig({
          disableAnimations: !cachedAppState.animations,
        }),
        RouterModule.forRoot(DEV_APP_ROUTES),
      ),
      provideNativeDateAdapter(),
      provideHttpClient(),
      {provide: OverlayContainer, useClass: FullscreenOverlayContainer},
      {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useExisting: DevAppRippleOptions},
      {provide: Directionality, useClass: DevAppDirectionality},
      cachedAppState.zoneless
        ? provideExperimentalZonelessChangeDetection()
        : provideZoneChangeDetection({eventCoalescing: true, runCoalescing: true}),
    ],
  });
}
