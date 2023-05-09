Badges are small status descriptors for UI elements. A badge consists of a small circle, 
typically containing a number or other short set of characters, that appears in proximity to
another object.

Badges must always be applied to [block-level elements][block-level].

[block-level]: https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements

<!-- example(badge-overview) -->

### Badge position
By default, the badge will be placed `above after`. The direction can be changed by defining
the attribute `matBadgePosition` follow by `above|below` and `before|after`.

<!-- example({"example":"badge-overview",
              "file":"badge-overview-example.html", 
              "region":"mat-badge-position"}) -->

The overlap of the badge in relation to its inner contents can also be defined
using the `matBadgeOverlap` tag. Typically, you want the badge to overlap an icon and not
a text phrase. By default it will overlap.

<!-- example({"example":"badge-overview",
              "file":"badge-overview-example.html", 
              "region":"mat-badge-overlap"}) -->

### Badge sizing
The badge has 3 sizes: `small`, `medium` and `large`. By default, the badge is set to `medium`.
You can change the size by adding `matBadgeSize` to the host element.

<!-- example({"example":"badge-overview",
              "file":"badge-overview-example.html", 
              "region":"mat-badge-size"}) -->

### Badge visibility
The badge visibility can be toggled programmatically by defining `matBadgeHidden`.

<!-- example({"example":"badge-overview",
              "file":"badge-overview-example.html", 
              "region":"mat-badge-hide"}) -->

### Theming
Badges can be colored in terms of the current theme using the `matBadgeColor` property to set the
background color to `primary`, `accent`, or `warn`.

<!-- example({"example":"badge-overview",
              "file":"badge-overview-example.html", 
              "region":"mat-badge-color"}) -->

### Accessibility
You must provide a meaningful description via `matBadgeDescription`. When attached to an interactive
element, `MatBadge` applies this description to its host via `aria-describedby`. When attached to
a non-interactive element, `MatBadge` appends a visually-hidden, inline description element. The
badge determines interactivity based on whether the host element is focusable.

When applying a badge to a `<mat-icon>`, it is important to know that `<mat-icon>` is
`aria-hidden="true"` by default. If the combination of icon and badge communicates meaningful
information, always surface this information in another way. [See the guidance on indicator
icons for more information](https://material.angular.io/components/icon/overview#indicator-icons).
