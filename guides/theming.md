# Theming Angular Material

## What is theming?

Angular Material's theming system lets you customize base, color, typography, and density styles for components in your application. The theming system is based on Google's
[Material Design 3][material-design-theming] specification which is the latest
iteration of Google's open-source design system, Material Design.

**For Material 2 specific documentation and how to update to Material 3, see the
[Material 2 guide][material-2].**

This document describes the concepts and APIs for customizing colors. For typography customization,
see [Angular Material Typography][mat-typography]. For guidance on building components to be
customizable with this system, see [Theming your own components][theme-your-own].

[material-design-theming]: https://m3.material.io/
[material-2]: https://material.angular.io/guide/material-2-theming
[mat-typography]: https://material.angular.io/guide/typography
[theme-your-own]: https://material.angular.io/guide/theming-your-components

### Sass

Angular Material's theming APIs are built with [Sass](https://sass-lang.com). This document assumes
familiarity with CSS and Sass basics, including variables, functions, and mixins.

### Custom themes with Sass

A **theme file** is a Sass file that calls Angular Material Sass mixins to output color,
typography, and density CSS styles.

#### The `core` mixin

Angular Material defines a mixin named `core` that includes prerequisite styles for common
features used by multiple components, such as ripples. The `core` mixin must be included exactly
once for your application, even if you define multiple themes. Including the `core` mixin multiple
times will result in duplicate CSS in your application.

```scss
@use '@angular/material' as mat;

@include mat.core();
```

#### Defining a theme

Angular Material represents a theme as a Sass map that contains your color, typography, and density
choices, as well as some base design system settings.

The simplest usage of the API, `$theme: mat.define-theme()` defines a theme with default values.
However, `define-theme` allows you to configure the appearance of your
Angular Material app along three theming dimensions: color, typography, and density, by passing a
theme configuration object. The configuration object may have the following properties.

