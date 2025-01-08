/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {InjectionToken} from '@angular/core';
import {ThemePalette} from '@angular/material/core';

/** Default `mat-slide-toggle` options that can be overridden. */
export interface MatSlideToggleDefaultOptions {
  /** Whether toggle action triggers value changes in slide toggle. */
  disableToggleValue?: boolean;

  /**
   * Default theme color of the slide toggle. This API is supported in M2 themes only,
   * it has no effect in M3 themes. For color customization in M3, see https://material.angular.io/components/slide-toggle/styling.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.io/guide/material-2-theming#optional-add-backwards-compatibility-styles-for-color-variants
   */
  color?: ThemePalette;

  /** Whether to hide the icon inside the slide toggle. */
  hideIcon?: boolean;

  /** Whether disabled slide toggles should remain interactive. */
  disabledInteractive?: boolean;
}

/** Injection token to be used to override the default options for `mat-slide-toggle`. */
export const MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS = new InjectionToken<MatSlideToggleDefaultOptions>(
  'mat-slide-toggle-default-options',
  {
    providedIn: 'root',
    factory: () => ({disableToggleValue: false, hideIcon: false, disabledInteractive: false}),
  },
);
