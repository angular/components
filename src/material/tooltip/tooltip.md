The Angular Material tooltip provides a text label that is displayed when the user hovers
over or longpresses an element.

<!-- example(tooltip-overview) -->

### Positioning

The tooltip will be displayed below the element but this can be configured using the
`matTooltipPosition` input.
The tooltip can be displayed above, below, left, or right of the element. By default the position
will be below. If the tooltip should switch left/right positions in an RTL layout direction, then
the positions `before` and `after` should be used instead of `left` and `right`, respectively.

| Position  | Description                                                                          |
|-----------|--------------------------------------------------------------------------------------|
| `above`   | Always display above the element                                                     |
| `below`   | Always display beneath the element                                                   |
| `left`    | Always display to the left of the element                                            |
| `right`   | Always display to the right of the element                                           |
| `before`  | Display to the left in left-to-right layout and to the right in right-to-left layout |
| `after`   | Display to the right in left-to-right layout and to the left in right-to-left layout |

Based on the position in which the tooltip is shown, the `.mat-tooltip-panel` element will receive a
CSS class that can be used for style (e.g. to add an arrow). The possible classes are
`mat-tooltip-panel-above`, `mat-tooltip-panel-below`, `mat-tooltip-panel-left`,
`mat-tooltip-panel-right`.

<!-- example(tooltip-position) -->

To display the tooltip relative to the mouse or touch that triggered it, use the
`matTooltipPositionAtOrigin` input.
With this setting turned on, the tooltip will display relative to the origin of the trigger rather
than the host element. In cases where the tooltip is not triggered by a touch event or mouse click,
it will display the same as if this setting was turned off.

### Showing and hiding

By default, the tooltip will be immediately shown when the user's mouse hovers over the tooltip's
trigger element and immediately hides when the user's mouse leaves.

On mobile, the tooltip is displayed when the user longpresses the element and hides after a
delay of 1500ms.

#### Show and hide delays

To add a delay before showing or hiding the tooltip, you can use the inputs `matTooltipShowDelay`
and `matTooltipHideDelay` to provide a delay time in milliseconds.

The following example has a tooltip that waits one second to display after the user
hovers over the button, and waits two seconds to hide after the user moves the mouse away.

<!-- example(tooltip-delay) -->

#### Changing the default delay behavior

You can configure your app's tooltip default show/hide delays by configuring and providing
your options using the `MAT_TOOLTIP_DEFAULT_OPTIONS` injection token.

<!-- example(tooltip-modified-defaults) -->

#### Manually calling show() and hide()

To manually cause the tooltip to show or hide, you can call the `show` and `hide` directive methods,
which both accept a number in milliseconds to delay before applying the display change.

<!-- example(tooltip-manual) -->

#### Disabling the tooltip from showing

To completely disable a tooltip, set `matTooltipDisabled`. While disabled, a tooltip will never be
shown.

### Accessibility

`MatTooltip` adds an `aria-describedby` description that provides a reference
to a visually hidden element containing the tooltip's message. This provides screen-readers
the information needed to read out the tooltip's contents when the end-user focuses on
tooltip's trigger. The element referenced by `aria-describedby` is not the tooltip itself,
but instead an invisible copy of the tooltip content that is always present in the DOM.

Avoid interactions that exclusively show a tooltip with pointer events like click and mouseenter.
Always ensure that keyboard users can perform the same set of actions available to mouse and
touch users.
