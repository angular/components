# Customizing Typography

**Note: The information on this page is specific to Material 3, for Material 2
information on typography go to the [Material 2 guide](https://material.angular.io/guide/material-2-theming#customizing-typography).**

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
[font-inlining]: https://angular.dev/reference/configs/workspace-config#fonts-optimization-options

## Configuring Typography

The following aspects of your app's typography can be customized via the `typography` property of
the theme configuration object.

| Typography Property | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `plain-family`      | [Optional] The font family to use for plain text, such as body text. |
| `brand-family`      | [Optional] The font family to use for brand text, such as headlines. |
| `bold-weight`       | [Optional] The font weight to use for bold text.                     |
| `medium-weight`     | [Optional] The font weight to use for medium text.                   |
| `regular-weight`    | [Optional] The font weight to use for regular text.                  |

These are used to generate the styles for the different typescale levels.

## Type scale levels

A **type scale** is a selection of font styles that can be used across an app.
They’re assigned based on use (such as display or headline), and grouped more
broadly into categories based on scale (such as large or small). For more
information, see the [M3 typography spec](https://m3.material.io/styles/typography/type-scale-tokens).

There are `large`, `medium`, and `small` variations for the following type roles:
- **Display**: Display styles are reserved for short, important text or numerals. They work best on large screens.
- **Headline**: Headline styles are best-suited for short, high-emphasis text on smaller screens. These styles can be good for marking primary passages of text or important regions of content.
- **Title**: Title styles are smaller than headline styles, and should be used for medium-emphasis text that remains relatively short. For example, consider using title styles to divide secondary passages of text or secondary regions of content.
- **Body**: Body styles are used for longer passages of text in your app.
- **Label**: Label styles are smaller, utilitarian styles, used for things like the text inside components or for very small text in the content body, such as captions.

The table below lists the CSS classes emitted and the native elements styled.

| CSS class                 | Typesale level      |
|---------------------------|---------------------|
| `.mat-display-large`      | `display-large`     |
| `.mat-display-medium`     | `display-medium`    |
| `.mat-display-small`      | `display-small`     |
| `.mat-headline-large`     | `headline-large`    |
| `.mat-headline-medium`    | `headline-medium`   |
| `.mat-headline-small`     | `headline-small`    |
| `.mat-title-large`        | `title-large`       |
| `.mat-title-medium`       | `title-medium`      |
| `.mat-title-small`        | `title-small`       |
| `.mat-body-large`         | `body-large`        |
| `.mat-body-medium`        | `body-medium`       |
| `.mat-body-small`         | `body-small`        |
| `.mat-label-large`        | `label-large`       |
| `.mat-label-medium`       | `label-medium`      |
| `.mat-label-small`        | `label-small`       |

## Using typography styles in your application

See the [theming guide](https://material.angular.io/guide/theming#defining-a-theme)
for details on setting up a theme that has typography configured.

### Reading typography values from a config

It is possible to read typography properties from a theme for use in your own components. For more
information about this see our guide on [Theming your own components][reading-typography].

[reading-typography]: https://material.angular.io/guide/theming-your-components#reading-typography-values

## Using typography styles in your application

**Note: this section is applicable only if you are using the [M2 backwards compatability
mixin](https://material.angular.io/guide/material-2-theming#optional-add-backwards-compatibility-styles-for-typography-hierarchy).**

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

In addition to the typographic styles, these style rules also include a `margin-bottom` for
headers and paragraphs. For `body` styles, text is styled within the provided CSS selector.

The `.mat-h5` and `.mat-h6` styles don't directly correspond to a specific Material Design
typography level. The `.mat-h5` style uses the `body-2` level with the font-size scaled down by
`0.83`. The `.mat-h6` style uses the `body-2` level with the font-size scaled down by `0.67`.

The `button` typography level does not map to a CSS class.

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
