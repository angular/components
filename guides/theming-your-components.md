# Theme your own components with Angular Material's theming system

You can use Angular Material's Sass-based theming system for your own custom components.

## Reading style values from a theme

As described in the [theming guide][theme-map], a theme is a Sass map that contains style values to
customize components. Angular Material provides APIs for reading values from this data structure.

[theme-map]: https://material.angular.io/guide/theming#themes

### Reading color values

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
$theme: mat.define-dark-theme(...);

$primary-default: mat.get-theme-color($theme, primary, default);
$accent-a100: mat.get-theme-color($theme, accent, A100);
$warn-500-contrast: mat.get-theme-color($theme, warn, 500-contrast);
$foreground-text: mat.get-theme-color($theme, foreground, text);
$background-card: mat.get-theme-color($theme, background, card);
$type: mat.get-theme-type($theme);
$custom-background: if($type == dark, #030, #dfd);
```

### Reading typography values

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
$theme: mat.define-dark-theme(...);

body {
  font: mat.get-theme-typography($theme, body-1);
  letter-spacing: mat.get-theme-typography($theme, body-1, letter-spacing);
}
```

### Reading density values

To read the density scale from a theme, you can use the `get-theme-density` Sass function. This
function takes a theme and returns the density scale (0, -1, -2, -3, -4, or -5).

See the below example of reading the density scale from a theme:

```scss
$theme: mat.define-dark-theme(...);

$density-scale: mat.get-theme-desity($theme);
```

### Checking what dimensions are configured for a theme

Depending on how a theme was created, it may not have configuration data for all theming dimensions
(base, color, typography, density). You can check if a theme has a configuration for a particular
dimension by calling the `theme-has` Sass function, passing the theme and the dimension to check.

See the below example of checking the configured dimensions for a theme:

```scss
$theme: mat.define-dark-theme(...);

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

### Step 4: Include the theme mixin in your application

Now that you've defined the carousel component's theme mixin, you can include this mixin along with
the other theme mixins in your application.

```scss
@use '@angular/material' as mat;
@use './path/to/carousel-theme' as carousel;

@include mat.core();

$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

$my-theme: mat.define-light-theme((
 color: (
   primary: $my-primary,
   accent: $my-accent,
 ),
 typography: mat.define-typography-config(
    $font-family: serif,
  );
));

@include mat.all-component-themes($my-theme);
@include carousel.theme($my-theme);
```
