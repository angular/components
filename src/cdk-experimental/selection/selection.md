The `selection` package handles managing selection state on components
with support for single and multi select with keyboard modifiers.

Components such as buttons, checkboxes, etc can all be decorated with
the `cdkSelectionToggle` directive. Once decorated, the directive
will listen for mouse and keyboard events and coordinate the
selection options with the parent `cdkSelection` directive.

In the example below, the div container of the buttons is decorated with `cdkSelection`. To populate 
default selections pass an array of the selections to this option like:
`[cdkSelection]="['yellow']"`. Nested beneath the selection directive is a button decorated
with the `cdkSelectionToggle` directive with an argument of the item's value property.

```html
<ul cdkSelection cdkSelectionMode="single">
  <li *ngFor="let item of items">
    <button  [cdkSelectionToggle]="item.value">
      {{item.label}}
    </button>
  </li>
</ul>
```

### Modes
The selection directive has 2 different modes for selection:

- Single: Only one item can be selected at a time.
- Multiple: Multiple items can be selected.

### Key Modifier
When multi-selection mode is enabled anytime a user clicks a toggle element it will be selected.
The `requireModifier` property will only allow multi-selection when using key modifiers. For example,
CTRL/Command + Click would select multiples and SHIFT + Click would select a range.

### Deselectable
The ability to deselect a selection that has been made can be prevented using the `cdkSelectionDeselectable`.
This means that after a selection (or many selections) have been made users can deselect
all but one of the selections. This concept can be related to radio buttons selection strategy.

### Tracking
When using complex objects with the selection toggle, custom tracking strategies
can ensure correct identification of the values. The `cdkSelectionTrackBy` accepts
a function that will be invoked with the values of the toggle. This can be used to
return a identifying attribute for the object.

```TS
@Component({
  template: `
    <ul cdkSelection cdkSelectionMode="multiple" [cdkSelectionTrackBy]=""trackBy>
      <li *ngFor="let item of items">
        <button [cdkSelectionToggle]="item">
          {{item.label}}
        </button>
      </li>
    </ul>
  `
})
export class MyComponent {
  trackBy(model) {
    return model.value;
  }
}
```