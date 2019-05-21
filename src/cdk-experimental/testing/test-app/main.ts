import {platformBrowser} from '@angular/platform-browser';
import {TestAppModuleNgFactory} from './test-app.ngfactory';

platformBrowser().bootstrapModuleFactory(TestAppModuleNgFactory);
