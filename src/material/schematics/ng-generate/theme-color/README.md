# Material 3 Custom Theme schematic

```shell
ng generate @angular/material:theme-color
```

This schematic allows users to create new Material 3 theme palettes based
on custom colors by using [Material Color Utilities](https://github.com/material-foundation/material-color-utilities).

The generated [color palettes](https://m3.material.io/styles/color/roles) are
optimized to have enough contrast to be more accessible. See [Science of Color Design](https://material.io/blog/science-of-color-design) for more information about Material's color design.

For more customization, custom colors can be also be provided for the
secondary, tertiary, and neutral palette colors. It is recommended to choose colors that
are contrastful, Material has more detailed guidance for [accessible design](https://m3.material.io/foundations/accessible-design/patterns).

The output of the schematic will create a file named `_theme-colors.scss` at the
specified directory or the project root with the generated palettes. The exported
palettes (`$primary-palette` and `$tertiary-palette`) can be provided to the `theme` mixin within your theme file to use the custom colors.

```scss
@use '@angular/material' as mat;
@use './path/to/my-theme'; // location of generated file

html {
  @include mat.theme(
    color: (
      primary: my-theme.$primary-palette,
      tertiary: my-theme.$tertiary-palette,
    ),
    typography: Roboto,
    density: 0,
  )
}
```

High contrast override theme mixins are also generated in the file if specified
(`high-contrast-light-theme-overrides` and `high-contrast-dark-theme-overrides`). These mixins
override the system level variables with high contrast equivalent values from your theme. This is
helpful for users who prefer more contrastful colors for either preference or accessibility reasons.

```scss
@use '@angular/material';
@use './path/to/my-theme'; // location of generated file

html {
  // Apply the light theme by default
  @include material.theme((
    color: (
      primary: my-theme.$primary-palette,
      tertiary: my-theme.$tertiary-palette,
    ),
    typography: Roboto,
    density: 0,
  ));

  // Use high contrast light theme colors when users prefer contrast
  @media (prefers-contrast: more) {
    @include my-theme.high-contrast-light-theme-overrides();
  }

  // Apply dark theme when users prefer a dark color scheme
  @media (prefers-color-scheme: dark) {
    @include material.theme((
      color: (
        primary: my-theme.$primary-palette,
        tertiary: my-theme.$tertiary-palette,
        theme-type: dark,
      ),
    ));

    // Use high contrast dark theme colors when users prefers a dark color scheme and contrast
    @media (prefers-contrast: more) {
      @include my-theme.high-contrast-dark-theme-overrides();
    }
  }
}
```

## Options

### Required

* `primaryColor` - Color to use for app's primary color palette (Note: the other
palettes described in the Material 3 spec will be automatically chosen based on
your primary palette unless specified, to ensure a harmonious color combination).

### Optional

* `secondaryColor` - Color to use for app's secondary color palette. Defaults to
secondary color generated from Material based on the primary.
* `tertiaryColor` - Color to use for app's tertiary color palette. Defaults to
tertiary color generated from Material based on the primary.
* `neutralColor` - Color to use for app's neutral color palette. Defaults to
neutral color generated from Material based on the primary.
* `includeHighContrast` - Whether to add high contrast override mixins to generated
theme file. Developers can call the mixin when they want to show a high contrast version of their
theme. Defaults to false.
* `directory` - Relative path to a directory within the project that the
generated theme file should be created in. Defaults to the project root.
