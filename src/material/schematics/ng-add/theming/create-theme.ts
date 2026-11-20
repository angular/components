/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Create theme for the given application configuration. */
export function createTheme(userPaletteChoice: string): string {
  const colorPalettes = new Map([
    ['azure-blue', {primary: 'azure', tertiary: 'blue'}],
    ['rose-red', {primary: 'rose', tertiary: 'red'}],
    ['magenta-violet', {primary: 'magenta', tertiary: 'violet'}],
    ['cyan-orange', {primary: 'cyan', tertiary: 'orange'}],
  ]);
  return `
// Include theming for Angular Material with \`mat.theme()\`.
// \`@use\` must come before any other rules (including \`@layer\`).
@use '@angular/material' as mat;

// Cascade layer ordering. Angular Material component styles ship in the
// \`angular-material\` layer. Declaring layer order here makes overrides
// predictable alongside CDK styles and utility frameworks.
// Learn more: https://material.angular.dev/guide/theming#css-cascade-layers
@layer base, cdk-resets, cdk-overlay, angular-material, components, utilities;

// Wrapping \`mat.theme()\` in \`mat.theme-layer\` places generated CSS
// custom properties in the same \`angular-material\` layer as component styles.
@include mat.theme-layer {
  html {
    height: 100%;
    @include mat.theme((
      color: (
        primary: mat.$${colorPalettes.get(userPaletteChoice)!.primary}-palette,
        tertiary: mat.$${colorPalettes.get(userPaletteChoice)!.tertiary}-palette,
      ),
      typography: Roboto,
      density: 0,
    ));
  }
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
  height: 100%;
}
`;
}
