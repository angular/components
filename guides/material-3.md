# Material 3 Theming

## What is Material 3
[Material 3 (M3)](https://m3.material.io/) is the latest iteration of Google's open-source design
system, Material Design. It is the successor to [Material 2 (M2)](https://m2.material.io/), the
design system which Angular Material has followed.

As of v17.2.0, Angular Material includes experimental support for M3 styling in addition to M2. The
team plans to stabilize support for M3 after a brief period in experimental in order to get feedback
on the design and API.

## How to use Material 3 in your app
M3 is implemented in Angular Material as an alternate Sass theme for the same set of Angular
Material components already used by many apps. To use M3 with Angular Material, create your theme
using the `define-theme` function from `@angular/material-experimental`, as opposed to the
`define-light-theme` or `define-dark-theme` from `@angular/material` that are used to create M2
themes.

### Defining your theme
The simplest usage of the API, `$theme: matx.define-theme()` defines a theme with default values.
However, like its M2 counterparts, `define-theme` allows you to configure the appearance of your
Angular Material app along three theming dimensions: color, typography, and density, by passing a
theme configuration object. The configuration object may have the following properties.

| Property     | Description                                                                                                     |
|--------------|-----------------------------------------------------------------------------------------------------------------|
| `color`      | [Optional] A map of color options. See [customizing your colors](#customizing-your-colors) for details.         |
| `typography` | [Optional] A map of color options. See [customizing your typography](#customizing-your-typography) for details. |
| `density`    | [Optional] A map of density options. See [customizing your density](#customizing-your-density) for details.     |

<!-- TODO(mmalerba): Upgrade to embedded example -->
```scss
@use '@angular/material-experimental' as matx;

$theme: matx.define-theme((
  color: (
    theme-type: dark,
    primary: matx.$m3-violet-palette,
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
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `theme-type`   | [Optional] Specifies the type of theme, `light` or `dark`.                                                                                                                                                                                                               |
| `primary`      | [Optional] Specifies the palette to use for the app's primary color palette. (Note: the secondary, neutral, and neutral-variant palettes described in the M3 spec will be automatically chosen based on your primary palette, to ensure a harmonious color combination). |
| `tertiary`     | [Optional] Specifies the palette to use for the app's tertiary color palette.                                                                                                                                                                                            |

There are a number of color palettes available in `@angular/material-experimental` that can be
used with the `primary` and `tertiary` options:
- `$m3-red-palette`
- `$m3-green-palette`
- `$m3-blue-palette`
- `$m3-yellow-palette`
- `$m3-cyan-palette`
- `$m3-magenta-palette`
- `$m3-orange-palette`
- `$m3-chartreuse-palette`
- `$m3-azure-palette`
- `$m3-violet-palette`
- `$m3-rose-palette`

<!-- TODO(mmalerba): Illustrate palettes with example. -->

#### Customizing your typography
The following aspects of your app's typography can be customized via the `typography` property of
the theme configuration object (see the
[M3 typography spec](https://m3.material.io/styles/typography/type-scale-tokens) to learn more about
these terms):

| Typography Property      | Description                                                          |
|--------------------------|----------------------------------------------------------------------|
| `plain-family`           | [Optional] The font family to use for plain text, such as body text. |
| `brand-family`           | [Optional] The font family to use for brand text, such as headlines. |
| `bold-weight`            | [Optional] The font weight to use for bold text.                     |
| `medium-weight`          | [Optional] The font weight to use for medium text.                   |
| `regular-weight`         | [Optional] The font weight to use for regular text.                  |

#### Customizing your density
The following aspects of your app's density can be customized via the `density` property of the
theme configuration object:

| Density Property | Description                                                                                                      |
|------------------|------------------------------------------------------------------------------------------------------------------|
| `scale`          | [Optional] The level of compactness of the components in your app, from `0` (most space) to `-5` (most compact). |

### Applying your theme
Once you've created your theme, you can apply it using the same `-theme`, `-color`, `-typography`,
`-density`, and `-base` mixins used to apply M2 themes (read more about these mixins in the
[general theming guide](/guide/theming#applying-a-theme-to-components)). For M3 themes, these mixins
make some guarantees about the emitted styles. These guarantees do *not* apply when passing
M2 themes.
- The mixins emit properties under the exact selector you specify. They will *not* add to the
  selector or increase the specificity of the rule.
- The mixins only emit
  [CSS custom property declarations](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
  (e.g. `--some-prop: xyz`). They do *not* emit any standard CSS properties such as `color`,
  `width`, etc.

#### Using component color variants
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
@use '@angular/material-experimental' as matx;

$theme: matx.define-theme();

.tertiary-checkbox {
  @include mat.checkbox-color($theme, $color-variant: tertiary);
}
```

This API is more flexible, and produces less CSS. For example, the `.tertiary-checkbox` class shown
above can be applied to any checkbox _or_ any element that contains checkboxes, to change the color
of all checkboxes within that element.

While you should prefer applying the mixins with color variants explicitly, you can alternatively
use
[the provided backwards compatibility mixins](#how-to-migrate-an-app-from-material-2-to-material-3)
that apply styles directly to the existing CSS classes (`mat-primary`, `mat-accent`, and
`mat-warn`).

The table below shows the supported `$color-variant` values for each component. (Unlisted components
do not support any color variants.)

| Component        | Supported `$color-variant` values                      | Default     |
|------------------|--------------------------------------------------------|-------------|
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

#### Granular customizations with CSS custom properties
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
@use '@angular/material-experimental' as matx;

$light-theme: matx.define-theme();
$dark-theme: matx.define-theme((
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

## Theme your own components using a Material 3 theme
The same utility functions for reading properties of M2 themes (described in
[our guide for theming your components](/guide/theming-your-components)) can be used to read
properties from M3 themes. However, the named palettes, typography levels, etc. available are
different for M3 themes, in accordance with the spec.

The structure of the theme object is considered an implementation detail. Code should not depend on
directly reading properties off of it, e.g. using `map.get`. Always use the utility functions
provided by Angular Material to access properties of the theme.

<!-- TODO(mmalerba): Upgrade to embedded example -->
```scss
@use '@anuglar/material' as mat;
@use '@anuglar/material-experimental' as matx;

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

### Reading tonal palette colors
To read a 
[tonal palette color](https://m3.material.io/styles/color/system/how-the-system-works#3ce9da92-a118-4692-8b2c-c5c52a413fa6)
from the theme, use the `get-theme-color` function with three arguments:

| Argument    | Description                                                                                                                                                                                                                                                        |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `$theme`    | The M3 theme to read from.                                                                                                                                                                                                                                         |
| `$palette`  | The name of the palette to read from. This can be any of the standard M3 palettes:<ul><li>`primary`</li><li>`secondary`</li><li>`tertiary`</li><li>`error`</li><li>`neutral`</li><li>`neutral-variant`</li></ul>                                                   |
| `$hue`      | The hue number to read within the palette. This can be any of the standard hues:<ul><li>`0`</li><li>`10`</li><li>`20`</li><li>`30`</li><li>`40`</li><li>`50`</li><li>`60`</li><li>`70`</li><li>`80`</li><li>`90`</li><li>`95`</li><li>`99`</li><li>`100`</li></ul> |

<!-- TODO(mmalerba): Illustrate palettes and hues with example. -->

### Reading color roles
To read a [color role](https://m3.material.io/styles/color/roles), use `get-theme-color` with two
arguments:

| Argument | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `$theme` | The M3 theme to read from.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `$role`  | The name of the color role. This can be any of the M3 color roles:<ul><li>`primary`</li><li>`on-primary`</li><li>`primary-container`</li><li>`on-primary-container`</li><li>`primary-fixed`</li><li>`primary-fixed-dim`</li><li>`on-primary-fixed`</li><li>`on-primary-fixed-variant`</li><li>`secondary`</li><li>`on-secondary`</li><li>`secondary-container`</li><li>`on-secondary-container`</li><li>`secondary-fixed`</li><li>`secondary-fixed-dim`</li><li>`on-secondary-fixed`</li><li>`on-secondary-fixed-variant`</li><li>`tertiary`</li><li>`on-tertiary`</li><li>`tertiary-container`</li><li>`on-tertiary-container`</li><li>`tertiary-fixed`</li><li>`tertiary-fixed-dim`</li><li>`on-tertiary-fixed`</li><li>`on-tertiary-fixed-variant`</li><li>`error`</li><li>`on-error`</li><li>`error-container`</li><li>`on-error-container`</li><li>`surface-dim`</li><li>`surface`</li><li>`surface-bright`</li><li>`surface-container-lowest`</li><li>`surface-container-low`</li><li>`surface-container`</li><li>`surface-container-high`</li><li>`surface-container-highest`</li><li>`on-surface`</li><li>`on-surface-variant`</li><li>`outline`</li><li>`outline-variant`</li><li>`inverse-surface`</li><li>`inverse-on-surface`</li><li>`inverse-primary`</li><li>`scrim`</li><li>`shadow`</li></ul>  |

<!-- TODO(mmalerba): Illustrate color roles with example. -->

### Reading the theme type
To read the theme type (`light` or `dark`), call `get-theme-type` with a single argument:

| Argument | Description                |
|----------|----------------------------|
| `$theme` | The M3 theme to read from. |

### Reading typescale properties
To read a [typescale](https://m3.material.io/styles/typography/type-scale-tokens) property from the
theme, call `get-theme-typography` with three arguments:

| Argument    | Description                                                                                                                                                                                                                                                                                                                                                                                                                          |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `$theme`    | The M3 theme to read from.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `$level`    | The typescale level. This can be any of the M3 typescale levels:<ul><li>`display-large`</li><li>`display-medium`</li><li>`display-small`</li><li>`headline-large`</li><li>`headline-medium`</li><li>`headline-small`</li><li>`title-large`</li><li>`title-medium`</li><li>`title-small`</li><li>`body-large`</li><li>`body-medium`</li><li>`body-small`</li><li>`label-large`</li><li>`label-medium`</li><li>`label-small`</li></ul> |
| `$property` | The CSS font property to get a value for. This can be one of the following CSS properties:<ul><li>`font` (The CSS font shorthand, includes all font properties except letter-spacing)</li><li>`font-family`</li><li>`font-size`</li><li>`font-weight`</li><li>`line-height`</li><li>`letter-spacing`</li></ul>                                                                                                                       |

<!-- TODO(mmalerba): Illustrate typescales with example. -->

### Reading the density scale
To read the density scale (`0`, `-1`, `-2`, `-3`, `-4`, or `-5`) from the theme, call
`get-theme-density` with a single argument:

| Argument | Description                |
|----------|----------------------------|
| `$theme` | The M3 theme to read from. |

## How to migrate an app from Material 2 to Material 3
Angular Material does not offer an automated migration from M2 to M3 because the design of your app
is subjective. Material Design offers general principles and constraints to guide you, but
ultimately it is up to you to decide how to apply those in your app. That said, Angular Material's
M3 themes were designed with maximum compatibility in mind.

### Update your components that use Angular Material themes to be compatible with Material 3
In order to facilitate a smooth transition from M2 to M3, it may make sense to have your components
support both M2 and M3 themes. Once the entire app is migrated, the support for M2 themes can be
removed.

The simplest way to accomplish this is by checking the theme version and emitting different styles
for M2 vs M3. You can check the theme version using the `get-theme-version` function from
`@angular/material`. The function will return `0` for an M2 theme or `1` for an M3 theme (see 
[theme your own components using a Material 3 theme](#theme-your-own-components-using-a-material-3-theme)
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
  [using component color variants](#using-component-color-variants) for more).
- The `backgroundColor` property of `<mat-tab-group>` is not supported, and should not be used with
  M3 themes.
- The `appearance="legacy"` variant of `<mat-button-toggle>` is not supported, and should not be
  used with M3 themes.
- For M3 themes, calling `all-component-typographies` does *not* emit the `typography-hierarchy`
  styles, as this would violate M3's guarantee to not add selectors. Instead, the
  `typography-hierarchy` mixin must be explicitly called if you want these styles in your app.
- The `typography-hierarchy` mixin outputs CSS class names that correspond to the names of M3
  typescale levels rather than M2 typescale levels. If you were relying on the M2 classes to style
  your app, you may need to update the class names.

### (Optional) add backwards compatibility styles for color variants
We recommend *not* relying on the `color="primary"`, `color="accent"`, or `color="warn"` options
that are offered by a number of Angular Material components for M2 themes. However, if you want to
quickly update to M3 and are willing to accept the extra CSS generated for these variants, you can
enable backwards compatibility styles that restore the behavior of this API. Call the 
`color-variants-back-compat` mixin from `@angular/material-experimental` with the M3 theme you want
to generate color variant styles for.

<!-- TODO(mmalerba): Upgrade to embedded example -->
```scss
@use '@angular/material' as mat;
@use '@angular/material-experimental' as matx;

$theme: matx.define-theme();

html {
  @include mat.all-component-themes($theme);
  @include matx.color-variants-back-compat($theme);
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
@use '@angular/material-experimental' as matx;

$theme: matx.define-theme();

@include mat.typography-hierarchy($theme, $back-compat: true);
```

## FAQ

### Can I use colors other than the pre-defined Material 3 palettes?
Currently, we only offer predefined palettes, but we plan to add support for using custom generated
palettes as part of making the M3 APIs stable and available in `@angular/material`.

### Can I depend on the CSS custom property names being stable?
We may make changes to the custom property names before moving the API out of experimental, but
these changes would be accompanied by a schematic to find & replace the old name with the new name
across your app.

### Are the Material 2 styles and APIs going away?
Material 2 styles and their APIs will continue to be supported, and we do not have any immediate 
plans to deprecate them. We understand that it will take time for applications to switch to the 
latest Material 3 styles, and we want to provide enough time for migrations. When we do decide to 
remove these APIs, they will be marked as deprecated and continue to be supported in the following 
two major releases. As of now, they are not considered deprecated.
