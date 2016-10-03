#Theming your custom components

In order to style your own components with our tooling, the component's styles must be defined with Sass.

You can consume the theming functions and variables from the @angular/material/core/theming. You can use the `map-get` function to extract the theming variables and `md-color` function to extract a specific color from a palette. For example, to theming a custom form input:

Create a css file for your custom input with the `@mixin custom-input-theme` function that will be responsible for applying the theme to your custom component:

app/custom-input/custom-input-theme.scss

```sass
@import '~@angular/material/core/theming/theming';

@mixin custom-input-theme($theme) {
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

And in the unicorn-app-theme.scss you have to call this scss function `custom-input-theme($theme)` to apply the custom theme to your custom component:

```sass
@import 'app/custom-input/custom-input-theme.scss';
@import '~@angular/material/core/theming/all-theme';

@include md-core();
$primary: md-palette($md-indigo);
$accent:  md-palette($md-pink, A200, A100, A400);
$warn:    md-palette($md-red);
$theme: md-light-theme($primary, $accent, $warn);


@include angular-material-theme($theme);
@include custom-input-theme($theme); // Here ou apply the theme to your custom component
```
