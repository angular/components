/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export interface Schema {
  /**
   * Color to generate M3 theme, represents the primary color palette.
   */
  primaryColor: string;
  /**
   * Color to override the secondary color palette.
   */
  secondaryColor?: string;
  /**
   * Color to override the tertiary color palette.
   */
  tertiaryColor?: string;
  /**
   * Color to override the neutral color palette.
   */
  neutralColor?: string;
  /**
   * Color to override the neutral variant color palette.
   */
  neutralVariantColor?: string;
  /**
   * Color to override the error color palette.
   */
  errorColor?: string;
  /**
   * Whether to create high contrast override theme mixins.
   */
  includeHighContrast?: boolean;
  /*
   * Workspace-relative path to a directory where the file with the custom M3
   * theme will be generated.
   *
   * If not set, the file will be generated at the project root.
   */
  directory?: string;

  /**
   * Whether to generate output file in scss or CSS. CSS directly defines all the system variables
   * instead of having a separate theme scss file where you call the `theme()` mixin.
   *
   * If not set, the generated theme file will be a scss file.
   */
  isScss?: boolean;
}
