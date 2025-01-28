Angular Material buttons are native `<button>` or `<a>` elements enhanced with Material Design
styling and ink ripples.

<!-- example(button-overview) -->

Native `<button>` and `<a>` elements are always used in order to provide the most straightforward
and accessible experience for users. A `<button>` element should be used whenever some _action_
is performed. An `<a>` element should be used whenever the user will _navigate_ to another view.


There are several button variants, each applied as an attribute:

| Attribute            | Description                                                              |
|----------------------|--------------------------------------------------------------------------|
| `mat-button`         | Rectangular text button w/ no elevation and rounded corners                                 |
| `mat-raised-button`  | Rectangular contained button w/ elevation and rounded corners                               |
| `mat-flat-button`    | Rectangular contained button w/ no elevation and rounded corners                            |
| `mat-stroked-button` | Rectangular outlined button w/ no elevation and rounded corners                             |
| `mat-icon-button`    | Circular button with a transparent background, meant to contain an icon  |
| `mat-fab`            | Square button w/ elevation and rounded corners, meant to contain an icon. Can be [extended](https://material.angular.io/components/button/overview#extended-fab-buttons) to a rectangle to also fit a label           |
| `mat-mini-fab`       | Same as `mat-fab` but smaller                                            |


### Extended fab buttons
Traditional fab buttons are circular and only have space for a single icon. However, you can add the
`extended` attribute to allow the fab to expand into a rounded rectangle shape with space for a text
label in addition to the icon. Only full sized fabs support the `extended` attribute, mini fabs do
not.

```html
<button mat-fab extended>
  <mat-icon>home</mat-icon>
  Home
</button>
```

### Interactive disabled buttons
Native disabled `<button>` elements cannot receive focus and do not dispatch any events. This can
be problematic in some cases because it can prevent the app from telling the user why the button is
disabled. You can use the `disabledInteractive` input to style the button as disabled but allow for
it to receive focus and dispatch events. The button will have `aria-disabled="true"` for assistive
technology. The behavior can be configured globally through the `MAT_BUTTON_CONFIG` injection token.

**Note:** Using the `disabledInteractive` input can result in buttons that previously prevented
actions to no longer do so, for example a submit button in a form. When using this input, you should
guard against such cases in your component.

<!-- example(button-disabled-interactive) -->

### Accessibility
Angular Material uses native `<button>` and `<a>` elements to ensure an accessible experience by
default. A `<button>` element should be used for any interaction that _performs an action on the
current page_. An `<a>` element should be used for any interaction that _navigates to another
URL_. All standard accessibility best practices for buttons and anchors apply to `MatButton`.

#### Capitalization
Using ALL CAPS in the button text itself causes issues for screen-readers, which
will read the text character-by-character. It can also cause issues for localization.
We recommend not changing the default capitalization for the button text.

#### Disabling anchors
`MatAnchor` supports disabling an anchor in addition to the features provided by the native
`<a>` element. When you disable an anchor, the component sets `aria-disabled="true"` and
`tabindex="-1"`. Always test disabled anchors in your application to ensure compatibility
with any assistive technology your application supports.

#### Buttons with icons
Buttons or links containing only icons (such as `mat-fab`, `mat-mini-fab`, and `mat-icon-button`)
should be given a meaningful label via `aria-label` or `aria-labelledby`. [See the documentation
for `MatIcon`](https://material.angular.io/components/icon) for more
information on using icons in buttons. Additionally, to be fully accessible the icon should have a minimum touch-target of 48x48 to ensure that the icon is easily clickable particularly on mobile devices and small screens.

#### Toggle buttons
[See the documentation for `MatButtonToggle`](https://material.angular.io/components/button-toggle)
for information on stateful toggle buttons.
