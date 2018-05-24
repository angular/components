**Warning: this component is still experimental. It may have bugs and the API may change at any
time**

`<cdk-virtual-scroll-viewport>` is used to display a scrolling list containing a large number of
items that would have a negative effect on performance if all rendered at once. Instead the virtual
scroll viewport renders each item as needed when the user scrolls it into view. The
`<cdk-virtual-scroll-viewport>` works together with the `*cdkVirtualFor` directive which is used to
render items inside of the viewport. It also requires that a `VirtualScrollStrategy` be provided.
The easiest way to provide a strategy is with one of the directives `itemSize` or `autosize`.

For some example usages, 
[see the demo app](https://github.com/angular/material2/tree/master/src/demo-app/virtual-scroll).

### Creating items in the viewport
`*cdkVirtualFor` should be used instead of `*ngFor` to create items in the
`<cdk-virtual-scroll-viewport>`. `*cdkVirtualFor` supports most of the same features as `*ngFor`.
The simplest usage just specifies the list of items:

```html
<cdk-virtual-scroll-viewport itemSize="50">
  <div *cdkVirtualFor="let item of items">{{item}}</div>
</cdk-virtual-scroll-viewport>
```

`*cdkVirtualFor` makes the following context variables available to the template:
* `index` - The index of the item in the data source.
* `count` - The total number of items in the data source.
* `first` - Whether this is the first item in the data source.
* `last` - Whether this is the last item in the data source.
* `even` - Whether the `index` is even.
* `odd` - Whether the `index` is odd.

All of these apply to the index of the item in the data source, not the index in the rendered
portion of the data.

```html
<cdk-virtual-scroll-viewport itemSize="50">
  <div *cdkVirtualFor="let item of items;
                       let index = index;
                       let count = count;
                       let first = first;
                       let last = last;
                       let even = even;
                       let odd = odd">
    {{item}} - {{index}} - {{count}} - {{first}} - {{last}} - {{even}} - {{odd}}
  </div>
</cdk-virtual-scroll-viewport>
```

A `trackBy` function can be specified and works the same as the `*ngFor` `trackBy`. The `index`
passed to the tracking function will be the index in the data source, not the index in the rendered
portion.

#### View recycling
In order to improve performance `*cdkVirtualFor` saves the views it creates in a cache when they are
no longer needed. This way the next time a new view is needed once can be recycled from the cache
rather than being created from scratch. The size of this cache can be adjusted using the
`templateCacheSize` input. The cache size defaults to `20` and caching can be disabled by setting it
to `0`.

```html
<cdk-virtual-scroll-viewport itemSize="50">
  <div *cdkVirtualFor="let item of items; templateCacheSize: 0">{{item}}</div>
</cdk-virtual-scroll-viewport>
```

#### Specifying items with an Observable or DataSource
`*cdkVirtualFor` is set up to accept data from an `Array`, `Observable`, or `DataSource`. The
`DataSource` for the virtual scroll is the same one used by the table and tree components. A
`DataSource` is simply an abstract class that has two methods: `connect` and `disconnect`. The
`connect` method will be called by the virtual scroll viewport to receive a stream that emits the
data array that should be rendered. The viewport will call `disconnect` when the viewport is
destroyed, which may be the right time to clean up any subscriptions that were registered during the
connect process.

### Scrolling over fixed size items
If you're scrolling over a list of items that are all the same fixed size, you can use the
`FixedSizeVirtualScrollStrategy`. This can be easily added to your viewport using the `itemSize`
directive.

```html
<cdk-virtual-scroll-viewport itemSize="50">
  ...
</cdk-virtual-scroll-viewport>
```

The fixed size strategy also supports setting the buffer size, i.e. the number of items rendered
beyond the edge of the viewport. This can be adjusted by setting the `bufferSize` input. If not
specified, the `bufferSize` defaults to `5`.

```html
<cdk-virtual-scroll-viewport itemSize="50" bufferSize="1">
  ...
</cdk-virtual-scroll-viewport>
```

**Note: The fixed size strategy will likely be changed to allow specifying a separate
`minBufferPx` and `addBufferPx` like the autosize strategy**

### Scrolling over items with different sizes
If you're scrolling over a list of items with different sizes, you can use the
`AutoSizeVirtualScrollStrategy`. This can be added to your viewport by using the `autosize`
directive.

```html
<cdk-virtual-scroll-viewport autosize>
  ...
</cdk-virtual-scroll-viewport>
```

The `autosize` strategy allows the buffer to be configured through two inputs `minBufferPx` and
`addBufferPx`. The `minBufferPx` is the minimum amount of buffer (in pixels) that the viewport
should try to maintain on either side of the viewport. The `addBufferPx` is the amount of buffer
(in pixels) that the viewport should try to render out when it detects that the buffer has dropped
below the `minBufferPx`. It's helpful for this to be a little larger than the `minBufferPx` as it
allows the viewport to render out new buffer items in batches rather than constantly needing to
render new ones. By default the `minBufferPx` is `100` and the default `addBufferPx` is `200`.

```html
<cdk-virtual-scroll-viewport autosize minBufferPx="50" addBufferPx="100">
  ...
</cdk-virtual-scroll-viewport>
```

Because the auto size strategy needs to measure the size of the elements, its performance may not
be as good as the fixed size strategy. 

### Setting the viewport orientation
The orientation of the viewport can be adjusted by using the `orientation` input. It defaults to
`vertical` which virtualizes scrolling along the y-axis. It can be set to `horizontal` to virtualize
scrolling along the x-axis. If you use this option you need to make sure that the content is
actually laid out so that it extends along the x-axis. To do this you may want to target CSS at
`.cdk-virtual-scroll-content-wrapper` which is the wrapper element that contains the rendered
content.

```html
<cdk-virtual-scroll-viewport autosize orientation="horizontal">
  ...
</cdk-virtual-scroll-viewport>
```
