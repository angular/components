import {enableProdMode} from '@angular/core';
import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';

import {E2eApp} from './components/e2e-app/e2e-app';
import {Home} from './components/home';
import {BlockScrollStrategyE2E} from './components/block-scroll-strategy/block-scroll-strategy-e2e';
import {ComponentHarnessE2e} from './components/component-harness-e2e';
import {SliderE2e} from './components/slider-e2e';
import {VirtualScrollE2E} from './components/virtual-scroll/virtual-scroll-e2e';

enableProdMode();

bootstrapApplication(E2eApp, {
  providers: [
    provideNoopAnimations(),
    provideProtractorTestingSupport(),
    provideRouter([
      {path: '', component: Home},
      {path: 'block-scroll-strategy', component: BlockScrollStrategyE2E},
      {path: 'component-harness', component: ComponentHarnessE2e},
      {path: 'slider', component: SliderE2e},
      {path: 'virtual-scroll', component: VirtualScrollE2E},
    ]),
  ],
});
