Angular Material `<sticky-header>` is an attribute/component which makes DOM elements sticky to a specific parent.

<!-- example(sticky-header-overview) -->

The sticky-header is a useful component when users want to implement a container focusing on displaying headers,
subheaders and detailed contents. It can make the header of every `<cdkStickyRegion>` element stick to the top of
the container while scrolling. When the current `<cdkStickyRegion>` element is completely scrolled out of the upper 
scrollable container, the following `<cdkStickyRegion>` element header will replace it. 

There are two ways to use Sticky-Header.

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
