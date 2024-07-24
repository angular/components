/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {InjectionToken} from '@angular/core';
import {ThemePalette} from '@angular/material/core';

/** Default `mat-checkbox` options that can be overridden. */
export interface MatCheckboxDefaultOptions {
  /**
   * Default theme color of the checkbox. This API is supported in M2 themes
   * only, it has no effect in M3 themes.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.io/guide/theming#using-component-color-variants
   */
  color?: ThemePalette;

  /** Default checkbox click action for checkboxes. */
  clickAction?: MatCheckboxClickAction;

  /** Whether disabled checkboxes should be interactive. */
  disabledInteractive?: boolean;
}

/** Injection token to be used to override the default options for `mat-checkbox`. */
export const MAT_CHECKBOX_DEFAULT_OPTIONS = new InjectionToken<MatCheckboxDefaultOptions>(
  'mat-checkbox-default-options',
  {
    providedIn: 'root',
    factory: MAT_CHECKBOX_DEFAULT_OPTIONS_FACTORY,
  },
);

/** @docs-private */
export function MAT_CHECKBOX_DEFAULT_OPTIONS_FACTORY(): MatCheckboxDefaultOptions {
  return {
    color: 'accent',
    clickAction: 'check-indeterminate',
    disabledInteractive: false,
  };
}

/**
 * Checkbox click action when user click on input element.
 * noop: Do not toggle checked or indeterminate.
 * check: Only toggle checked status, ignore indeterminate.
 * check-indeterminate: Toggle checked status, set indeterminate to false. Default behavior.
 * undefined: Same as `check-indeterminate`.
 */
export type MatCheckboxClickAction = 'noop' | 'check' | 'check-indeterminate' | undefined;
