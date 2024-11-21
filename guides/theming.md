# Theming

Angular Material lets you customize the appearance of your components by
defining a custom theme. Angular Material’s theming system is inspired by
Google’s [Material Design](https://m3.material.io/styles).

This guide describes how to set up theming for your application using
Sass APIs introduced in Angular Material v19. 

If your application depends on a version before v19, or if your application's
theme is applied using a theme config created with `mat.define-theme`, 
`mat.define-light-theme`, or `mat.define-dark-theme`,
then you can refer to the theming guides at 
[v18.material.angular.io/guides](https://v18.material.angular.io/guides).

## Getting Started

Your application needs to have a [Sass](https://sass-lang.com) **theme file**
that includes Angular Material’s `mat.theme` mixin.

The `mat.theme` mixin takes a map that defines color, typography, and density
values and outputs a set of CSS variables that control the component appearance
and layout. These variables are based on
[Design Tokens](https://m3.material.io/foundations/design-tokens/overview).

The color variables are defined using the CSS color function
[light-dark](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
so that your theme can switch between light and dark mode using the CSS property
[color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme).

The following example theme file applies a violet color palette, Roboto font,
and standard density to the application’s Angular Material components. It
targets the `html` selector to ensure the CSS variables are applied across the
entire application. The `color-scheme` is explicitly set to `light dark` so that
the end user's system preferences are used to determine whether the application
appears in light or dark mode.

```
@use '@angular/material' as mat;

html {
  color-scheme: light dark;
  @include mat.theme((
    color: mat.$violet-palette,
    typography: Roboto,
    density: 0
  ));
}
```

You can use the following styles to apply the theme’s surface background and
on-surface text colors as a default across your application:

```
body {
  background: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
}
```

The `mat.theme` mixin will only declare CSS variables for the categories
included in the input. For example, if `typography` is not defined, then
typography CSS variables will not be included in the output.

### **Color**

The `theme`‘s color determines the component color styles, such as the fill
color of checkboxes or ripple color of buttons. It depends on color palettes of
varying tones to build a color scheme. Check out the
[Palettes](#prebuilt-color-palettes)
section to learn about available prebuilt palettes, or how to create custom
palettes.

You can set the color in one of two ways: as a single color palette, or as a
color map.

#### *Single Color Palette*

If you provide a single color palette, Angular Material uses its values for the
theme’s primary, secondary, and tertiary colors. The CSS color values will be
defined using `light-dark` CSS color function. Your application styles should
define an explicit value declaration for the `color-scheme` CSS property.

#### *Color Map*

If you provide a color map, then the tertiary color palette can be configured
separately from the primary palette. The tertiary palette can be used to add a
distinct accent color to some components.

You can also set the `theme-type` to determine the color values are defined:

*   `color-scheme` \- include both light and dark colors using the `light-dark`
    CSS color function
*   `light` \- only define the light color values
*   `dark` \- only define the dark color values

The `light-dark` CSS color function is
[widely available](https://caniuse.com/?search=light-dark) for all major
browsers. However, if your application must support older browser versions or
non-major browsers, you should explicitly set the `theme-type` to either `light`
or `dark`.

The following example theme file applies a violet primary color and orange
tertiary color. The theme-type is set to `light` which means that only the light
color values will be set for the application. The typography is set to Roboto
with a standard density setting.

```
@use '@angular/material' as mat;

html {
  @include mat.theme((
    color: (
      primary: mat.$violet-palette,
      tertiary: mat.$orange-palette,
      theme-type: light,
    ),
    typography: Roboto,
    density: 0
  ));
}
```

### **Typography**

The `mat.theme` ‘s typography determines the text styles used in components,
such as the font for dialog titles or menu list items.

You can set the typography in one of two ways: as a single font family value, or
as a typography map.

#### *Single Font Family Value*

If you provide a font family, Angular Material uses it for all the text in its
components. The font weights used in components are set to 700 for bold text,
500 for medium text, and 400 for regular text.

#### *Typography Map*

If you provide a typography map, then distinct font families are set for plain
and brand text. The plain font family is typically used for most of the
application’s text, while the brand font family is typically used for headings
and titles.

The typography map also sets specific weights for bold, medium, and regular
text.

The following example theme file applies the Roboto font family to plain text
and the Open Sans font family to brand text. It specifies that bold weight is
900, medium weight is 500, and regular weight is 300\. The color scheme uses the
violet color palette with a standard density.

```
@use '@angular/material' as mat;

html {
  @include mat.theme((
    color: mat.$violet-palette,
    typography: (
      plain-family: Roboto
      brand-family: Open Sans,
      bold-weight: 900,
      medium-weight: 500,
      regular-weight: 300,
    ),
    density: 0,
  ));
}
```

### **Density**

The `mat.theme` ‘s density value determines the spacing within components, such
as how much padding is used around a button’s text or the height of form fields.

The density value accepts integers from 0 to \-5, where 0 is the default spacing
and \-5 is the most dense and compact layout. Each whole number step down (-1,
\-2, etc.) reduces the affected sizes by 4px, down to the minimum size necessary
for a component to render itself coherently.

The following example theme file has a density setting of \-2 which causes most
components to include less whitespace in their layout. The color scheme uses the
violet color palette and applies Roboto as the font-family.

```
@use '@angular/material' as mat;

html {
  @include mat.theme((
    color: mat.$violet-palette,
    typography: Roboto,
    density: -2,
  ));
}
```

Setting the density below 0 can reduce accessibility and make navigation harder
for users of assistive technology.

Density customizations do not affect components that appear in task-based or
pop-up contexts, such as the date picker. The Material Design density guidance
explicitly discourages changes to density for such interactions because they
don't compete for space in the application's layout.

## **Color Palettes**

A color palette is a set of similar colors with different hues ranging from
light to dark. The Angular Material theme uses color palettes to create a color
scheme to communicate an application’s hierarchy, state, and brand.

### **Prebuilt Color Palettes**

Angular Material provides twelve prebuilt color palettes that can be used for
your application’s theme:

*   `$red-palette`
*   `$green-palette`
*   `$blue-palette`
*   `$yellow-palette`
*   `$cyan-palette`
*   `$magenta-palette`
*   `$orange-palette`
*   `$chartreuse-palette`
*   `$spring-green-palette`
*   `$azure-palette`
*   `$violet-palette`
*   `$rose-palette`

### **Custom Color Palettes**

The Angular Material
[palette generation schematic](https://github.com/angular/components/blob/main/src/material/schematics/ng-generate/theme-color/README.md)
builds custom color palettes based on a single color input for the primary
color, and optionally color inputs to further customize secondary, tertiary, and
neutral palettes:

```
ng generate @angular/material:theme-color
```

## **Loading Fonts**

You can use Google Fonts as one option to load fonts in your application. For
example, the following code in an application’s `<head>` loads the font family
Roboto with the font weights 700, 500, and 400:

```
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
```

Learn more about using fonts with
[Google Fonts](https://developers.google.com/fonts/docs/getting_started). By
default, projects created with the Angular CLI are
[configured](https://angular.dev/reference/configs/workspace-config#fonts-optimization-options)
to inline assets from Google Fonts to reduce render-blocking requests.

## **Supporting Light and Dark Mode**

By default, the `mat.theme` mixin defines colors using the CSS color function
`light-dark` to make it easy for your application to switch between light and
dark mode. The `light-dark` function depends on the value of `color-scheme`
declared in your application’s global styles. If your application does not
define a value for `color-scheme`, then the light colors will always be applied.

You can define `color-scheme: light` or `color-scheme: dark` to explicitly
define your application’s mode. To set the mode depending on the user’s system
preferences, use `color-scheme: light-dark` as shown in the following example:

```
@use '@angular/material' as mat;

html {
  color-scheme: light dark;
  @include mat.theme((
    color: mat.$violet-palette,
    typography: Roboto,
    density: 0
  ));
}
```

You can also use the strategy of defining `color-scheme` under a CSS selector so
that the mode depends on whether that class has been applied. In the following
example, the application always displays the light mode theme unless the class
“dark-mode” is added to the HTML body.

```
@use '@angular/material' as mat;

html {
  color-scheme: light;
  @include mat.theme((
    color: mat.$violet-palette,
    typography: Roboto,
    density: 0
  ));
}

body.dark-mode {
  color-scheme: dark;
}
```

Angular Material does not automatically apply different styles or themes based
on user preference media queries, such as `color-scheme`, `prefers-color-scheme`
or `prefers-contrast`. Instead, Angular Material gives you the flexibility to
define your own queries to apply the styles that make sense for your users. This
may mean relying on `color-scheme: light dark`, defining custom media queries,
or reading a saved user preference to apply styles.

## **Multiple Themes**

You can call the `mat.theme` mixin more than once to apply multiple different
color schemes in your application.

### **Context-specific Themes**

The following example theme file customizes the theme for components in
different contexts. In this case, a cyan-based palette is applied to a container
of information about deleting data, causing buttons and other components to have
a unique and attention-grabbing style applied:

```
@use '@angular/material' as mat;

html {
  @include mat.theme((
    color: mat.$violet-palette,
    typography: Roboto,
    density: 0,
  ));
}

.example-bright-container {
  @include mat.theme((
    color: mat.$cyan-palette,
  ));
}
```

## **Using Theme Styles**

An application’s custom components can use the CSS variables defined by
`mat.theme` to apply the theme’s colors and typography.

The color variables are useful for emphasizing important text and actions,
providing stronger application branding, and ensuring strong contrast ratios
between surface and on-surface elements.

The typography variables are useful for creating clear information hierarchy and
text consistency through the application.

The following example styles demonstrate a component using the color and
typography variables to create an application-wide banner presenting important
information to the user:

```
:host {
  background: var(--mat-sys-primary-container);
  color: var(--mat-sys-on-primary-container);
  border: 1px solid var(--mat-sys-outline-variant);
  font: var(--mat-sys-body-large);
}
```

See the [Theme Variables](https://material.angular.io/guide/system-variables) guide for a
comprehensive list of these variables, examples of where they are used, and how
components can depend on them.

## **Customizing Tokens**

Angular Material components also allow for narrowly targeted customization of
specific tokens through the `overrides` mixins. This enables fine-grained
adjustments to specific system-level theme CSS variables as well as individual
component tokens, such as a component’s border-color or title font size.

The `overrides` API validates that the customized tokens are correctly spelled
and can be used to ensure backwards compatibility if tokens are added, moved, or
renamed in future versions.

### **System Tokens**

System-level tokens can be changed to different values through the
`mat.theme-overrides` mixin, which will redefine CSS variables that are used in
the application.

The following example applies a violet color palette for the application, but
alters the `primary-container` token to a specific shade of blue.

```
@use '@angular/material' as mat;

html {
  color-scheme: light dark;
  @include mat.theme((
    color: mat.$violet-palette,
    typography: Roboto,
    density: 0
  ));

  .example-orange-primary-container {
    @include mat.theme-overrides((
      primary-container: #84ffff
    ));
  }
}
```

Alternatively, an optional override map can be provided in the `mat.theme` mixin
to replace values applied by the mixin:

```
@use '@angular/material' as mat;

html {
  color-scheme: light dark;
  @include mat.theme((
    color: mat.$violet-palette,
    typography: Roboto,
    density: 0
  ), $overrides: (
    primary-container: orange,
  );
}
```

### **Component Tokens**

Each Angular Material component defines an `overrides` mixin that can be used to
customize tokenized styles for their color, typography, and density.

More information for each component’s override API, including their list of
available customizable tokens, can be found on their respective documentation
page under the Styling tab.

The following example demonstrates the Card’s `overrides` API to change the
background color to red, increase the corner border radius, and specify a larger
title font size.

```
html {
  @include mat.card-overrides((
    elevated-container-color: red,
    elevated-container-shape: 32px,
    title-text-size: 2rem,
  ));
}
```

### **Direct Style Overrides**

Angular Material supports customizing color, typography, and density as outlined
in this document. Angular strongly discourages, and does not directly support,
overriding component CSS outside the theming APIs described above. Component DOM
structure and CSS classes are considered private implementation details that may
change at any time. CSS variables used by the Angular Material components should
be defined through the `overrides` API instead of defined explicitly.

## **Shadow DOM**

Angular Material assumes that, by default, all theme styles are loaded as global
CSS. If you want to use
[Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
in your application, you must load the theme styles within each shadow root that
contains an Angular Material component. You can accomplish this by manually
loading the CSS in each shadow root, or by using
[Constructable Stylesheets](https://developers.google.com/web/updates/2019/02/constructable-stylesheets).
