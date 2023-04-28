import {Routes} from '@angular/router';
import {BlockScrollStrategyE2E} from './block-scroll-strategy/block-scroll-strategy-e2e';
import {ComponentHarnessE2e} from './component-harness/component-harness-e2e';
import {Home} from './e2e-app/e2e-app-layout';
import {SliderE2e} from './slider/slider-e2e';
import {VirtualScrollE2E} from './virtual-scroll/virtual-scroll-e2e';

export const E2E_APP_ROUTES: Routes = [
  {path: '', component: Home},
  {path: 'block-scroll-strategy', component: BlockScrollStrategyE2E},
  {path: 'component-harness', component: ComponentHarnessE2e},
  {path: 'slider', component: SliderE2e},
  {path: 'virtual-scroll', component: VirtualScrollE2E},
];
