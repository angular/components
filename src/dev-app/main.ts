/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Load `$localize` for examples using it.
import '@angular/localize/init';

import {importProvidersFrom} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {bootstrapApplication} from '@angular/platform-browser';

import {MAT_RIPPLE_GLOBAL_OPTIONS} from '@angular/material/core';
import {Directionality} from '@angular/cdk/bidi';
import {OverlayContainer, FullscreenOverlayContainer} from '@angular/cdk/overlay';

import {DevApp} from './dev-app';
import {DevAppDirectionality} from './dev-app/dev-app-directionality';
import {DevAppRippleOptions} from './dev-app/ripple-options';
import {DEV_APP_ROUTES} from './routes';
import {getAppState} from './dev-app/dev-app-state';

// We need to insert this stylesheet manually since it depends on the value from the app state.
// It uses a different file, instead of toggling a class, to avoid other styles from bleeding in.
const cachedAppState = getAppState();
const theme = document.createElement('link');
theme.href = cachedAppState.m3Enabled ? 'theme-m3.css' : 'theme.css';
theme.id = 'theme-styles';
theme.rel = 'stylesheet';
document.head.appendChild(theme);

bootstrapApplication(DevApp, {
  providers: [
    importProvidersFrom(
      BrowserAnimationsModule.withConfig({
        disableAnimations: !cachedAppState.animations,
      }),
      RouterModule.forRoot(DEV_APP_ROUTES),
      HttpClientModule,
    ),
    {provide: OverlayContainer, useClass: FullscreenOverlayContainer},
    {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useExisting: DevAppRippleOptions},
    {provide: Directionality, useClass: DevAppDirectionality},
  ],
});
