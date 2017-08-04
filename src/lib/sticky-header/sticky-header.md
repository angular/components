The `cdkStickyHeader` directive "sticks" an element to the top of a scrolling container
while its corresponding `cdkStickyRegion` is in view.

<!-- example(sticky-header-overview) -->

The parent scrolling container for a sticky-header must be marked with `cdkScrollable`.
This scrolling container contains one or more elements with `cdkStickyRegion`,
each with their own `cdkStickyHeader`. As the regions are scrolled, the header for the
region currently within the scrolling viewport will stick to the top.

If no `cdkStickyRegion` is explicitly defined for a sticky-header, the directive will use its 
immediate parent element. 

Examples are as follow:

1. `cdkStickyHeader` without `cdkStickyRegion`':
```html
<div cdk-scrollable>
  <div>
     <h2 cdkStickyHeader>Unread Messages</h2>
     <p>This is a</p>
     <p>example demo</p>
     <p>For sticky-header</p>
  </div>
  <div>
     <h2 cdkStickyHeader>Deleted Messages</h2>
     <p>This is another</p>
     <p>example demo</p>
     <p>For sticky-header</p>
  </div>
</div>
```

2. `cdkStickyHeader` with `cdkStickyRegion`':
```html
<div cdk-scrollable>
  <div cdkStickyRegion>
     <h2 cdkStickyHeader>Unread Messages</h2>
     <p>This is a</p>
     <p>example demo</p>
     <p>For sticky-header</p>
  </div>
  <div cdkStickyRegion>
     <h2 cdkStickyHeader>Deleted Messages</h2>
     <p>This is another</p>
     <p>example demo</p>
     <p>For sticky-header</p>
  </div>
</div>
```
