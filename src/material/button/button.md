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

The ARIA spec gives different uses for buttons and links. In order to give the correct information to
assistive technology, it is important to use the correct one for each situation. 

 - Use the `<button>` element for any interactions that _performs an action on the
current page_.
 - Use the `<a>` element for links. That is iteractions that _navigates to another
view_. This includes navigating to another page, another view in a single-page application and to elements on the same page. Include the href attribute when using the `<a>` element.

#### Links That Look Like Buttons
Generally, the `<a>` should be used for interactions that perform navigation. It ensures that assistive technology has the
correct semantic information for the interaction. If a `<button>` must be used, then do the following.

 - Give it the `role='link'` attribute.
 - Assign an `href` attribute with the link's destination.

#### Icon Buttons
Buttons or links containing only icons (such as `mat-fab`, `mat-mini-fab`, and `mat-icon-button`)
should be given a meaningful label via `aria-label` or `aria-labelledby`.

As always, images inside buttons should contain an meaningful alt text.

#### Stateful Buttons
The mat-button supports the `disabled` attribute for indicating to the user that is cannot be interacted with. If a button needs to have binary states, such as for pressed/not pressed or on/off, consider using a Checkbox component or a Slide Toggle component. Use the Toggle Button component for interactions with more than two states.

#### Binary State Buttons

If a `button` must be used for an interation that has two states, then follow these guidelines.

Use one of the following options to indicate the state of the button. Do not use both because it can provide confusing
information to assistive technology.
 - Toggle state by setting `aria-pressed="true"` and `false`
 - Toggle state by reassigning the button label \(e.g. _on_/_off_\)

Use `button` elements, not `a` elements

We recommend using styles that target the aria-pressed attribute, rathen than toggling a CSS class for `pressed`/`not-pressed`.

An alternative approach to make a checkbox that looks like a button using the following steps.

 - Give the button a `role='checkbox'` attribute.
 - Assign `aria-checked='true'` or `'false'` to indicate the current state.

