# Avoiding duplicated theming styles

As explained in the [theming guide](./theming.md), a theme in Angular Material consists of
configurations for the `color`, `density` and `typography` systems. As some of these individual
systems have default configurations, some usage patterns may cause duplication in the CSS output.

Below is an example of a pattern that generates duplicative theme styles:

```scss
$light-theme: mat-light-theme((color: ...));
$dark-theme: mat-dark-theme((color: ...));

// Generates styles for all systems configured in the theme. In this case, color styles
// and default density styles are generated. Density is in themes by default.
@include angular-material-theme($light-theme);

.dark-theme {
  // Generates styles for all systems configured in the theme. In this case, color styles
  // and the default density styles are generated. **Note** that this is a problem because it
  // means that density styles are generated *again*, even though only the color should change.
  @include angular-material-theme($dark-theme);
}
```

To fix this, you can use the dedicated mixin for color styles for the `.dark-theme`
selector. Replace the `angular-material-theme` mixin and include the dark theme using the
`angular-material-color` mixin. For example:

```scss
...
@include angular-material-theme($light-theme);

.dark-theme {
  // This mixin only generates the color styles now.
  @include angular-material-color($dark-theme);
}
```

Typography can also be configured via Sass mixin; see `angular-material-typography`.  

#### Disabling duplication warnings

If your application intentionally duplicates styles, a global Sass variable can be
set to disable duplication warnings from Angular Material. For example:

```scss
$mat-theme-ignore-duplication-warnings: true;

// Include themes as usual.
@include angular-material-theme($light-theme);

...
```
