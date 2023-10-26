# Customizing Typography

## What is typography?

Typography is a way of arranging type to make text legible, readable, and appealing when displayed.
Angular Material's [theming system][theming-system] supports customizing the typography settings
for the library's components. Additionally, Angular Material provides APIs for applying typography
styles to elements in your own application.

Angular Material's theming APIs are built with [Sass](https://sass-lang.com). This document assumes
familiarity with CSS and Sass basics, including variables, functions, and mixins.

[theming-system]: https://material.angular.io/guide/theming

## Including font assets

Angular Material's typography APIs lets you specify any font-face. The default font-face value is
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
[font-inlining]: https://angular.io/guide/workspace-config#fonts-optimization-options

## Typography levels

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

### Define a level

You can define a typography level with the `define-typography-level` Sass function. This function
accepts, in order, CSS values for `font-size`, `line-height`, `font-weight`, `font-family`, and
`letter-spacing`. You can also specify the parameters by name, as demonstrated in the example below.

```scss
@use '@angular/material' as mat;

$my-custom-level: mat.define-typography-level(
  $font-family: Roboto,
  $font-weight: 400,
  $font-size: 1rem,
  $line-height: 1,
  $letter-spacing: normal,
);
```

## Typography config

A **typography config** is a collection of all typography levels. Angular Material represents this
config as a Sass map. This map contains the styles for each level, keyed by name. You can create
a typography config with the `define-typography-config` Sass function. Every parameter for
`define-typography-config` is optional; the styles for a level will default to Material Design's
baseline if unspecified.

```scss
@use '@angular/material' as mat;

$my-custom-typography-config: mat.define-typography-config(
  $headline-1: mat.define-typography-level(112px, 112px, 300, $letter-spacing: -0.05em),
  $headline-2: mat.define-typography-level(56px, 56px, 400, $letter-spacing: -0.02em),
  $headline-3: mat.define-typography-level(45px, 48px, 400, $letter-spacing: -0.005em),
  $headline-4: mat.define-typography-level(34px, 40px, 400),
  $headline-5: mat.define-typography-level(24px, 32px, 400),
  // ...
);
```

### Typography configs and theming

You can provide a typography config when defining a theme to customize typographic styles. See the [theming guide][theming-system] for details on custom themes.

The following example shows a typical theme definition and a "kids theme" that only applies when
the `".kids-theme"` CSS class is present. You can [see the theming guide for more guidance on
defining multiple themes](https://material.angular.io/guide/theming#defining-multiple-themes).

```scss
@use '@angular/material' as mat;

@include mat.core();

$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);
$my-typography: mat.define-typography-config();

$my-theme: mat.define-light-theme((
 color: (
   primary: $my-primary,
   accent: $my-accent,
 ),
  typography: $my-typography,
));

@include mat.all-component-themes($my-theme);

.kids-theme {
  $kids-primary: mat.define-palette(mat.$cyan-palette);
  $kids-accent: mat.define-palette(mat.$yellow-palette);

  // Typography config based on the default, but using "Comic Sans" as the
  // default font family for all levels.
  $kids-typography: mat.define-typography-config(
    $font-family: 'Comic Sans',
  );

  $kids-theme: mat.define-light-theme((
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

$kids-typography: mat.define-typography-config(
  // Specify "Comic Sans" as the default font family for all levels.
  $font-family: 'Comic Sans',
);

// Now we have sweet buttons with Comic Sans.
@include mat.button-typography($kids-typography);
```

## Using typography styles in your application

In addition to styles shared between components, the `typography-hierarchy` mixin includes CSS
classes for styling your application. These CSS classes correspond to the typography levels in your
typography config. This mixin also emits styles for native header elements scoped within the
`.mat-typography` CSS class.

```scss
@use '@angular/material' as mat;

// Use the default configuration.
$my-typography: mat.define-typography-config();
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

### Reading typography values from a config

It is possible to read typography properties from a theme for use in your own components. For more
information about this see our guide on [Theming your own components][reading-typography].

[reading-typography]: https://material.angular.io/guide/theming-your-components#reading-typography-values
