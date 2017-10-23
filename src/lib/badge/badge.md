Badges are small status descriptors for UI elements. A badge consists of a small circle, 
typically containing a number or other short set of characters, that appears in proximity to another object.

### Badge position
By default, the badge will be placed `above after`. The direction can be changed by defining
the attribute `matBadgePosition` follow by `above|below` and `before|after`.

```html
<mat-icon matBadge="22" matBadgePosition="above after">home</mat-icon>
```

The overlap of the badge in relation to its inner contents can also be defined
using the `matBadgeOverlap` tag. Typically, you want the badge to overlap an icon and not
a text phrase. By default it will overlap.

```html
<h1 matBadge="11" matBadgeOverlap="false">
  Email
</h1>
```

### Theming
Badges can be colored in terms of the current theme using the `matBadgeColor` property to set the
background color to `primary`, `accent`, or `warn`.

```html
<mat-icon matBadge="22" matBadgeColor="accent">
  home
</mat-icon>
```

### Accessibility
Badges should be given a meaningful label via `aria-label` or `aria-labelledby` attributes.