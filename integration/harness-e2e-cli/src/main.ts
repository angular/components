import {enableProdMode} from '@angular/core';
import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';

import {environment} from './environments/environment';
import {AppComponent} from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [provideProtractorTestingSupport()],
}).catch(err => console.error(err));
