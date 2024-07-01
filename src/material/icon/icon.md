`mat-icon` makes it easier to use _vector-based_ icons in your app.  This directive supports both
icon fonts and SVG icons, but not bitmap-based formats (png, jpg, etc.).

<!-- example(icon-overview) -->

### Registering icons

`MatIconRegistry` is an injectable service that allows you to associate icon names with SVG URLs,
HTML strings and to define aliases for CSS font classes. Its methods are discussed below and listed
in the API summary.

### Font icons with ligatures

Some fonts are designed to show icons by using
[ligatures](https://en.wikipedia.org/wiki/Typographic_ligature), for example by rendering the text
"home" as a home image. To use a ligature icon, put its text in the content of the `mat-icon`
component.

By default, `<mat-icon>` expects the
[Material icons font](https://google.github.io/material-design-icons/#icon-font-for-the-web).
(You will still need to include the HTML to load the font and its CSS, as described in the link).

You can specify a different font, such as Material's latest icons,
[Material Symbols](https://fonts.google.com/icons), by setting the `fontSet` input to either the
CSS class to apply to use the desired font, or to an alias previously registered with
`MatIconRegistry.registerFontClassAlias`. Alternatively you can set the default for all
your application's icons using `MatIconRegistry.setDefaultFontSetClass`.

### Font icons with CSS

Fonts can also display icons by defining a CSS class for each icon glyph, which typically uses a
`:before` selector to cause the icon to appear.
[Font Awesome](https://fontawesome.com/icons) uses this approach to display
its icons. To use such a font, set the `fontSet` input to the font's CSS class (either the class
itself or an alias registered with `MatIconRegistry.registerFontClassAlias`), and set the `fontIcon`
input to the class for the specific icon to show.

For both types of font icons, you can specify the default font class to use when `fontSet` is not
explicitly set by calling `MatIconRegistry.setDefaultFontSetClass`.

### SVG icons

`<mat-icon>` displays SVG icons by directly inlining the SVG content into the DOM
as a child of itself. This approach offers an advantage over an `<img>` tag or a CSS
`background-image` because it allows styling the SVG with CSS. For example, the default color of the
SVG content is the CSS
[currentColor](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#currentColor_keyword)
value. This makes SVG icons by default have the same color as surrounding text, and allows you to
change the color by setting the `color` style on the `mat-icon` element.

In order to guard against XSS vulnerabilities, any SVG URLs and HTML strings passed to the
`MatIconRegistry` must be marked as trusted by using Angular's `DomSanitizer` service.

`MatIconRegistry` fetches all remote SVG icons via Angular's `HttpClient` service. If you haven't
included [`HttpClientModule` from the `@angular/common/http` package](https://angular.io/guide/http)
in your `NgModule` imports, you will get an error at runtime.

Note that `HttpClient` fetches SVG icons registered with a URL via `XmlHttpRequest`, subject to the
[Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy). This
means that icon URLs must have the same origin as the containing page or that the application's
server must be configured to allow cross-origin requests.

#### Named icons

To associate a name with an icon URL, use the `addSvgIcon`, `addSvgIconInNamespace`,
`addSvgIconLiteral` or `addSvgIconLiteralInNamespace` methods of `MatIconRegistry`. After
registering an icon, it can be displayed by setting the `svgIcon` input. For an icon in the
default namespace, use the name directly. For a non-default namespace, use the format
`[namespace]:[name]`.

#### Icon sets

Icon sets allow grouping multiple icons into a single SVG file. This is done by creating a single
root `<svg>` tag that contains multiple nested `<svg>` tags in its `<defs>` section. Each of these
nested tags is identified with an `id` attribute. This `id` is used as the name of the icon.

Icon sets are registered using the `addSvgIconSet`, `addSvgIconSetInNamespace`,
`addSvgIconSetLiteral` or `addSvgIconSetLiteralInNamespace` methods of `MatIconRegistry`.
After an icon set is registered, each of its embedded icons can be accessed by their `id`
attributes. To display an icon from an icon set, use the `svgIcon` input in the same way
as for individually registered icons.

Multiple icon sets can be registered in the same namespace. Requesting an icon whose id appears in
more than one icon set, the icon from the most recently registered set will be used.

### Accessibility

Similar to an `<img>` element, an icon alone does not convey any useful information for a
screen-reader user. The user of `<mat-icon>` must provide additional information pertaining to how
the icon is used. Based on the use-cases described below, `mat-icon` is marked as
`aria-hidden="true"` by default, but this can be overridden by adding `aria-hidden="false"` to the
element.

In thinking about accessibility, it is useful to place icon use into one of three categories:
1. **Decorative**: the icon conveys no real semantic meaning and is purely cosmetic.
2. **Interactive**: a user will click or otherwise interact with the icon to perform some action.
3. **Indicator**: the icon is not interactive, but it conveys some information, such as a status.
This includes using the icon in place of text inside of a larger message.

#### Decorative icons
When the icon is purely cosmetic and conveys no real semantic meaning, the `<mat-icon>` element
is marked with `aria-hidden="true"`.

#### Interactive icons
Icons alone are not interactive elements for screen-reader users; when the user would interact with
some icon on the page, a more appropriate  element should "own" the interaction:
* The `<mat-icon>` element should be a child of a `<button>` or `<a>` element.
* The parent `<button>` or `<a>` should either have a meaningful label provided either through
direct text content, `aria-label`, or `aria-labelledby`.

#### Indicator icons
When the presence of an icon communicates some information to the user whether as an indicator or
by being inlined into a block of text, that information must also be made available to
screen-readers. The most straightforward way to do this is to
1. Add a `<span>` as an adjacent sibling to the `<mat-icon>` element with text that conveys the same
information as the icon.
2. Add the `cdk-visually-hidden` class to the `<span>`. This will make the message invisible
on-screen but still available to screen-reader users.

### Bidirectionality

By default icons in an RTL layout will look exactly the same as in LTR, however certain icons have
to be [mirrored for RTL users](https://material.io/design/usability/bidirectionality.html). If
you want to mirror an icon only in an RTL layout, you can use the `mat-icon-rtl-mirror` CSS class.

```html
<mat-icon class="mat-icon-rtl-mirror" svgIcon="thumb-up"></mat-icon>
```
