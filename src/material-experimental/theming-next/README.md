This is an experimental theming API based on [design tokens](https://m3.material.io/foundations/design-tokens/how-to-use-tokens). It is currently in the prototype phase,
and still being evaluated.

## Design tokens
- Design tokens are a set of variables that determine what components look like. They can affect things like color, typography, desnity, elevation, border radius, and more.
- Angular Material represents design tokens as CSS variables

## M2 vs M3 tokens
- Angular Material can use tokens corresponding to either the [Material Design 2](https://m2.material.io/) or [Material Design 3](https://m3.material.io/) spec
  - Token values for M2 can be obtained by:
    1. Generating them from an Angular Material theme object (e.g. one defined with `mat.define-light-theme`). To generate M2 tokens for a theme, pass it to the `mat.m2-tokens-from-theme` function.
  - Token values for M3 are not yet available

Example:
```scss
// Create an Angular Material theme.
$my-theme: mat.define-light-theme(...);

// Create tokens for M2 from the theme. 
$m2-tokens: mat.m2-tokens-from-theme($my-theme);
```
## Component theme configuration functions
- These functions are used to specify which tokens should be applied by the `matx.theme` mixin _and_ to customize the tokens used in that component to something other than the value from the token set
- `matx.token-defaults` is a special configuration function used to set the default token values that will be used for any components that are configured as part of the same mixin call, if no `matx.token-defaults` config is specified, only tokens for the explicitly customized properties will be emitted
- So far the following component theme configuration functions have been implemented:
  - `matx.checkbox` configures tokens for the mat-checkbox to be applied
  - `matx.card` configures tokens for the mat-card to be applied
- The returned configurations from these functions are passed to `matx.theme`
- The functions optionally accept a map of customizations as an argument which allows overriding properties tha would otherwise be derived from the default tokens.
  - Each function has its own set of supported map keys that can be used to customize the value of the underlying tokens
  - The map keys are a higher level API then the tokens, some the keys may result in a single token being change, but some may change multiple tokens
  - For supported map keys (TODO: have docs for these):
    - See `$_customization-resolvers` [here](https://github.com/angular/components/blob/main/src/material-experimental/theming/_checkbox.scss) for `matx.checkbox`
    - See `$_customization-resolvers` [here](https://github.com/angular/components/blob/main/src/material-experimental/theming/_card.scss) for `matx.card`

## Theming mixins
- There is a single mixin used for theming apps: `matx.theme` applies the theme for some set of components (specified by passing component configs)
- This mixin will always apply theme values for properties explicitly customized in the individual component configs
- This mixin will apply *all* tokens for the configured component if a `matx.token-defaults` config is specified
- This mixin emits *only* CSS variables representing design tokens
- This mixin emits the CSS vars directly under the user specified selector. This gives the user complete control over the selector specificity.
- Using `matx.theme`
  - Takes 2 arguments:
    - `$tokens` The set of token defaults that will be used for any tokens not explicitly customized by the component theme config
    - `$components` List of component theme configs indicating which components to emit tokens for, and optionally, customizations for some token values
  - Outputs CSS variables for the configured components

## Recommended theming structure
- Apply the base token values using `matx.theme` together with `matx.token-defaults` *once* (typically to the document root `html { ... }`)
- Apply incremental overrides to the theme by calling `matx.theme` *without* `matx.token-default` to emit only the properties you want to change
- Choose selectors with minimal specificity when applying tokens
- Prefer to rely on CSS inheritance to apply token overrides rather than specificity.
  For example if checkbox tokens are set on the root element (`html`) they will be inherited down
  the DOM and affect any `<mat-checkbox>` within the document. If checkboxes in a specific section
  need to appear differently, say within `.dark-sidebar`, set the token overrides on the
  `.dark-sidebar` element and they will be inherited down to the checkboxes within, instead of the
  values from the root element.
