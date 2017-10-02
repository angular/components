Badges are small status descriptors for UI elements. A badge consists of a small circle, 
typically containing a number or other short set of characters, that appears in proximity to another object.

### Customizing badge position
By default, the badge will be placed `above after`. The direction can be changed by defining
the attribute `direction` follow by `above|below` and `before|after`.

```html
<mat-badge direction="above after" content="22">
  <mat-icon>home</mat-icon>
</mat-badge>
```

The overlap of the badge in relation to its inner contents can also be defined
using the `overlap` tag. Typically, you want the badge to overlap an icon and not
a text phrase. By default it will overlap.

```html
<mat-badge overlap="false" content="22">
  Email
</mat-badge>
```

### Theming
Badges can be colored in terms of the current theme using the `color` property to set the
background color to `primary`, `accent`, or `warn`.

```html
<mat-badge color="accent" content="22">
  <mat-icon>home</mat-icon>
</mat-badge>
```

### Accessibility
Badges should be given a meaningful label via `aria-label` or `aria-labelledby` attributes.