# md-popover

`md-popover` is a floating panel containing content that displays when triggered.

### Not yet implemented

- `prevent-close` option, to turn off automatic popover close when clicking outside the popover
- Custom offset support
- Popover groupings (which popovers are allowed to open together)

## Usage

### Simple popover

In your template, create an `md-popover` element. You can use any html or component for the content.

*my-comp.html*
```html
<!-- this popover starts as hidden by default -->
<md-popover>
  <md-card>
    <md-card-content>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </p>
    </md-card-content>
    <md-card-actions>
      <button md-button>Action</button>
    </md-card-actions>
  </md-card>
</md-popover>
```

Popovers are hidden by default, so you'll want to connect up a popover trigger that can open your popover.
You can do so by adding a button tag with an `mdPopoverTriggerFor` attribute and passing in the popover
instance.  You can create a local reference to your popover instance by adding `#popover="mdPopover"` to
your popover element.

*my-comp.html*
```html
<!-- popover opens when trigger button is clicked -->
<button md-icon-button [mdPopoverTriggerFor]="popover">
   <md-icon>more_vert</md-icon>
</button>

<md-popover #popover="mdPopover">
  <div>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </p>
    <p>
      <button md-icon-button>
      <md-icon>info</md-icon>
      </button>
    </p>
  </div>
</md-popover>
```

Output:


### Toggling the popover programmatically

You can also use the popover's API to open or close the popover programmatically from your class. Please
note that in this case, an `mdPopoverTriggerFor` attribute is still necessary to connect
the popover to its trigger element in the DOM.

*my-comp.component.ts*
```ts
class MyComp {
  @ViewChild(MdPopoverTrigger) trigger: MdPopoverTrigger;

  someMethod() {
    this.trigger.openPopover();
  }
}
```

*my-comp.html*
```html
<button md-icon-button [mdPopoverTriggerFor]="popover">
   <md-icon>more_vert</md-icon>
</button>

<md-popover #popover="mdPopover">
  <div>
    
  </div>
</md-popover>
```


### Customizing popover position

By default, the popover will display after and below its trigger.  You can change this display position
using the `x-position` (`before | after`) and `y-position` (`above | below`) attributes. The popover
can be positioned over the popover button or outside using `overlapTrigger` (`true | false`).

*my-comp.html*
```html
<md-popover x-position="before" #popover="mdPopover">
  <div>
    Contents
  </div>
</md-popover>
```

Output:



### Accessibility

The popover adds `role="dialog"` to the main popover element.


### Popover attributes

| Signature | Values | Description |
| --- | --- | --- |
| `x-position` | `before|after` | The horizontal position of the popover in relation to the trigger. Defaults to `after`. |
| `y-position` | `above|below` | The vertical position of the popover in relation to the trigger. Defaults to `below`. |
| `overlapTrigger` | `true|false` | Whether to have the popover show on top of the popover trigger or outside. Defaults to `true`. |
| `mdPopoverTrigger` | `hover|click` | Trigger event type. Defaults to `hover`. |
| `mdPopoverDelay` | `300` | Delay for trigger hover. Defaults to `300`. |

### Trigger Programmatic API

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| `popoverOpen` | `Boolean` | Property that is true when the popover is open. It is not settable (use methods below). |
| `onPopoverOpen` | `Observable<void>` | Observable that emits when the popover opens. |
| `onPopoverClose` | `Observable<void>` | Observable that emits when the popover closes. |

**Methods**

| Method | Returns | Description |
| --- | --- | --- |
| `openPopover()` | `Promise<void>` | Opens the popover. Returns a promise that will resolve when the popover has opened. |
| `closePopover()` | `Promise<void>` | Closes the popover. Returns a promise that will resolve when the popover has closed. |
| `togglePopover()` | `Promise<void>` | Toggles the popover. Returns a promise that will resolve when the popover has completed opening or closing. |
| `destroyPopover()` | `Promise<void>` | Destroys the popover overlay completely.


