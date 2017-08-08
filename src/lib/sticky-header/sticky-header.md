The `cdkStickyHeader` directive "sticks" an element to the top of a scrolling container
while its corresponding `cdkStickyRegion` is in view.

<!-- example(sticky-header-overview) -->

The parent scrolling container for a sticky-header must be marked with `cdkScrollable`.
This scrolling container contains one or more elements with `cdkStickyRegion`,
each with their own `cdkStickyHeader`. As the regions are scrolled, the header for the
region currently within the scrolling viewport will stick to the top.

If no `cdkStickyRegion` is explicitly defined for a sticky-header, the directive will use its 
immediate parent element. 
