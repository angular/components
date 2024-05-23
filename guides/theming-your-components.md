# Theme your own components with Angular Material's theming system

You can use Angular Material's Sass-based theming system for your own custom components.

**Note: The information on this page is specific to Material 3, for Material 2
information on how to theme your components see the [Material 2 guide][material-2].**

[material-2]: https://material.angular.io/guide/material-2-theming#theming-your-components

## Reading values from a theme

As described in the [theming guide][theme-map], a theme is a Sass map that contains style values to
customize components. Angular Material provides APIs for reading values from this data structure.

[theme-map]: https://material.angular.io/guide/theming#defining-a-theme

### Reading tonal palette colors

To read a
[tonal palette color](https://m3.material.io/styles/color/system/how-the-system-works#3ce9da92-a118-4692-8b2c-c5c52a413fa6)
from the theme, use the `get-theme-color` function with three arguments:

| Argument   | Description                                                                                                                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `$theme`   | The M3 theme to read from.                                                                                                                                                                                                                                         |
| `$palette` | The name of the palette to read from. This can be any of the standard M3 palettes:<ul><li>`primary`</li><li>`secondary`</li><li>`tertiary`</li><li>`error`</li><li>`neutral`</li><li>`neutral-variant`</li></ul>                                                   |
| `$hue`     | The hue number to read within the palette. This can be any of the standard hues:<ul><li>`0`</li><li>`10`</li><li>`20`</li><li>`30`</li><li>`40`</li><li>`50`</li><li>`60`</li><li>`70`</li><li>`80`</li><li>`90`</li><li>`95`</li><li>`99`</li><li>`100`</li></ul> |

<!-- TODO(mmalerba): Illustrate palettes and hues with example. -->

### Reading color roles

To read a [color role](https://m3.material.io/styles/color/roles), use `get-theme-color` with two
arguments:

| Argument | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$theme` | The M3 theme to read from.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `$role`  | The name of the color role. This can be any of the M3 color roles:<ul><li>`primary`</li><li>`on-primary`</li><li>`primary-container`</li><li>`on-primary-container`</li><li>`primary-fixed`</li><li>`primary-fixed-dim`</li><li>`on-primary-fixed`</li><li>`on-primary-fixed-variant`</li><li>`secondary`</li><li>`on-secondary`</li><li>`secondary-container`</li><li>`on-secondary-container`</li><li>`secondary-fixed`</li><li>`secondary-fixed-dim`</li><li>`on-secondary-fixed`</li><li>`on-secondary-fixed-variant`</li><li>`tertiary`</li><li>`on-tertiary`</li><li>`tertiary-container`</li><li>`on-tertiary-container`</li><li>`tertiary-fixed`</li><li>`tertiary-fixed-dim`</li><li>`on-tertiary-fixed`</li><li>`on-tertiary-fixed-variant`</li><li>`error`</li><li>`on-error`</li><li>`error-container`</li><li>`on-error-container`</li><li>`surface-dim`</li><li>`surface`</li><li>`surface-bright`</li><li>`surface-container-lowest`</li><li>`surface-container-low`</li><li>`surface-container`</li><li>`surface-container-high`</li><li>`surface-container-highest`</li><li>`on-surface`</li><li>`on-surface-variant`</li><li>`outline`</li><li>`outline-variant`</li><li>`inverse-surface`</li><li>`inverse-on-surface`</li><li>`inverse-primary`</li><li>`scrim`</li><li>`shadow`</li></ul> |

<!-- TODO(mmalerba): Illustrate color roles with example. -->

### Reading the theme type

To read the theme type (`light` or `dark`), call `get-theme-type` with a single argument:

| Argument | Description                |
| -------- | -------------------------- |
| `$theme` | The M3 theme to read from. |


### Reading typescale properties

To read a [typescale](https://m3.material.io/styles/typography/type-scale-tokens) property from the
theme, call `get-theme-typography` with three arguments:

| Argument    | Description                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `$theme`    | The M3 theme to read from.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `$level`    | The typescale level. This can be any of the M3 typescale levels:<ul><li>`display-large`</li><li>`display-medium`</li><li>`display-small`</li><li>`headline-large`</li><li>`headline-medium`</li><li>`headline-small`</li><li>`title-large`</li><li>`title-medium`</li><li>`title-small`</li><li>`body-large`</li><li>`body-medium`</li><li>`body-small`</li><li>`label-large`</li><li>`label-medium`</li><li>`label-small`</li></ul> |
| `$property` | The CSS font property to get a value for. This can be one of the following CSS properties:<ul><li>`font` (The CSS font shorthand, includes all font properties except letter-spacing)</li><li>`font-family`</li><li>`font-size`</li><li>`font-weight`</li><li>`line-height`</li><li>`letter-spacing`</li></ul>                                                                                                                       |

<!-- TODO(mmalerba): Illustrate typescales with example. -->

### Reading the density scale

To read the density scale (`0`, `-1`, `-2`, `-3`, `-4`, or `-5`) from the theme, call
`get-theme-density` with a single argument:

| Argument | Description                |
| -------- | -------------------------- |
| `$theme` | The M3 theme to read from. |

### Checking what dimensions are configured for a theme

Depending on how a theme was created, it may not have configuration data for all theming dimensions
(base, color, typography, density). You can check if a theme has a configuration for a particular
dimension by calling the `theme-has` Sass function, passing the theme and the dimension to check.

See the below example of checking the configured dimensions for a theme:

```scss
$theme: mat.define-theme(...);

$has-base: mat.theme-has($theme, base);
$has-color: mat.theme-has($theme, color);
$has-typography: mat.theme-has($theme, typography);
$has-density: mat.theme-has($theme, density);
```

## Separating theme styles

Angular Material components each have a Sass file that defines mixins for customizing
that component's color and typography. For example, `MatButton` has mixins for `button-color` and
`button-typography`. Each mixin emits all color and typography styles for that component,
respectively.

You can mirror this structure in your components by defining your own mixins. These mixins
should accept an Angular Material theme, from which they can read color and typography values. You
can then include these mixins in your application along with Angular Material's own mixins.

## Step-by-step example

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

### Step 1: Extract theme-based styles to a separate file

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

### Step 2: Use values from the theme

Now that theme theme-based styles reside in mixins, we can extract the values we need from the
theme passed into the mixins.

```scss
// _carousel-theme.scss

@use 'sass:map';
@use '@angular/material' as mat;

@mixin color($theme) {
  .my-carousel-button {
    // Read the 50 hue from the primary color palette.
    color: mat.get-theme-color($theme, primary, 50);
  }
}

@mixin typography($theme) {
  .my-carousel {
    // Get the large headline font from the theme.
    font: mat.get-theme-typography($theme, headline-large, font);
  }
}
```

### Step 3: Add a theme mixin

For convenience, we can add a `theme` mixin that includes both color and typography.
This theme mixin should only emit the styles for each color and typography, respectively, if they
have a config specified.

```scss
// _carousel-theme.scss

@use 'sass:map';
@use '@angular/material' as mat;

@mixin color($theme) {
  .my-carousel-button {
    // Read the 50 hue from the primary color palette.
    color: mat.get-theme-color($theme, primary, 50);
  }
}

@mixin typography($theme) {
  .my-carousel {
    // Get the large headline font from the theme.
    font: mat.get-theme-typography($theme, headline-large, font);
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

### Step 4: Include the theme mixin in your application

Now that you've defined the carousel component's theme mixin, you can include this mixin along with
the other theme mixins in your application.

```scss
@use '@angular/material' as mat;
@use './path/to/carousel-theme' as carousel;

@include mat.core();

$my-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$red-palette,
  ),
  typography: (
    brand-family: 'Comic Sans',
    bold-weight: 900,
  ),
));

html {
  @include mat.all-component-themes($my-theme);
  @include carousel.theme($my-theme);
}
```
