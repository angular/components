import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {BlockScrollStrategyE2eModule} from './block-scroll-strategy/block-scroll-strategy-e2e-module';
import {ComponentHarnessE2eModule} from './component-harness/component-harness-e2e-module';
import {E2eApp} from './e2e-app';
import {E2eAppModule} from './e2e-app/e2e-app-module';
import {E2E_APP_ROUTES} from './routes';
import {VirtualScrollE2eModule} from './virtual-scroll/virtual-scroll-e2e-module';

/** We allow for animations to be explicitly enabled in certain e2e tests. */
const enableAnimations = window.location.search.includes('animations=true');

@NgModule({
  imports: [
    BrowserModule,
    E2eAppModule,
    BrowserAnimationsModule.withConfig({disableAnimations: !enableAnimations}),
    RouterModule.forRoot(E2E_APP_ROUTES),

    // E2E demos
    BlockScrollStrategyE2eModule,
    ComponentHarnessE2eModule,
    VirtualScrollE2eModule,
  ],
  declarations: [E2eApp],
  bootstrap: [E2eApp],
})
export class MainModule {}
