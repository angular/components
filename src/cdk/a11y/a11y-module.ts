/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ObserversModule} from '@angular/cdk/observers';
import {NgModule, inject} from '@angular/core';
import {CdkMonitorFocus} from './focus-monitor/focus-monitor';
import {CdkTrapFocus} from './focus-trap/focus-trap';
import {HighContrastModeDetector} from './high-contrast-mode/high-contrast-mode-detector';
import {CdkAriaLive} from './live-announcer/live-announcer';

@NgModule({
  imports: [ObserversModule, CdkAriaLive, CdkTrapFocus, CdkMonitorFocus],
  exports: [CdkAriaLive, CdkTrapFocus, CdkMonitorFocus],
})
export class A11yModule {
  constructor() {
    inject(HighContrastModeDetector)._applyBodyHighContrastModeCssClasses();
  }
}
