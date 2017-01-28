`<md-popover>` is a floating panel containing content. 

<!-- example(popover-overview) -->

By itself, the `<md-popover>` element does not render anything. The popover is attached to and opened 
via application of the `mdPopoverTriggerFor` directive:
```html
<md-popover #appPopover="mdPopover" x-position="after" y-position="below" 
            [overlapTrigger]="false" mdPopoverTrigger="hover" 
            mdPopoverPlacement="bottom" [mdPopoverDelay]="400">
            

  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad</p>

        
</md-popover>

<button md-icon-button [mdPopoverTriggerFor]="appPopover">
   Popover
</button>
```

### Toggling the popover programmatically
The popover exposes an API to open/close programmatically. Please note that in this case, an 
`mdPopoverTriggerFor` directive is still necessary to attach the popover to a trigger element in the DOM.

```ts
class MyComponent {
  @ViewChild(MdPopoverTrigger) trigger: MdPopoverTrigger;

  someMethod() {
    this.trigger.openPopover();
  }
}
```


### Customizing popover position

By default, the popover will display below (y-axis), after (x-axis), and overlapping its trigger.  The position can be changed
using the `x-position` (`before | after`) and `y-position` (`above | below`) attributes.
The popover can be be forced to not overlap the trigger using `[overlapTrigger]="false"` attribute.
