# Material 3 Custom Theme schematic

```shell
ng generate @angular/material:theme-color
```
## Background
This schematic allows users to create new Material 3 theme palettes based
on custom colors by using [Material Color Utilities](https://github.com/material-foundation/material-color-utilities).
This is an alternative to using the available [predefined theme palettes](https://material.angular.io/guide/theming#prebuilt-color-palettes).

The generated [color palettes](https://m3.material.io/styles/color/roles) are
optimized to have enough contrast to be more accessible. See [Science of Color Design](https://material.io/blog/science-of-color-design)
for more information about Material's color design.

For more customization, custom colors can be also be provided for the
secondary, tertiary, and neutral palette colors. It is recommended to choose colors that
are contrastful. Material has more detailed guidance for [accessible design](https://m3.material.io/foundations/accessible-design/patterns).

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
* `includeHighContrast` - Whether to define high contrast values for the custom colors in the
generated file. For Sass files a mixin is defined, see the [high contrast override mixins section](#high-contrast-override-mixins)
for more information. Defaults to false.
* `directory` - Relative path to a directory within the project that the
generated theme file should be created in. Defaults to the project root.
* `isScss` - Whether to generate output file in Sass or CSS. Angular recommends generating a Sass
file, see the [file output section](#generated-file-output) below for more information. Defaults to
true.

## Generated file output
The result of running the schematic is a new file with the generated custom colors.

Angular recommendeds generating a Sass file since our theming system Sass APIs are supported and
have benefits such as error handling and relate to the [theming documentation](https://material.angular.io/guide/theming).
If there are ever changes to the theming system or system variable names, your styles will continue
to work and be supported. Color palettes get defined in the generated file that you can pass into
the `theme()` mixin in your own theme file. See the [Sass themes section](#sass-themes) for more
information.

You can generate a CSS file which defines all the system variables directly. This allows for
applications that do not use Sass to still interact with our theming. See the [CSS themes section](#css-themes)
for more specific information.

## Sass themes
The output of the schematic will create a file named `_theme-colors.scss` at the specified directory
or the project root. The exported palettes (`$primary-palette` and `$tertiary-palette`) can be
provided to the `theme` mixin within your theme file to use the custom colors.

```scss
@use '@angular/material' as mat;
@use './path/to/_theme-colors' as my-theme; // location of generated file

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

### High contrast override mixins
High contrast override theme mixins are also generated in the file if specified. These mixins
override the system level variables with high contrast equivalent values from your theme. This is
helpful for users who prefer more contrastful colors for either preference or accessibility reasons.

To show the high contrast values when user's specify based on their color system preferences, apply
the `high-contrast-overrides()` mixin from the generated file wrapped inside
`@media (prefers-contrast: more)` in your theme file. You can pass in `light`, `dark`, or
`color-scheme`. To see the high contrast values in your application locally, you can [use Chrome DevTools to emulate
the CSS media features](https://developer.chrome.com/docs/devtools/rendering/emulate-css).

```
@media (prefers-contrast: more) {
  @include my-theme.high-contrast-overrides(light);
}
```

#### Adaptive high contrast colors for explicit light and dark themes
You can manually define the light theme and dark theme separately. This is recommended if you need
granular control over when to show each specific theme in your application. Prior to v19, this was
the only way to create light and dark themes.

In this example, the colors would automatically change between dark and dark high contrast based on
user's contrast preferences.

```scss
@use '@angular/material';
@use './path/to/my-theme'; // location of generated file

html {
  // Apply the dark theme by default
  @include material.theme((
    color: (
      primary: my-theme.$primary-palette,
      tertiary: my-theme.$tertiary-palette,
      theme-type: dark,
    ),
    typography: Roboto,
    density: 0,
  ));

  // Use high contrast dark theme colors when users prefer contrast
  @media (prefers-contrast: more) {
    @include my-theme.high-contrast-overrides(dark);
  }
}
```

#### Adaptive high contrast colors for adaptive themes
The `theme()` mixin can create one theme that detects and adapts to a user if they have a
light or dark theme by defining `color-scheme`. See the [color-scheme documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)
and the [theming guide](https://material.angular.io/guide/theming#supporting-light-and-dark-mode)
for more information.

Apply the `high-contrast-overrides(color-scheme)` mixin wrapped inside `@media (prefers-contrast: more)`
to apply the high contrast colors for the current color-scheme.

In this example, the colors would automatically change between light, light high contrast, dark, and
dark high contrast based on user's preferences.

```scss
@use '@angular/material';
@use './path/to/my-theme'; // location of generated file

html {
  // Must specify color-scheme for theme mixin to automatically work
  color-scheme: light dark;

  // Create one theme that works automatically for light and dark theme
  @include material.theme((
    color: (
      primary: my-theme.$primary-palette,
      tertiary: my-theme.$tertiary-palette,
    ),
    typography: Roboto,
    density: 0,
  ));

  // Use high contrast values when users prefer contrast
  @media (prefers-contrast: more) {
    @include my-theme.high-contrast-overrides(color-scheme);
  }
}
```

## CSS themes
The output of the schematic will create a file named `theme.css` at the specified directory or the
project root. The system variables are split up by color, typography,
elevation, shape, and state variables.

These system variables are used throughout the different components, so changing these values will
reflect across all the components. Some of the color system variables are related to other system
variables, so make sure to change corresponding system variables as well.

### Light and dark themes
Color system variables are defined using the CSS [light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
function.

The generated CSS file sets `color-scheme` to `light` so the colors will appear as a light
theme by default. Changing the value of `color-scheme` to `dark` shows the dark version of your
application.

To use the user's color scheme preferences automatically, set change the value of `color-scheme` to
`light-dark`. See the [color-scheme documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)
for more information.

```css
html {
  /* COLOR SYSTEM VARIABLES */
  color-scheme: light dark; /* Change to `light dark` to automatically toggle between light and dark themes. */

  /* Primary palette variables */
  --mat-sys-primary: light-dark(#984061, #ffb0c8);
  --mat-sys-on-primary: light-dark(#ffffff, #5e1133);
  ...
}
```

To change the color preferences in your application locally, you can [use Chrome DevTools to emulate
the CSS media features](https://developer.chrome.com/docs/devtools/rendering/emulate-css).


### High contrast media query
High contrast values are defined in the generated CSS file if specified. These color values are
wrapped in a `@media (prefers-contrast: more)` so users only see the higher contrast version of the
colors based on their system settings.

```css
html {
  /* COLOR SYSTEM VARIABLES */
  color-scheme: light;

  /* Primary palette variables */
  --mat-sys-primary: light-dark(#984061, #ffb0c8);
  --mat-sys-on-primary: light-dark(#ffffff, #5e1133);
  ...

  @media (prefers-contrast: more) {
    /* Primary palette variables */
    --mat-sys-primary: light-dark(#580b2f, #ffebef);
    --mat-sys-on-primary: light-dark(#ffffff, #000000);
    ...
  }
}
```

To see the high contrast values in your application locally, you can [use Chrome DevTools to emulate
the CSS media features](https://developer.chrome.com/docs/devtools/rendering/emulate-css).
