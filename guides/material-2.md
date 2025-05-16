# Theming Angular Material 2

## What is theming?

Angular Material's theming system lets you customize base, color, typography, and density styles for
components in your application. The theming system is based on Google's
[Material Design 2][material-design-theming] specification.

**This guide refers to Material 2, the previous version of Material. For the
latest Material 3 documentation, see the [theming guide][theming].**

**For information on how to update, see the section
on [how to migrate an app from Material 2 to Material 3](#how-to-migrate-an-app-from-material-2-to-material-3).**

This document describes the concepts and APIs for customizing colors. For typography customization,
see [Angular Material Typography][mat-typography]. For guidance on building components to be
customizable with this system, see [Theming your own components][theme-your-own].

[material-design-theming]: https://m2.material.io/design/material-theming/overview.html
[theming]: https://material.angular.dev/guide/theming
[mat-typography]: https://material.angular.dev/guide/typography
[theme-your-own]: https://material.angular.dev/guide/theming-your-components

### Sass

Angular Material's theming APIs are built with [Sass](https://sass-lang.com). This document assumes
familiarity with CSS and Sass basics, including variables, functions, and mixins.

You can use Angular Material without Sass by using a pre-built theme, described in
[Using a pre-built theme](#using-a-pre-built-theme) below. However, using the library's Sass API
directly gives you the most control over the styles in your application.

## Palettes

A **palette** is a collection of colors representing a portion of color space. Each value in this
collection is called a **hue**. In Material Design, each hues in a palette has an identifier number.
These identifier numbers include 50, and then each 100 value between 100 and 900. The numbers order
hues within a palette from lightest to darkest.

Angular Material represents a palette as a [Sass map][sass-maps]. This map contains the
palette's hues and another nested map of contrast colors for each of the hues. The contrast colors
serve as text color when using a hue as a background color. The example below demonstrates the
structure of a palette. [See the Material Design color system for more background.][spec-colors]

```scss
$m2-indigo-palette: (
 50: #e8eaf6,
 100: #c5cae9,
 200: #9fa8da,
 300: #7986cb,
 // ... continues to 900
 contrast: (
   50: rgba(black, 0.87),
   100: rgba(black, 0.87),
   200: rgba(black, 0.87),
   300: white,
   // ... continues to 900
 )
);
```

[sass-maps]: https://sass-lang.com/documentation/values/maps
[spec-colors]: https://m2.material.io/design/color/the-color-system.html

### Create your own palette

You can create your own palette by defining a Sass map that matches the structure described in the
[Palettes](#palettes) section above. The map must define hues for 50 and each hundred between 100
and 900. The map must also define a `contrast` map with contrast colors for each hue.

You can use [the Material Design palette tool][palette-tool] to help choose the hues in your
palette.

[palette-tool]: https://m2.material.io/design/color/the-color-system.html#tools-for-picking-colors

### Predefined palettes

Angular Material offers predefined palettes based on the 2014 version of the Material Design
spec. See the [Material Design 2014 color palettes][2014-palettes] for a full list.

In addition to hues numbered from zero to 900, the 2014 Material Design palettes each include
distinct _accent_ hues numbered as `A100`, `A200`, `A400`, and `A700`. Angular Material does not
require these hues, but you can use these hues when defining a theme as described in
[Defining a theme](#defining-a-theme) below.

```scss
@use '@angular/material' as mat;

$my-palette: mat.$m2-indigo-palette;
```

[2014-palettes]: https://material.io/archive/guidelines/style/color.html#color-color-palette

## Themes

A **theme** is a collection of color, typography, and density options. Each theme includes three
palettes that determine component colors:

* A **primary** palette for the color that appears most frequently throughout your application
* An **accent**, or _secondary_, palette used to selectively highlight key parts of your UI
* A **warn**, or _error_, palette used for warnings and error states

You can include the CSS styles for a theme in your application in one of two ways: by defining a
custom theme with Sass, or by importing a pre-built theme CSS file.

### Custom themes with Sass

A **theme file** is a Sass file that calls Angular Material Sass mixins to output color,
typography, and density CSS styles.

#### Defining a theme

Angular Material represents a theme as a Sass map that contains your color, typography, and density
choices, as well as some base design system settings. See
[Angular Material Typography][mat-typography] for an in-depth guide to customizing typography. See
[Customizing density](#customizing-density) below for details on adjusting component density.

Constructing the theme first requires defining your primary and accent palettes, with an optional
warn palette. The `m2-define-palette` Sass function accepts a color palette, described in the
[Palettes](#palettes) section above, as well as four optional hue numbers. These four hues
represent, in order: the "default" hue, a "lighter" hue, a "darker" hue, and a "text" hue.
Components use these hues to choose the most appropriate color for different parts of
themselves.

```scss
@use '@angular/material' as mat;

$my-primary: mat.m2-define-palette(mat.$m2-indigo-palette, 500);
$my-accent: mat.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);

// The "warn" palette is optional and defaults to red if not specified.
$my-warn: mat.m2-define-palette(mat.$m2-red-palette);
```

You can construct a theme by calling either `m2-define-light-theme` or `m2-define-dark-theme` with
the result from `m2-define-palette`. The choice of a light versus a dark theme determines the
background and foreground colors used throughout the components.

```scss
@use '@angular/material' as mat;

$my-primary: mat.m2-define-palette(mat.$m2-indigo-palette, 500);
$my-accent: mat.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);

// The "warn" palette is optional and defaults to red if not specified.
$my-warn: mat.m2-define-palette(mat.$m2-red-palette);

$my-theme: mat.m2-define-light-theme((
 color: (
   primary: $my-primary,
   accent: $my-accent,
   warn: $my-warn,
 ),
 typography: mat.m2-define-typography-config(),
 density: 0,
));
```

#### Applying a theme to components

The `core-theme` Sass mixin emits prerequisite styles for common features used by multiple
components, such as ripples. This mixin must be included once per theme.

Each Angular Material component has a mixin for each [theming dimension](#theming-dimensions): base,
color, typography, and density. For example, `MatButton` declares `button-base`, `button-color`,
`button-typography`, and `button-density`. Each mixin emits only the styles corresponding to that
dimension of customization.

Additionally, each component has a "theme" mixin that emits all styles that depend on the theme
config. This theme mixin only emits color, typography, or density styles if you provided a
corresponding configuration to `m2-define-light-theme` or `m2-define-dark-theme`, and it always emits the
base styles.

Apply the styles for each of the components used in your application by including each of their
theme Sass mixins.

```scss
@use '@angular/material' as mat;

$my-primary: mat.m2-define-palette(mat.$m2-indigo-palette, 500);
$my-accent: mat.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);

$my-theme: mat.m2-define-light-theme((
 color: (
   primary: $my-primary,
   accent: $my-accent,
 ),
 typography: mat.m2-define-typography-config(),
 density: 0,
));

// Emit theme-dependent styles for common features used across multiple components.
@include mat.core-theme($my-theme);

// Emit styles for MatButton based on `$my-theme`. Because the configuration
// passed to `m2-define-light-theme` omits typography, `button-theme` will not
// emit any typography styles.
@include mat.button-theme($my-theme);

// Include the theme mixins for other components you use here.
```

As an alternative to listing every component that your application uses, Angular Material offers
Sass mixins that includes styles for all components in the library: `all-component-bases`,
`all-component-colors`, `all-component-typographies`, `all-component-densities`, and
`all-component-themes`. These mixins behave the same as individual component mixins, except they
emit styles for `core-theme` and _all_ 35+ components in Angular Material. Unless your application
uses every single component, this will produce unnecessary CSS.

```scss
@use '@angular/material' as mat;

$my-primary: mat.m2-define-palette(mat.$m2-indigo-palette, 500);
$my-accent: mat.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);

$my-theme: mat.m2-define-light-theme((
 color: (
   primary: $my-primary,
   accent: $my-accent,
 ),
 typography: mat.m2-define-typography-config(),
 density: 0,
));

@include mat.all-component-themes($my-theme);
```

To include the emitted styles in your application, [add your theme file to the `styles` array of
your project's `angular.json` file][adding-styles].

[adding-styles]: https://angular.dev/reference/configs/workspace-config#styles-and-scripts-configuration

#### Theming dimensions

Angular Material themes are divided along four dimensions: base, color, typography, and density.

##### Base

Common base styles for the design system. These styles don't change based on your configured
colors, typography, or density, so they only need to be included once per application. These
mixins include structural styles such as border-radius, border-width, etc. All components have a base
mixin that can be used to include its base styles. (For example,
`@include mat.checkbox-base($theme)`)

##### Color

Styles related to the colors in your application. These style should be included at least once in
your application. Depending on your needs, you may need to include these styles multiple times
with different configurations. (For example, if your app supports light and dark theme colors.)
All components have a color mixin that can be used to include its color styles. (For example,
`@include mat.checkbox-color($theme)`)

##### Typography

Styles related to the fonts used in your application, including the font family, size, weight,
line-height, and letter-spacing. These style should be included at least once in your application.
Depending on your needs, you may need to include these styles multiple times with different
configurations. (For example, if your app supports reading content in either a serif or sans-serif
font.) All components  have a typography mixin that can be used to include its typography
styles. (For example, `@include mat.checkbox-typography($theme)`)

##### Density

Styles related to the size and spacing of elements in your application. These style should be
included at least once in your application. Depending on your needs, you may need to include these
styles multiple times with different configurations. (For example, if your app supports both a
normal and compact mode). All components have a density mixin that can be used to include its
density styles. (For example, `@include mat.checkbox-density($theme)`)

##### Theme mixin

All components also support a theme mixin that can be used to include the component's styles for all
theme dimensions at once. (For example, `@include mat.checkbox-theme($theme)`).

The recommended approach is to rely on the `theme` mixins to lay down your base styles, and if
needed use the single dimension mixins to override particular aspects for parts of your app (see the
section on [Multiple themes in one file](#multiple-themes-in-one-file).)

### Using a pre-built theme

Angular Material includes four pre-built theme CSS files, each with different palettes selected.
You can use one of these pre-built themes if you don't want to define a custom theme with Sass.

| Theme                  | Light or dark? | Palettes (primary, accent, warn) |
|------------------------|----------------|----------------------------------|
| `deeppurple-amber.css` | Light          | deep-purple, amber, red          |
| `indigo-pink.css`      | Light          | indigo, pink, red                |
| `pink-bluegrey.css`    | Dark           | pink, blue-grey, red              |
| `purple-green.css`     | Dark           | purple, green, red               |

These files include the CSS for every component in the library. To include only the CSS for a subset
of components, you must use the Sass API detailed in [Defining a theme](#defining-a-theme) above.
You can [reference the source code for these pre-built themes][prebuilt] to see examples of complete
theme definitions.

You can find the pre-built theme files in the "prebuilt-themes" directory of Angular Material's
npm package (`@angular/material/prebuilt-themes`). To include the pre-built theme in your
application, [add your chosen CSS file to the `styles` array of your project's `angular.json`
file][adding-styles].

[prebuilt]: https://github.com/angular/components/blob/main/src/material/core/theming/prebuilt

### Defining multiple themes

Using the Sass API described in [Defining a theme](#defining-a-theme), you can also define
_multiple_ themes by repeating the API calls multiple times. You can do this either in the same
theme file or in separate theme files.

#### Multiple themes in one file

Defining multiple themes in a single file allows you to support multiple themes without having to
manage loading of multiple CSS assets. The downside, however, is that your CSS will include more
styles than necessary.

To control which theme applies when, `@include` the mixins only within a context specified via
CSS rule declaration. See the [documentation for Sass mixins][sass-mixins] for further background.

[sass-mixins]: https://sass-lang.com/documentation/at-rules/mixin

```scss
@use '@angular/material' as mat;

// Define a dark theme
$dark-theme: mat.m2-define-dark-theme((
 color: (
   primary: mat.m2-define-palette(mat.$m2-pink-palette),
   accent: mat.m2-define-palette(mat.$m2-blue-grey-palette),
 ),
  // Only include `typography` and `density` in the default dark theme.
  typography: mat.m2-define-typography-config(),
  density: 0,
));

// Define a light theme
$light-theme: mat.m2-define-light-theme((
 color: (
   primary: mat.m2-define-palette(mat.$m2-indigo-palette),
   accent: mat.m2-define-palette(mat.$m2-pink-palette),
 ),
));

// Apply the dark theme by default
@include mat.core-theme($dark-theme);
@include mat.button-theme($dark-theme);

// Apply the light theme only when the user prefers light themes.
@media (prefers-color-scheme: light) {
 // Use the `-color` mixins to only apply color styles without reapplying the same
 // typography and density styles.
 @include mat.core-color($light-theme);
 @include mat.button-color($light-theme);
}
```

#### Multiple themes across separate files

You can define multiple themes in separate files by creating multiple theme files per
[Defining a theme](#defining-a-theme), adding each of the files to the `styles` of your
`angular.json`. However, you must additionally set the `inject` option for each of these files to
`false` in order to prevent all the theme files from being loaded at the same time. When setting
this property to `false`, your application becomes responsible for manually loading the desired
file. The approach for this loading depends on your application.

### Application background color

By default, Angular Material does not apply any styles to your DOM outside
its own components. If you want to set your application's background color
to match the components' theme, you can either:
1. Put your application's main content inside `mat-sidenav-container`, assuming you're using
   `MatSidenav`, or
2. Apply the `mat-app-background` CSS class to your main content root element (typically `body`).

### Scoping style customizations

You can use Angular Material's Sass mixins to customize component styles within a specific scope
in your application. The CSS rule declaration in which you include a Sass mixin determines its scope.
The example below shows how to customize the color of all buttons inside elements marked with the
`.my-special-section` CSS class.

```scss
@use '@angular/material' as mat;

.my-special-section {
 $special-primary: mat.m2-define-palette(mat.$m2-orange-palette);
 $special-accent: mat.m2-define-palette(mat.$m2-brown-palette);
 $special-theme: mat.m2-define-dark-theme((
   color: (primary: $special-primary, accent: $special-accent),
 ));

 @include mat.button-color($special-theme);
}
```

## Customizing density

Angular Material's density customization is based on the
[Material Design density guidelines][material-density]. This system defines a scale where zero
represents the default density. You can decrement the number for _more density_ and increment the
number for _less density_.

The density system is based on a *density scale*. The scale starts with the
default density of `0`. Each whole number step down (`-1`, `-2`, etc.) reduces
the affected sizes by `4px`, down to the minimum size necessary for a component to render
coherently.

Components that appear in task-based or pop-up contexts, such as `MatDatepicker`, don't change their
size via the density system. The [Material Design density guidance][material-density] explicitly
discourages increasing density for such interactions because they don't compete for space in the
application's layout.

You can apply custom density setting to the entire library or to individual components using their
density Sass mixins.

```scss
// You can set a density setting in your theme to apply to all components.
$dark-theme: mat.m2-define-dark-theme((
  color: ...,
  typography: ...,
  density: -2,
));

// Or you can selectively apply the Sass mixin to affect only specific parts of your application.
.the-dense-zone {
  @include mat.button-density(-1);
}
```

[material-density]: https://m2.material.io/design/layout/applying-density.html

## Strong focus indicators

By default, most components indicate browser focus by changing their background color as described
by the Material Design specification. This behavior, however, can fall short of accessibility
requirements, such as [WCAG][], which require a stronger indication of browser focus.

Angular Material supports rendering highly visible outlines on focused elements. Applications can
enable these strong focus indicators via two Sass mixins:
`strong-focus-indicators` and `strong-focus-indicators-theme`.

The `strong-focus-indicators` mixin emits structural indicator styles for all components. This mixin
should be included exactly once in an application, similar to the `core` mixin described above.

The `strong-focus-indicators-theme` mixin emits only the indicator's color styles. This mixin should
be included once per theme, similar to the theme mixins described above. Additionally, you can use
this mixin to change the color of the focus indicators in situations in which the default color
would not contrast sufficiently with the background color.

The following example includes strong focus indicator styles in an application alongside the rest of
the custom theme API.

```scss
@use '@angular/material' as mat;

@include mat.strong-focus-indicators();

$my-primary: mat.m2-define-palette(mat.$m2-indigo-palette, 500);
$my-accent: mat.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);

$my-theme: mat.m2-define-light-theme((
 color: (
   primary: $my-primary,
   accent: $my-accent,
 )
));

@include mat.all-component-themes($my-theme);
@include mat.strong-focus-indicators-theme($my-theme);
```

### Customizing strong focus indicators

You can pass a configuration map to `strong-focus-indicators` to customize the appearance of the
indicators. This configuration includes `border-style`, `border-width`, and `border-radius`.

You also can customize the color of indicators with `strong-focus-indicators-theme`. This mixin
accepts either a theme, as described earlier in this guide, or a CSS color value. When providing a
theme, the indicators will use the default hue of the primary palette.

The following example includes strong focus indicator styles with custom settings alongside the rest
of the custom theme API.

```scss
@use '@angular/material' as mat;

@include mat.strong-focus-indicators((
  border-style: dotted,
  border-width: 4px,
  border-radius: 2px,
));

$my-primary: mat.m2-define-palette(mat.$m2-indigo-palette, 500);
$my-accent: mat.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);

$my-theme: mat.m2-define-light-theme((
 color: (
   primary: $my-primary,
   accent: $my-accent,
 )
));

@include mat.all-component-themes($my-theme);
@include mat.strong-focus-indicators-theme(purple);
```

[WCAG]: https://www.w3.org/WAI/standards-guidelines/wcag/glance/

## Theming and style encapsulation

Angular Material assumes that, by default, all theme styles are loaded as global CSS. If you want
to use [Shadow DOM][shadow-dom] in your application, you must load the theme styles within each
shadow root that contains an Angular Material component. You can accomplish this by manually loading
the CSS in each shadow root, or by using [Constructable Stylesheets][constructable-css].

[shadow-dom]: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM
[constructable-css]: https://developers.google.com/web/updates/2019/02/constructable-stylesheets

## User preference media queries

Angular Material does not apply styles based on user preference media queries, such as
`prefers-color-scheme` or `prefers-contrast`. Instead, Angular Material's Sass mixins give you the
flexibility to apply theme styles to based on the conditions that make the most sense for your
users. This may mean using media queries directly or reading a saved user preference.

## Style customization outside the theming system

Angular Material supports customizing color, typography, and density as outlined in this document.
Angular strongly discourages, and does not directly support, overriding component CSS outside the
theming APIs described above. Component DOM structure and CSS classes are considered private
implementation details that may change at any time.

## Theming your components

### Reading values from a theme

As described in this guide, a theme is a Sass map that contains style values to
customize components. Angular Material provides APIs for reading values from this data structure.

#### Reading color values

To read color values from a theme, you can use the `get-theme-color` Sass function. This function
supports reading colors for both the app color palettes (primary, accent, and warn), as well as the
foreground and background palettes. `get-theme-color` takes three arguments: The theme to read from,
the name of the palette, and the name of the color.

Each of the color palettes (primary, accent, and warn) supports reading the following named colors:

| Color Name       | Description                                                                                                                                                        |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| default          | The default color from this palette                                                                                                                                |
| lighter          | A lighter version of the color for this palette                                                                                                                    |
| darker           | A darker version of the color for this palette                                                                                                                     |
| text             | The text color for this palette                                                                                                                                    |
| default-contrast | A color that stands out against the this palette's default color                                                                                                   |
| lighter-contrast | A color that stands out against the this palette's lighter color                                                                                                   |
| darker-contrast  | A color that stands out against the this palette's darker color                                                                                                    |
| [hue]            | The [hue] color for the palette.<br />[hue] can be one of: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, A100, A200, A400, A700                                 |
| [hue]-contrast   | A color that stands out against the [hue] color for the palette.<br />[hue] can be one of: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, A100, A200, A400, A700 |

The background palette supports reading the following named colors:

| Color Name               | Description                                        |
|--------------------------|----------------------------------------------------|
| status-bar               | The background color for a status bar              |
| app-bar                  | The background color for an app bar                |
| background               | The background color for the app                   |
| hover                    | The background color of a hover overlay            |
| card                     | The background color of a card                     |
| dialog                   | The background color of a dialog                   |
| raised-button            | The background color of a raised button            |
| selected-button          | The background color of a selected button          |
| selected-disabled-button | The background color of a selected disabled button |
| disabled-button          | The background color of a disabled button          |
| focused-button           | The background color of a focused button           |
| disabled-button-toggle   | The background color of a disabled button toggle   |
| unselected-chip          | The background color of an unselected chip         |
| disabled-list-option     | The background color of a disabled list option     |
| tooltip                  | The background color of a tooltip                  |

The foreground palette supports reading the following named colors:

| Color name        | Description                                                                                              |
|-------------------|----------------------------------------------------------------------------------------------------------|
| base              | The base foreground color, can be used to for color mixing or creating a custom opacity foreground color |
| divider           | The color of a divider                                                                                   |
| dividers          | (Alternate name for divider)                                                                             |
| disabled-text     | The color for disabled text                                                                              |
| disabled          | (Alternate name for disabled-text)                                                                       |
| disabled-button   | The color for disabled button text                                                                       |
| elevation         | The color elevation shadows                                                                              |
| hint-text         | The color for hint text                                                                                  |
| secondary-text    | The color for secondary text                                                                             |
| icon              | The color for icons                                                                                      |
| icons             | (Alternate name for icon)                                                                                |
| text              | The color for text                                                                                       |                                                                         |

In addition to reading particular colors, you can use the `get-theme-type` Sass function to
determine the type of theme (either light or dark). This function takes a single argument, the
theme, and returns either `light` or `dark`.

See the below example of reading some colors from a theme:

```scss
$theme: mat.m2-define-dark-theme(...);

$primary-default: mat.get-theme-color($theme, primary, default);
$accent-a100: mat.get-theme-color($theme, accent, A100);
$warn-500-contrast: mat.get-theme-color($theme, warn, 500-contrast);
$foreground-text: mat.get-theme-color($theme, foreground, on-surface);
$background-card: mat.get-theme-color(inspection.get-theme-color($theme, background, surface));
$type: mat.get-theme-type($theme);
$custom-background: if($type == dark, #030, #dfd);
```

#### Reading typography values

To read typography values from a theme, you can use the `get-theme-typography` Sass function. This
function supports reading typography properties from the typography levels defined in the theme.
There are two ways to call the function.

The first way to call it is by passing just the theme and the typography level to get a shorthand
`font` property based on the settings for that level. (Note: `letter-spacing` cannot be expressed in
the `font` shorthand, so it must be applied separately).

The second way to call it is by passing the theme, typography level, and the specific font property
you want: `font-family`, `font-size`, `font-weight`, `line-height`, or `letter-spacing`.

The available typography levels are:

| Name       | Description                                                          |
|------------|----------------------------------------------------------------------|
| headline-1 | One-off header, usually at the top of the page (e.g. a hero header). |
| headline-2 | One-off header, usually at the top of the page (e.g. a hero header). |
| headline-3 | One-off header, usually at the top of the page (e.g. a hero header). |
| headline-4 | One-off header, usually at the top of the page (e.g. a hero header). |
| headline-5 | Section heading corresponding to the `<h1>` tag.                     |
| headline-6 | Section heading corresponding to the `<h2>` tag.                     |
| subtitle-1 | Section heading corresponding to the `<h3>` tag.                     |
| subtitle-2 | Section heading corresponding to the `<h4>` tag.                     |
| body-1     | Base body text.                                                      |
| body-2     | Secondary body text.                                                 |
| caption    | Smaller body and hint text.                                          |
| button     | Buttons and anchors.                                                 |

See the below example of reading some typography settings from a theme:

```scss
$theme: mat.m2-define-dark-theme(...);

body {
  font: mat.get-theme-typography($theme, body-1);
  letter-spacing: mat.get-theme-typography($theme, body-1, letter-spacing);
}
```

#### Reading density values

To read the density scale from a theme, you can use the `get-theme-density` Sass function. This
function takes a theme and returns the density scale (0, -1, -2, -3, -4, or -5).

See the below example of reading the density scale from a theme:

```scss
$theme: mat.m2-define-dark-theme(...);

$density-scale: mat.get-theme-density($theme);
```

### Checking what dimensions are configured for a theme

Depending on how a theme was created, it may not have configuration data for all theming dimensions
(base, color, typography, density). You can check if a theme has a configuration for a particular
dimension by calling the `theme-has` Sass function, passing the theme and the dimension to check.

See the below example of checking the configured dimensions for a theme:

```scss
$theme: mat.m2-define-dark-theme(...);

$has-base: mat.theme-has($theme, base);
$has-color: mat.theme-has($theme, color);
$has-typography: mat.theme-has($theme, typography);
$has-density: mat.theme-has($theme, density);
```

### Separating theme styles

Angular Material components each have a Sass file that defines mixins for customizing
that component's color and typography. For example, `MatButton` has mixins for `button-color` and
`button-typography`. Each mixin emits all color and typography styles for that component,
respectively.

You can mirror this structure in your components by defining your own mixins. These mixins
should accept an Angular Material theme, from which they can read color and typography values. You
can then include these mixins in your application along with Angular Material's own mixins.

## Customizing Typography

### Including font assets

Angular Material's typography APIs let you specify any font-face. The default font-face value is
configured to [Google's Roboto font][roboto] with the 300, 400, and 500 font-weight styles. To use
Roboto, your application must load the font, which is not included with Angular Material. The
easiest way to load Roboto, or any other custom font, is by using Google Fonts. The following
snippet can be placed in your application's `<head>` to load Roboto from Google Fonts.

```html
<link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
```

See [Getting Started with the Google Fonts API][fonts-api] for more about using Google Fonts. Also
note that, by default, [the Angular CLI inlines assets from Google Fonts to reduce render-blocking
requests][font-inlining].

[roboto]: https://fonts.google.com/share?selection.family=Roboto:wght@300;400;500
[fonts-api]: https://developers.google.com/fonts/docs/getting_started
[font-inlining]: https://angular.dev/reference/configs/workspace-config#fonts-optimization-options

### Typography levels

A **typography level** is a collection of typographic styles that corresponds to a specific
part of an application's structure, such as a header. Each level includes styles for font family,
font weight, font size, and letter spacing. Angular Material uses the [typography levels
from the 2018 version of the Material Design specification][2018-typography], outlined in the
table below.

| Name            | Description                                                  |
|-----------------|--------------------------------------------------------------|
| `headline-1`     | One-off header, usually at the top of the page (e.g. a hero header). |
| `headline-2`     | One-off header, usually at the top of the page (e.g. a hero header). |
| `headline-3`     | One-off header, usually at the top of the page (e.g. a hero header). |
| `headline-4`     | One-off header, usually at the top of the page (e.g. a hero header). |
| `headline-5`     | Section heading corresponding to the `<h1>` tag.             |
| `headline-6`     | Section heading corresponding to the `<h2>` tag.             |
| `subtitle-1`     | Section heading corresponding to the `<h3>` tag.             |
| `subtitle-2`     | Section heading corresponding to the `<h4>` tag.             |
| `body-1`         | Base body text.                                              |
| `body-2`         | Secondary body text.                                         |
| `caption`        | Smaller body and hint text.                                  |
| `button`         | Buttons and anchors.                                         |

[2018-typography]: https://m2.material.io/design/typography/the-type-system.html#type-scale

#### Define a level

You can define a typography level with the `m2-define-typography-level` Sass function. This function
accepts, in order, CSS values for `font-size`, `line-height`, `font-weight`, `font-family`, and
`letter-spacing`. You can also specify the parameters by name, as demonstrated in the example below.

```scss
@use '@angular/material' as mat;

$my-custom-level: mat.m2-define-typography-level(
  $font-family: Roboto,
  $font-weight: 400,
  $font-size: 1rem,
  $line-height: 1,
  $letter-spacing: normal,
);
```

### Typography config

A **typography config** is a collection of all typography levels. Angular Material represents this
config as a Sass map. This map contains the styles for each level, keyed by name. You can create
a typography config with the `m2-define-typography-config` Sass function. Every parameter for
`m2-define-typography-config` is optional; the styles for a level will default to Material Design's
baseline if unspecified.

```scss
@use '@angular/material' as mat;

$my-custom-typography-config: mat.m2-define-typography-config(
  $headline-1: mat.m2-define-typography-level(112px, 112px, 300, $letter-spacing: -0.05em),
  $headline-2: mat.m2-define-typography-level(56px, 56px, 400, $letter-spacing: -0.02em),
  $headline-3: mat.m2-define-typography-level(45px, 48px, 400, $letter-spacing: -0.005em),
  $headline-4: mat.m2-define-typography-level(34px, 40px, 400),
  $headline-5: mat.m2-define-typography-level(24px, 32px, 400),
  // ...
);
```

#### Typography configs and theming

You can provide a typography config when defining a theme to customize typographic styles. See the [theming guide][theming-system] for details on custom themes.

The following example shows a typical theme definition and a "kids theme" that only applies when
the `".kids-theme"` CSS class is present. You can [see the theming guide for more guidance on
defining multiple themes](#defining-multiple-themes).

```scss
@use '@angular/material' as mat;

$my-primary: mat.m2-define-palette(mat.$indigo-palette, 500);
$my-accent: mat.m2-define-palette(mat.$pink-palette, A200, A100, A400);
$my-typography: mat.m2-define-typography-config();

$my-theme: mat.m2-define-light-theme((
 color: (
   primary: $my-primary,
   accent: $my-accent,
 ),
  typography: $my-typography,
));

@include mat.all-component-themes($my-theme);

.kids-theme {
  $kids-primary: mat.m2-define-palette(mat.$cyan-palette);
  $kids-accent: mat.m2-define-palette(mat.$yellow-palette);

  // Typography config based on the default, but using "Comic Sans" as the
  // default font family for all levels.
  $kids-typography: mat.m2-define-typography-config(
    $font-family: 'Comic Sans',
  );

  $kids-theme: mat.m2-define-light-theme((
   color: (
     primary: $kids-primary,
     accent: $kids-accent,
   ),
   typography: $kids-typography,
  ));

  @include mat.all-component-themes($kids-theme);
}
```

Each component also has a `typography` mixin that emits only the typography styles for that
component, based on a provided typography config. The following example demonstrates applying
typography styles only for the button component.

```scss
@use '@angular/material' as mat;

$kids-typography: mat.m2-define-typography-config(
  // Specify "Comic Sans" as the default font family for all levels.
  $font-family: 'Comic Sans',
);

// Now we have sweet buttons with Comic Sans.
@include mat.button-typography($kids-typography);
```

### Using typography styles in your application

In addition to styles shared between components, the `typography-hierarchy` mixin includes CSS
classes for styling your application. These CSS classes correspond to the typography levels in your
typography config. This mixin also emits styles for native header elements scoped within the
`.mat-typography` CSS class.

```scss
@use '@angular/material' as mat;

// Use the default configuration.
$my-typography: mat.m2-define-typography-config();
@include mat.typography-hierarchy($my-typography);
```

The table below lists the CSS classes emitted and the native elements styled.

| CSS class                                | Level name     | Native elements |
|------------------------------------------|----------------|-----------------|
| `.mat-headline-1`                        | `headline-1`   | None            |
| `.mat-headline-2`                        | `headline-2`   | None            |
| `.mat-headline-3`                        | `headline-3`   | None            |
| `.mat-headline-4`                        | `headline-4`   | None            |
| `.mat-h1` or `.mat-headline-5`           | `headline-5`   | `<h1>`          |
| `.mat-h2` or `.mat-headline-6`           | `headline-6`   | `<h2>`          |
| `.mat-h3` or `.mat-subtitle-1`           | `subtitle-1`   | `<h3>`          |
| `.mat-h4` or `.mat-body-1`               | `body-1`       | `<h4>`          |
| `.mat-h5`                                | None           | `<h5>`          |
| `.mat-h6`                                | None           | `<h6>`          |
| `.mat-body` or `.mat-body-2`             | `body-2`       | Body text       |
| `.mat-body-strong` or `.mat-subtitle-2`  | `subtitle-2`   | None            |
| `.mat-small` or `.mat-caption`           | `caption`      | None            |

In addition to the typographic styles, these style rules also include a `margin-bottom` for
headers and paragraphs. For `body` styles, text is styled within the provided CSS selector.

The `.mat-h5` and `.mat-h6` styles don't directly correspond to a specific Material Design
typography level. The `.mat-h5` style uses the `body-2` level with the font-size scaled down by
`0.83`. The `.mat-h6` style uses the `body-2` level with the font-size scaled down by `0.67`.

The `button` and `input` typography levels do not map to CSS classes.

The following example demonstrates usage of the typography styles emitted by the
`typography-hierarchy` mixin.

```html
<body>
  <!-- This header will *not* be styled because it is outside `.mat-typography` -->
  <h1>Top header</h1>

  <!-- This paragraph will be styled as `body-1` via the `.mat-body` CSS class applied -->
  <p class="mat-body">Introductory text</p>

  <div class="mat-typography">
    <!-- This header will be styled as `title` because it is inside `.mat-typography` -->
    <h2>Inner header</h2>

    <!-- This paragraph will be styled as `body-1` because it is inside `.mat-typography` -->
    <p>Some inner text</p>
  </div>
</body>
```

#### Reading typography values from a config

It is possible to read typography properties from a theme for use in your own components. For more
information about this see our section on [Theming your own components](https://material.angular.dev/guide/material-2-theming#theming-your-components),

### Step-by-step example

To illustrate participation in Angular Material's theming system, we can look at an example of a
custom carousel component. The carousel starts with a single file, `carousel.scss`, that contains
structural, color, and typography styles. This file is included in the `styleUrls` of the component.

```scss
// carousel.scss

.my-carousel {
  display: flex;
  font-family: serif;
}

.my-carousel-button {
  border-radius: 50%;
  color: blue;
}
```

#### Step 1: Extract theme-based styles to a separate file

To change this file to participate in Angular Material's theming system, we split the styles into
two files, with the color and typography styles moved into mixins. By convention, the new file
name ends with `-theme`. Additionally, the file starts with an underscore (`_`), indicating that
this is a Sass partial file. See the [Sass documentation][sass-partials] for more information about
partial files.

[sass-partials]: https://sass-lang.com/guide#topic-4

```scss
// carousel.scss

.my-carousel {
  display: flex;
}

.my-carousel-button {
  border-radius: 50%;
}
```

```scss
// _carousel-theme.scss

@mixin color($theme) {
  .my-carousel-button {
    color: blue;
  }
}

@mixin typography($theme) {
  .my-carousel {
    font-family: serif;
  }
}
```

#### Step 2: Use values from the theme

Now that theme theme-based styles reside in mixins, we can extract the values we need from the
theme passed into the mixins.

```scss
// _carousel-theme.scss

@use 'sass:map';
@use '@angular/material' as mat;

@mixin color($theme) {
  .my-carousel-button {
    // Read the 500 hue from the primary color palette.
    color: mat.get-theme-color($theme, primary, 500);
  }
}

@mixin typography($theme) {
  .my-carousel {
    // Get the headline font from the theme.
    font: mat.get-theme-typography($theme, headline-1);
  }
}
```

#### Step 3: Add a theme mixin

For convenience, we can add a `theme` mixin that includes both color and typography.
This theme mixin should only emit the styles for each color and typography, respectively, if they
have a config specified.

```scss
// _carousel-theme.scss

@use 'sass:map';
@use '@angular/material' as mat;

@mixin color($theme) {
  .my-carousel-button {
    // Read the 500 hue from the primary color palette.
    color: mat.get-theme-color($theme, primary, 500);
  }
}

@mixin typography($theme) {
  .my-carousel {
    // Get the headline font from the theme.
    font: mat.get-theme-typography($theme, headline-1);
  }
}

@mixin theme($theme) {
  @if mat.theme-has($theme, color) {
    @include color($theme);
  }

  @if mat.theme-has($theme, typography) {
    @include typography($theme);
  }
}
```

#### Step 4: Include the theme mixin in your application

Now that you've defined the carousel component's theme mixin, you can include this mixin along with
the other theme mixins in your application.

```scss
@use '@angular/material' as mat;
@use './path/to/carousel-theme' as carousel;

$my-primary: mat.m2-define-palette(mat.$m2-indigo-palette, 500);
$my-accent: mat.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);

$my-theme: mat.m2-define-light-theme((
  color: (
    primary: $my-primary,
    accent: $my-accent,
  ),
  typography: mat.m2-define-typography-config(
    $font-family: serif,
  ),
));

@include mat.all-component-themes($my-theme);
@include carousel.theme($my-theme);
```

## How to migrate an app from Material 2 to Material 3

Angular Material does not offer an automated migration from M2 to M3 because the design of your app
is subjective. Material Design offers general principles and constraints to guide you, but
ultimately it is up to you to decide how to apply those in your app. That said, Angular Material's M3 themes were designed with maximum compatibility in mind.

### Update your components that use Angular Material themes to be compatible with Material 3

In order to facilitate a smooth transition from M2 to M3, it may make sense to have your components
support both M2 and M3 themes. Once the entire app is migrated, the support for M2 themes can be
removed.

The simplest way to accomplish this is by checking the theme version and emitting different styles
for M2 vs M3. You can check the theme version using the `get-theme-version` function from
`@angular/material`. The function will return `0` for an M2 theme or `1` for an M3 theme (see
[theme your own components using a Material 3 theme](https://material.angular.dev/guide/theming#theme-your-own-components-using-a-material-3-theme)
for how to read values from an M3 theme).

```scss
@use '@angular/material' as mat;

@mixin my-comp-theme($theme) {
  @if (mat.get-theme-version($theme) == 1) {
    // Add your new M3 styles here.
  } @else {
    // Keep your old M2 styles here.
  }
}
```

### Pass a new M3 theme in your global theme styles

Create a new M3 theme object using `define-theme` and pass it everywhere you were previously passing
your M2 theme. All Angular Material mixins that take an M2 theme are compatible with M3 themes as
well.

### Update usages of APIs that are not supported for Material 3 themes

Because Material 3 is implemented as an alternate theme for the same components used for Material 2,
the APIs for both are largely the same. However, there are a few differences to be aware of:

- M3 expects that any `@include` of the `-theme`, `-color`, `-typography`, `-density`, or `-base`
  mixins should be wrapped in a selector. If your app includes such an `@include` at the root level,
  we recommend wrapping it in `html { ... }`
- M3 has a different API for setting the color variant of a component (see
  [using component color variants](#optional-add-backwards-compatibility-styles-for-color-variants)
  for more).
- The `backgroundColor` property of `<mat-tab-group>` is not supported, and should not be used with
  M3 themes.
- The `appearance="legacy"` variant of `<mat-button-toggle>` is not supported, and should not be
  used with M3 themes.
- For M3 themes, calling `all-component-typographies` does _not_ emit the `typography-hierarchy`
  styles, as this would violate M3's guarantee to not add selectors. Instead, the
  `typography-hierarchy` mixin must be explicitly called if you want these styles in your app.
- The `typography-hierarchy` mixin outputs CSS class names that correspond to the names of M3
  typescale levels rather than M2 typescale levels. If you were relying on the M2 classes to style
  your app, you may need to update the class names.

### (Optional) add backwards compatibility styles for color variants

We recommend _not_ relying on the `color="primary"`, `color="accent"`, or `color="warn"` options
that are offered by a number of Angular Material components for M2 themes. However, if you want to
quickly update to M3 and are willing to accept the extra CSS generated for these variants, you can
enable backwards compatibility styles that restore the behavior of this API. Call the
`color-variants-backwards-compatibility` mixin from `@angular/material` with the M3 theme you want
to generate color variant styles for.

<!-- TODO(mmalerba): Upgrade to embedded example -->

```scss
@use '@angular/material' as mat;

$theme: mat.define-theme();

html {
  @include mat.all-component-themes($theme);
  @include mat.color-variants-backwards-compatibility($theme);
}
```

### (Optional) add backwards compatibility styles for typography hierarchy

Calling the `typography-hierarchy` mixin with an M3 theme generates styles for CSS classes that
match the names of M3 typescale names (e.g. `.mat-headline-large`) rather than ones that match M2
typescale names (`.mat-headline-1`). If you were using the M2 class names in your app we recommend
updating all usages to one of the new class names. However, to make migration easier, the
`typography-hierarchy` mixin does support emitting the old class names in addition to the new ones.
We have made a best effort to map the M2 classes to reasonable equivalents in M3. To enable these
styles, pass an additional argument `$back-compat: true` to the mixin.

<!-- TODO(mmalerba): Upgrade to embedded example -->

```scss
@use '@angular/material' as mat;

$theme: mat.define-theme();

@include mat.typography-hierarchy($theme, $back-compat: true);
```