| Property     | Description                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| `color`      | [Optional] A map of color options. See [customizing your colors](#customizing-your-colors) for details.         |
| `typography` | [Optional] A map of typography options. See [customizing your typography](#customizing-your-typography) for details. |
| `density`    | [Optional] A map of density options. See [customizing your density](#customizing-your-density) for details.     |

<!-- TODO(mmalerba): Upgrade to embedded example -->

```scss
@use '@angular/material' as mat;

$theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: mat.$violet-palette,
  ),
  typography: (
    brand-family: 'Comic Sans',
    bold-weight: 900
  ),
  density: (
    scale: -1
  )
));
```

#### Customizing your colors

The following aspects of your app's colors can be customized via the `color` property of the theme
configuration object (see the [M3 color spec](https://m3.material.io/styles/color/roles) to learn
more about these terms):

| Color Property | Description                                                                                                                                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `theme-type`   | [Optional] Specifies the type of theme, `light` or `dark`. The choice of a light versus a dark theme determines the background and foreground colors used throughout the components.                                                                                                                                                                                                               |
| `primary`      | [Optional] Specifies the palette to use for the app's primary color palette. (Note: the secondary, neutral, and neutral-variant palettes described in the M3 spec will be automatically chosen based on your primary palette, to ensure a harmonious color combination). |
| `tertiary`     | [Optional] Specifies the palette to use for the app's tertiary color palette.                                                                                                                                                                                            |

##### Pre-built themes

There are a number of color palettes available in `@angular/material` that can be
used with the `primary` and `tertiary` options:

- `$red-palette`
- `$green-palette`
- `$blue-palette`
- `$yellow-palette`
- `$cyan-palette`
- `$magenta-palette`
- `$orange-palette`
- `$chartreuse-palette`
- `$spring-green-palette`
- `$azure-palette`
- `$violet-palette`
- `$rose-palette`

##### Custom theme
Alternatively, a theme can be generated with a custom color with the following schematic:

```shell
ng generate @angular/material:m3-theme
```

This schematic integrates with [Material Color Utilities](https://github.com/material-foundation/material-color-utilities) to build a theme based on a generated set of palettes based on a single color. Optionally you can provide additional custom colors for the secondary, tertiary, and neutral palettes.

The output of the schematic is a new Sass file that exports a theme or themes (if generating both a light and dark theme) that can be provided to component theme mixins.

```scss
@use '@angular/material' as mat;
@use './path/to/m3-theme';

@include mat.core();

html {
  // Apply the light theme by default
  @include mat.core-theme(m3-theme.$light-theme);
  @include mat.button-theme(m3-theme.$light-theme);
}
```

Learn more about this schematic in its [documentation](https://github.com/angular/components/blob/main/src/material/schematics/ng-generate/m3-theme/README.md).

<!-- TODO(mmalerba): Illustrate palettes with example. -->

#### Customizing your typography

The following aspects of your app's typography can be customized via the `typography` property of
the theme configuration object.

| Typography Property | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `plain-family`      | [Optional] The font family to use for plain text, such as body text. |
| `brand-family`      | [Optional] The font family to use for brand text, such as headlines. |
| `bold-weight`       | [Optional] The font weight to use for bold text.                     |
| `medium-weight`     | [Optional] The font weight to use for medium text.                   |
| `regular-weight`    | [Optional] The font weight to use for regular text.                  |

See the [typography guide](https://material.angular.io/guide/typography) for more
information.

#### Customizing your density

The following aspects of your app's density can be customized via the `density` property of the
theme configuration object:

| Density Property | Description                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| `scale`          | [Optional] The level of compactness of the components in your app, from `0` (most space) to `-5` (most compact). |


#### Applying a theme to components

The `core-theme` Sass mixin emits prerequisite styles for common features used by multiple
components, such as ripples. This mixin must be included once per theme.

Each Angular Material component has a mixin for each [theming dimension](#theming-dimensions): base,
color, typography, and density. For example, `MatButton` declares `button-base`, `button-color`,
`button-typography`, and `button-density`. Each mixin emits only the styles corresponding to that
dimension of customization.

Additionally, each component has a "theme" mixin that emits all styles that depend on the theme
config. This theme mixin only emits color, typography, or density styles if you provided a
corresponding configuration to `define-theme`, and it always emits the base styles.

Once you've created your theme, you can apply it using the same `-theme`, `-color`, `-typography`, `-density`, and `-base` mixins.

For M3 themes, these mixins make some guarantees about the emitted styles.

- The mixins emit properties under the exact selector you specify. They will _not_ add to the
  selector or increase the specificity of the rule.
- The mixins only emit
  [CSS custom property declarations](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
  (e.g. `--some-prop: xyz`). They do _not_ emit any standard CSS properties such as `color`,
  `width`, etc.

Apply the styles for each of the components used in your application by including each of their
theme Sass mixins.

```scss
@use '@angular/material' as mat;

@include mat.core();

$my-theme: mat.define-theme((
 color: (
    theme-type: light,
    primary: mat.$violet-palette,
  ),
));

html {
  // Emit theme-dependent styles for common features used across multiple components.
  @include mat.core-theme($my-theme);

  // Emit styles for MatButton based on `$my-theme`. Because the configuration
  // passed to `define-theme` omits typography, `button-theme` will not
  // emit any typography styles.
  @include mat.button-theme($my-theme);

  // Include the theme mixins for other components you use here.
}
```

As an alternative to listing every component that your application uses, Angular Material offers
Sass mixins that includes styles for all components in the library: `all-component-bases`,
`all-component-colors`, `all-component-typographies`, `all-component-densities`, and
`all-component-themes`. These mixins behave the same as individual component mixins, except they
emit styles for `core-theme` and _all_ 35+ components in Angular Material. Unless your application
uses every single component, this will produce unnecessary CSS.

```scss
@use '@angular/material' as mat;

@include mat.core();

$my-theme: mat.define-theme((
 color: (
    theme-type: light,
    primary: mat.$violet-palette,
  ),
));

html {
  @include mat.all-component-themes($my-theme);
}
```

To include the emitted styles in your application, [add your theme file to the `styles` array of
your project's `angular.json` file][adding-styles].

[adding-styles]: https://angular.io/guide/workspace-config#styles-and-scripts-configuration

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

**The recommended approach is to rely on the `theme` mixins to lay down your base styles, and if
needed use the single dimension mixins to override particular aspects for parts of your app (see the
section on [Multiple themes in one file](#multiple-themes-in-one-file).)**

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

@include mat.core();

// Define a dark theme
$dark-theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: mat.$violet-palette,
  ),
));

// Define a light theme
$light-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$violet-palette,
  ),
));

html {
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

### Granular customizations with CSS custom properties

The CSS custom properties emitted by the theme mixins are derived from
[M3's design tokens](https://m3.material.io/foundations/design-tokens/overview). To further
customize your UI beyond the `define-theme` API, you can manually set these custom properties in
your styles.

The guarantees made by the theme mixins mean that you do not need to target internal selectors of
components or use excessive specificity to override any of these tokenized properties. Always apply
your base theme to your application's root element (typically `html` or `body`) and apply any
overrides on the highest-level selector where they apply.

<!-- TODO(mmalerba): Upgrade to embedded example -->

```html
<mat-sidenav-container>
  Some content...
  <mat-sidenav>
    Some sidenav content...
    <mat-checkbox class="danger">Enable admin mode</mat-checkbox>
  </mat-sidenav>
</mat-sidenav-container>
```

```scss
@use '@angular/material' as mat;

$light-theme: mat.define-theme();
$dark-theme: mat.define-theme((
  color: (
    theme-type: dark
  )
));

html {
  // Apply the base theme at the root, so it will be inherited by the whole app.
  @include mat.all-component-themes($light-theme);
}

mat-sidenav {
  // Override the colors to create a dark sidenav.
  @include mat.all-component-colors($dark-theme);
}

.danger {
  // Override the checkbox hover state to indicate that this is a dangerous setting. No need to
  // target the internal selectors for the elements that use these variables.
  --mdc-checkbox-unselected-hover-state-layer-color: red;
  --mdc-checkbox-unselected-hover-icon-color: red;
}
```

## Customizing density

Angular Material's density customization is based on the
[Material Design density guidelines][material-density]. This system defines a scale where zero
represents the default density. You can decrement the number for _more density_ and increment the
number for _less density_.

The density system is based on a *density scale*. The scale starts with the
default density of `0`. Each whole number step down (`-1`, `-2`, etc.) reduces
the affected sizes by `4dp`, down to the minimum size necessary for a component to render
coherently.

Components that appear in task-based or pop-up contexts, such as `MatDatepicker`, don't change their
size via the density system. The [Material Design density guidance][material-density] explicitly
discourages increasing density for such interactions because they don't compete for space in the
application's layout.

You can apply custom density setting to the entire library or to individual components using their
density Sass mixins.

```scss
// You can set a density setting in your theme to apply to all components.
$dark-theme: mat.define-theme((
  color: ...,
  typography: ...,
  density: (
    scale: -2
  ),
));

// Or you can selectively apply the Sass mixin to affect only specific parts of your application.
.the-dense-zone {
  @include mat.button-density(-1);
}
```

[material-density]: https://m3.material.io/foundations/layout/understanding-layout/spacing

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

@include mat.core();
@include mat.strong-focus-indicators();

$my-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$violet-palette,
  ),
));

html {
  @include mat.all-component-themes($my-theme);
  @include mat.strong-focus-indicators-theme($my-theme);
}
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

@include mat.core();
@include mat.strong-focus-indicators((
  border-style: dotted,
  border-width: 4px,
  border-radius: 2px,
));

$my-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$violet-palette,
  ),
));

html {
  @include mat.all-component-themes($my-theme);
  @include mat.strong-focus-indicators-theme(purple);
}
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

## Using component color variants

A number of components have a `color` input property that allows developers to apply different color
variants of the component. When using an M3 theme, this input still adds a CSS class to the
component (e.g. `.mat-accent`). However, there are no built-in styles targeting these classes. You
can instead apply color variants by passing the `$color-variant` option to a component's `-theme` or
`-color` mixins.

<!-- TODO(mmalerba): Upgrade to embedded example -->

```html
<mat-checkbox class="tertiary-checkbox" />
<section class="tertiary-checkbox">
  <mat-checkbox />
</section>
```

```scss
@use '@angular/material' as mat;

$theme: mat.define-theme();

.tertiary-checkbox {
  @include mat.checkbox-color($theme, $color-variant: tertiary);
}
```

This API is more flexible, and produces less CSS. For example, the `.tertiary-checkbox` class shown
above can be applied to any checkbox _or_ any element that contains checkboxes, to change the color
of all checkboxes within that element.

While you should prefer applying the mixins with color variants explicitly, if migrating from M2 to
M3 you can alternatively use [the provided backwards compatibility mixins](https://material.angular.io/guide/material-2-theming#how-to-migrate-an-app-from-material-2-to-material-3)
that apply styles directly to the existing CSS classes (`mat-primary`, `mat-accent`, and
`mat-warn`).

The table below shows the supported `$color-variant` values for each component. (Unlisted components
do not support any color variants.)

| Component        | Supported `$color-variant` values                      | Default     |
| ---------------- | ------------------------------------------------------ | ----------- |
| Badge            | `primary`, `secondary`, `tertiary`, `error`            | `error`     |
| Button           | `primary`, `secondary`, `tertiary`, `error`            | `primary`   |
| Button-toggle    | `primary`, `secondary`, `tertiary`, `error`            | `secondary` |
| Checkbox         | `primary`, `secondary`, `tertiary`, `error`            | `primary`   |
| Chips            | `primary`, `secondary`, `tertiary`, `error`            | `secondary` |
| Datepicker       | `primary`, `secondary`, `tertiary`, `error`            | `primary`   |
| Fab              | `primary`, `secondary`, `tertiary`                     | `primary`   |
| Form-field       | `primary`, `secondary`, `tertiary`, `error`            | `primary`   |
| Icon             | `surface`, `primary`, `secondary`, `tertiary`, `error` | `surface`   |
| Option           | `primary`, `secondary`, `tertiary`, `error`            | `secondary` |
| Progress-bar     | `primary`, `secondary`, `tertiary`, `error`            | `primary`   |
| Progress-spinner | `primary`, `secondary`, `tertiary`, `error`            | `primary`   |
| Pseudo-checkbox  | `primary`, `secondary`, `tertiary`, `error`            | `primary`   |
| Radio            | `primary`, `secondary`, `tertiary`, `error`            | `primary`   |
| Select           | `primary`, `secondary`, `tertiary`, `error`            | `primary`   |
| Slide-toggle     | `primary`, `secondary`, `tertiary`, `error`            | `primary`   |
| Slider           | `primary`, `secondary`, `tertiary`, `error`            | `primary`   |
| Stepper          | `primary`, `secondary`, `tertiary`, `error`            | `primary`   |
| Tabs             | `primary`, `secondary`, `tertiary`, `error`            | `primary`   |

## Style customization outside the theming system

Angular Material supports customizing color, typography, and density as outlined in this document.
Angular strongly discourages, and does not directly support, overriding component CSS outside the
theming APIs described above. Component DOM structure and CSS classes are considered private
implementation details that may change at any time.

<!-- TODO(amysorto): Move this section into theming your components guide and
move M2 specific details to the material 2 guide -->
## Theme your own components using a Material 3 theme

The same utility functions for reading properties of M2 themes (described in
[our guide for theming your components](https://material.angular.io/guide/theming-your-components))
can be used to read properties from M3 themes. However, the named palettes, typography
levels, etc. available are different for M3 themes, in accordance with the spec.

The structure of the theme object is considered an implementation detail. Code should not depend on
directly reading properties off of it, e.g. using `map.get`. Always use the utility functions
provided by Angular Material to access properties of the theme.

<!-- TODO(mmalerba): Upgrade to embedded example -->

```scss
@use '@angular/material' as mat;

@mixin my-comp-theme($theme) {
  .my-comp {
    font: mat.get-theme-typography($theme, body-large, font);
    letter-spacing: mat.get-theme-typography($theme, body-large, letter-spacing);
    background: mat.get-theme-color($theme, surface);
    @if mat.get-theme-type($theme) == dark {
      color: mat.get-theme-color($theme, primary, 20);
    } @else {
      color: mat.get-theme-color($theme, primary, 80);
    }
    padding: 48px + (2px * mat.get-theme-density($theme));
  }
}
```
