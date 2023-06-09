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
- These functions are used to specify which tokens should be applied by the theming mixins _and_ to customize the tokens used in that component to something other than the value from the token set
- So far the following component theme configuration functions have been implements:
  - `matx.checkbox` configures tokens for the mat-checkbox to be applied
  - `matx.card` configures tokens for the mat-card to be applied
- The returned configurations from these functions are passed to `matx.theme` or `matx.retheme`
- If no arguments are passed, the configuration instructs the mixin to just output the default value for all of the tokens needed by that component
- The functions can also accept a map of customizations as an argument.
  - Each function has its own set of supported map keys that can be used to customize the value of the underlying tokens
  - The map keys are a higher level API then the tokens, some of the keys may result in a single token being change, but some may change multiple tokens
  - For supported map keys (TODO: have docs for these):
    - See `$_customization-resolvers` [here](https://github.com/angular/components/blob/main/src/material-experimental/theming/_checkbox.scss) for `matx.checkbox`
    - See `$_customization-resolvers` [here](https://github.com/angular/components/blob/main/src/material-experimental/theming/_card.scss) for `matx.card`

## Theming mixins
- There are 2 mixins used for theming apps
    - `matx.theme` is intended to apply the full theme for some components, with all tokens they need to function.
    - `matx.retheme` is intended to re-apply specific tokens to change the appearance for some components by overriding the tokens applied by `matx.theme`.
- Both mixins emit *only* CSS variables representing design tokens
- Both mixins emit their tokens directly under the user specified selector. This gives the user complete control over the selector specificity.
- Using `matx.theme`
  - Takes 2 arguments:
    - `$tokens` The set of token defaults that will be used for any tokens not explicitly customized by the component theme config
    - `$components` List of component theme configs indicating which components to emit tokens for, and optionally, customizations for some token values
  - Outputs *all* tokens used by the configured components
- Using `matx.retheme`
  - Takes 1 argument:
    - `$components` List of component theme configs to emit customized token values for
  - Outputs *only* the explicitly customized tokens, not any of the other tokens used by the component

## Recommended theming structure
- Apply the base token values using `matx.theme` *once*
- Choose selectors with minimal specificity when applying tokens
- Prefer to rely on CSS inheritance to apply token overrides rather than specificity.
  For example if checkbox tokens are set on the root element (`html`) they will be inherited down
  the DOM and affect any `<mat-checkbox>` within the document. If checkboxes in a specific section
  need to appear differently, say within `.dark-sidebar`, set the token overrides on the
  `.dark-sidebar` element and they will be inherited down to the checkboxes within, instead of the
  values from the root element.
- For a small example, see this [alternate partial theme](https://github.com/angular/components/blob/main/src/dev-app/theme-token-api.scss) for the dev-app
