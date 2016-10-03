#Theming your custom components

In order to style your own components with our tooling, the component's styles must be defined with Sass.

You can consume the theming functions and variables from the @angular/material/core/theming. You can use the `map-get` function to extract the theming variables and `md-color` function to extract a specific color from a palette.
For example, to theming a custom form input we can use the same approach used for theming the Angular 2 Material `md-input` component, as ou can see in `@angular/material/input/_input-theme.scss` file:

Create a scss file for your custom input with a function that will be responsible for applying the theme to your custom component. In this example, we will call this function `custom-input-theme($theme)`.

app/custom-input/custom-input-theme.scss

```sass
// Import all the tools needed to customize the theme and extract parts of it
@import '~@angular/material/core/theming/all-theme';

@mixin custom-input-theme($theme) { // here is the function responsible for applying the theme to your custom component.
  // Extract theme variables
  $primary: map-get($theme, primary);
  $accent: map-get($theme, accent);
  $warn: map-get($theme, warn);
  $background: map-get($theme, background);
  $foreground: map-get($theme, foreground);

  // Placeholder colors. Required is used for the `*` star shown in the placeholder.
  $input-placeholder-color: md-color($foreground, hint-text);
  $input-floating-placeholder-color: md-color($primary);
  $input-required-placeholder-color: md-color($accent);

  // Underline colors.
  $input-underline-color: md-color($foreground, hint-text);
  $input-underline-color-accent: md-color($accent);
  $input-underline-color-warn: md-color($warn);
  $input-underline-disabled-color: md-color($foreground, hint-text);
  $input-underline-focused-color: md-color($primary);

  .custom-input-placeholder {
    color: $input-placeholder-color;

    // :focus is applied to the input, but we apply md-focused to the other elements
    // that need to listen to it.
    &.md-focused {
      color: $input-floating-placeholder-color;

      &.md-accent {
        color: $input-underline-color-accent;
      }
      &.md-warn {
        color: $input-underline-color-warn;
      }
    }
  }

  // See md-input-placeholder-floating mixin in input.scss
  custom-input input:-webkit-autofill + .custom-input-placeholder,
  .custom-input-placeholder.md-float:not(.md-empty), .custom-input-placeholder.md-float.md-focused {

    .custom-placeholder-required {
      color: $input-required-placeholder-color;
    }
  }

  .custom-input-underline {
    border-color: $input-underline-color;

    .md-input-ripple {
      background-color: $input-underline-focused-color;

      &.md-accent {
        background-color: $input-underline-color-accent;
      }
      &.md-warn {
        background-color: $input-underline-color-warn;
      }
    }
  }
}
```

Now you have to apply the theme to the custom component. For that, we can create a theme file with a custom theme or a pre-built one. We will use a pre-built one to show you how to do this.
In the src/app-theme.scss you have to call this scss function `custom-input-theme($theme)` to apply the custom theme to your custom component:

```sass
// Import all the tools needed to customize the theme and extract parts of it
@import '~@angular/material/core/theming/all-theme';
// Import a pre-built theme
@import '~@angular/material/core/theming/prebuilt/deep-purple-amber';
// Import your custom input theme file so you can call the custom-input-theme function
@import 'app/custom-input/custom-input-theme.scss';

@include md-core();

$theme: md-light-theme($primary, $accent, $warn); // $primary, $accent, $warn comes from the prebuilt theme

@include angular-material-theme($theme); // Apply the theme to the material design components
@include custom-input-theme($theme); // Here you apply the theme to your custom component
```
