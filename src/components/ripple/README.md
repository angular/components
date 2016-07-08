# md-ink-ripple

`md-ink-ripple` defines an area in which a ripple animates, usually in response to user action.

By default, an `md-ink-ripple` component is activated when its parent element receives mouse or touch events. On a mousedown or touch start, the ripple background fades in. When the click event complets, a circular foreground ripple fades in and expands from the event location to cover the component bounds.

Ripples can also be triggered programatically by getting a reference to the MdInkRipple component and calling its `start` and `end` methods.


### Upcoming work

Ripples will be added to `md-button`, `md-radio-button`, and `md-checkbox` components.

### API Summary

Properties:

| Name | Type | Description |
| --- | --- | --- |
| `trigger` | Element | The DOM element that triggers the ripple when clicked. Defaults to the parent of the `md-ink-ripple`.
| `color` | string | Custom color for foreground ripples
| `backgroundColor` | string | Custom color for the ripple background
| `centered` | boolean | If true, the ripple animation originates from the center of the `md-ink-ripple` bounds rather than from the location of the click event.
| `maxRadius` | number | Optional fixed radius of foreground ripples when fully expanded. Mainly used in conjunction with `unbounded` attribute. If not set, ripples will expand from their origin to the most distant corner of the component's bounding rectangle.
| `unbounded` | boolean | If true, foreground ripples will be visible outside the component's bounds.
| `focused` | boolean | If true, the background ripple is shown using the current theme's accent color to indicate focus.
| `disabled` | boolean | If true, click events on the trigger element will not activate ripples. The `start` and `end` methods can still be called to programatically create ripples.
