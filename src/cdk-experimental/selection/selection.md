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
<ul cdkSelection cdkSelectionStrategy="single">
  <li *ngFor="let item of items">
    <button  [cdkSelectionToggle]="item.value">
      {{item.label}}
    </button>
  </li>
</ul>
```

### Strategies
The selection directive has 3 different strategies for selection:

- Single: Only one item can be selected at a time.
- Multiple: Multiple items can be selected by clicking
- Modifier Multiple: Multiple items can be select using keyboard modifiers such as shift or ctrl.

### Clearable
The ability to clear a selection that has been made can be prevented using the `cdkSelectionClearable`.
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
    <ul cdkSelection cdkSelectionStrategy="multiple" [cdkSelectionTrackBy]=""trackBy>
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