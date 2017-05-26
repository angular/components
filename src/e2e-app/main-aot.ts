import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {E2eAppModuleNgFactory} from './e2e-app-module.ngfactory';

platformBrowserDynamic().bootstrapModuleFactory(E2eAppModuleNgFactory);
