/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HighContrastModeDetector} from '@angular/cdk/a11y';
import {BidiModule} from '@angular/cdk/bidi';
import {inject, InjectionToken, NgModule} from '@angular/core';
import {_isTestEnvironment} from '@angular/cdk/platform';

/**
 * Injection token that configures whether the Material sanity checks are enabled.
 * @deprecated No longer used and will be removed.
 * @breaking-change 21.0.0
 */
export const MATERIAL_SANITY_CHECKS = new InjectionToken<SanityChecks>('mat-sanity-checks', {
  providedIn: 'root',
  factory: () => true,
});

/**
 * Possible sanity checks that can be enabled. If set to
 * true/false, all checks will be enabled/disabled.
 * @deprecated No longer used and will be removed.
 * @breaking-change 21.0.0
 */
export type SanityChecks = boolean | GranularSanityChecks;

/**
 * Object that can be used to configure the sanity checks granularly.
 * @deprecated No longer used and will be removed.
 * @breaking-change 21.0.0
 */
export interface GranularSanityChecks {
  doctype: boolean;
  theme: boolean;
  version: boolean;
}

/**
 * Module that captures anything that should be loaded and/or run for *all* Angular Material
 * components. This includes Bidi, etc.
 *
 * This module should be imported to each top-level component module (e.g., MatTabsModule).
 * @deprecated No longer used and will be removed.
 * @breaking-change 21.0.0
 */
@NgModule({
  imports: [BidiModule],
  exports: [BidiModule],
})
export class MatCommonModule {
  constructor(...args: any[]);

  constructor() {
    // While A11yModule also does this, we repeat it here to avoid importing A11yModule
    // in MatCommonModule.
    inject(HighContrastModeDetector)._applyBodyHighContrastModeCssClasses();
  }
}
