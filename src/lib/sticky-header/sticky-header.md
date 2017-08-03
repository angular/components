The `cdkStickyHeader` directive "sticks" an element to the top of a scrolling container
while its corresponding `cdkStickyRegion` is in view.

<!-- example(sticky-header-overview) -->

The parent scrolling container for a sticky-header must be marked with `cdkScrollable`.
This scrolling container contians one or more elements with `cdkStickyRegion`,
each with their own `cdkStickyHeader`. As the regions are scrolled, the header for the
region currently within the scrolling viewport will stick to the top.

![alt text][id]

[id]: ./sticky-header.jpg

Sticky-Header should be used within a scrollable container, which is `<cdk-scrollable>`. There are two ways to use 
Sticky-Header. 

The first way is to just define a `<cdkStickyHeader>` without `<cdkStickyRegion>`. And the first direct 
parent element of the `<cdkStickyHeader>` element will be set as its sticky-region. Like this:
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
The other way to use a sticky-header is to define a sticky-region by your self. Each `cdkStickyRegion` should only have one 
`cdkStickyHeader` in it.
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
