/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Create custom theme for the given application configuration. */
export function createCustomTheme(userPaletteChoice: string): string {
  const colorPalettes = new Map<string, {primary: string; tertiary: string}>([
    ['azure-blue', {primary: 'azure', tertiary: 'blue'}],
    ['rose-red', {primary: 'rose', tertiary: 'red'}],
    ['magenta-violet', {primary: 'magenta', tertiary: 'violet'}],
    ['cyan-orange', {primary: 'cyan', tertiary: 'orange'}],
  ]);
  return `
// Include theming for Angular Material with \`mat.theme()\`.
// This Sass mixin will define CSS variables that are used for styling Angular Material
// components according to the Material 3 design spec.
// Learn more about theming and how to use it for your application's
// custom components at https://material.angular.dev/guide/theming
@use '@angular/material' as mat;

html {
  @include mat.theme((
    color: (
      primary: mat.$${colorPalettes.get(userPaletteChoice)!.primary}-palette,
      tertiary: mat.$${colorPalettes.get(userPaletteChoice)!.tertiary}-palette,
    ),
    typography: Roboto,
    density: 0,
  ));
}

body {
  // Default the application to a light color theme. This can be changed to
  // \`dark\` to enable the dark color theme, or to \`light dark\` to defer to the
  // user's system settings.
  color-scheme: light;

  // Set a default background, font and text colors for the application using
  // Angular Material's system-level CSS variables. Learn more about these
  // variables at https://material.angular.dev/guide/system-variables
  background-color: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
  font: var(--mat-sys-body-medium);

  // Reset the user agent margin.
  margin: 0;
}
`;
}
