import {VERSION as CDK_VERSION} from '@angular/cdk';
import {VERSION as MAT_VERSION} from '@angular/material/core';
import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

if (environment.production) {
  enableProdMode();
}

/* eslint-disable no-console */
console.info('Angular CDK version', CDK_VERSION.full);
console.info('Angular Material version', MAT_VERSION.full);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
