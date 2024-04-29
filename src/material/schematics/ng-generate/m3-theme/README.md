# Material 3 Custom Theme schematic

```shell
ng generate @angular/material:m3-theme
```

This schematic allows users to create new Material 3 theme configurations based
on custom colors by using [Material Color Utilities](https://github.com/material-foundation/material-color-utilities).

The generated [color palettes](https://m3.material.io/styles/color/roles) are
optimized to have enough contrast to be more accessible. See [Science of Color Design](https://material.io/blog/science-of-color-design) for more information about Material's color design.

For more customization, custom palette colors can be also be provided for the
secondary, tertiary, and neutral colors. It is recommended to choose colors that
are contrastful, Material has more detailed guidance for [accessible design](https://m3.material.io/foundations/accessible-design/patterns).

The output of the schematic will create a file named `m3-theme.scss` at the
specified directory or the project root with the generated themes. The exported
themes (`$light-theme` and/or `$dark-theme`) can be provided to component theme
mixins.

```scss
@use '@angular/material' as mat;
@use './path/to/my-theme';

@include mat.core();

html {
  // Apply the light theme by default
  @include mat.core-theme(my-theme.$light-theme);
  @include mat.button-theme(my-theme.$light-theme);
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
* `directory` - Relative path to a directory within the project that the
generated theme file should be created in. Defaults to the project root.
* `themeTypes` - Theme types ('light', 'dark', or 'both') to generate themes for. Defaults to both.
