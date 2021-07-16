Angular Material buttons are native `<button>` or `<a>` elements enhanced with Material Design
styling and ink ripples.

<!-- example(button-overview) -->

Native `<button>` and `<a>` elements are always used in order to provide the most straightforward
and accessible experience for users. A `<button>` element should be used whenever some _action_
is performed. An `<a>` element should be used whenever the user will _navigate_ to another view.


There are several button variants, each applied as an attribute:

| Attribute            | Description                                                              |
|----------------------|--------------------------------------------------------------------------|
| `mat-button`         | Rectangular text button w/ no elevation                                  |
| `mat-raised-button`  | Rectangular contained button w/ elevation                                |
| `mat-flat-button`    | Rectangular contained button w/ no elevation                             |
| `mat-stroked-button` | Rectangular outlined button w/ no elevation                              |
| `mat-icon-button`    | Circular button with a transparent background, meant to contain an icon  |
| `mat-fab`            | Circular button w/ elevation, defaults to theme's accent color           |
| `mat-mini-fab`       | Same as `mat-fab` but smaller                                            |


### Theming
Buttons can be colored in terms of the current theme using the `color` property to set the
background color to `primary`, `accent`, or `warn`.

### Capitalization
According to the Material design spec button text has to be capitalized, however we have opted not
to capitalize buttons automatically via `text-transform: uppercase`, because it can cause issues in
certain locales. It is also worth noting that using ALL CAPS in the text itself causes issues for
screen-readers, which will read the text character-by-character. We leave the decision of how to
approach this to the consuming app.

### Accessibility
Angular Material uses native <button> and <a> elements. Both of the two look the same when applied Material Design Styling, but have different semantic meaning for assitive technology. To ensure an accessible experience, choose the element which is most approprite for the purpose of the interaction.

#### Performing an Action
Use the `<button>` element for interactions that _perform an action on the current page_.
 - submitting a form
 - sending a chat message
 - copying content to the clipboard

#### Navigation
Use the `<a>` element for interactions that _navigate to another view_.
 - navigating to a different page
 - navigating to a view in a single-page application
 - navigating to an element on the same page

Use the `href` attribute when using the `<a>` element. The content of the `<a>` element should describe the link's destination.

#### Icon Buttons

For buttons or links containg only icons, follow the [instructions for interactive icons](https://material.angular.io/components/icon/overview#interactive-icons). This applies to `mat-fab`, `mat-mini-fab`, `mat-icon-button`, and any buttons that do not have text content.
