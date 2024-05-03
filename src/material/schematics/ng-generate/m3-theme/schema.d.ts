/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
   * Type for theme (ex. 'light', 'dark', or 'both').
   */
  themeTypes?: string;
  /*
   * Workspace-relative path to a directory where the file with the custom M3
   * theme will be generated.
   *
   * If not set, the file will be generated at the project root.
   */
  directory?: string;
}
