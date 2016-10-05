#Theming your custom components

In order to style your own components with our tooling, the component's styles must be defined with Sass.

You can consume the theming functions from the `@angular/material/core/theming/all-theme` and theming variables from a pre-built theme or a custom one. You can use the `map-get` function to extract the theming variables and `md-color` function to extract a specific color from a palette.
For example:

app/candy-carousel/candy-carousel-theme.scss

```scss
// Import theming functions and variables
@import '~@angular/material/core/theming/all-theme';
// Import a pre-built theme
@import '~@angular/material/core/theming/prebuilt/deep-purple-amber';

// Extract whichever individual palettes you need from the pre-built theme.
$primary: map-get($theme, primary);
$accent: map-get($theme, accent);

// Use md-color to extract individual colors from a palette as necessary.
.candy-carousel {
  background-color: md-color($primary);
  border-color: md-color($accent, A400);
}
```

## Using @mixin to automatically apply a theme
We can better theming our custom components adding a @mixin function to its theme file and then calling this function to apply a theme.

All you need is to create a @mixin function in the custom-component-theme.scss

```sass
// Import all the tools needed to customize the theme and extract parts of it
@import '~@angular/material/core/theming/all-theme';

// Define a mixin that accepts a theme and outputs the color styles for the component.
@mixin candy-carousel-theme($theme) {
  // Extract whichever individual palettes you need from the theme.
  $primary: map-get($theme, primary);
  $accent: map-get($theme, accent);

  // Use md-color to extract individual colors from a palette as necessary.
  .candy-carousel {
    background-color: md-color($primary);
    border-color: md-color($accent, A400);
  }
}
```

Now you have to apply a theme to the custom component. We have to call the @mixin function to apply the custom theme:

```sass
// Import theming functions and variables
@import '~@angular/material/core/theming/all-theme';
// Import a pre-built theme
@import '~@angular/material/core/theming/prebuilt/deep-purple-amber';
// Import your custom input theme file so you can call the custom-input-theme function
@import 'app/candy-carousel/candy-carousel-theme.scss';

//Using the $theme variable from the pre-built theme you can call the theming function
@include candy-carousel-theme($theme);
```
