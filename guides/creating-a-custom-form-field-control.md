# Creating a custom form field control

It is possible to create custom form field controls that can be used inside `<mat-form-field>`. This
can be useful if you need to create a component that shares a lot of common behavior with a form
field, but adds some additional logic.

For example in this guide we'll learn how to create a custom input for inputting US telephone
numbers and hook it up to work with `<mat-form-field>`. Here is what we'll build by the end of this
guide:

<!-- example(form-field-custom-control) -->

In order to learn how to build custom form field controls, let's start with a simple input component
that we want to work inside the form field. For example, a phone number input that segments the
parts of the number into their own inputs. (Note: this is not intended to be a robust component,
just a starting point for us to learn.)

```ts
class MyTel {
  constructor(readonly area: string, readonly exchange: string, readonly subscriber: string) {}
}

@Component({
  selector: 'example-tel-input',
  template: `
    <div role="group" class="example-tel-input-container">
      <input class="example-tel-input-element" [formField]="parts.area" size="3" aria-label="Area code">
      <span>&ndash;</span>
      <input class="example-tel-input-element" [formField]="parts.exchange" size="3" aria-label="Exchange code">
      <span>&ndash;</span>
      <input class="example-tel-input-element" [formField]="parts.subscriber" size="4" aria-label="Subscriber number">
    </div>
  `,
  imports: [FormField],
  styles: [`
    div {
      display: flex;
    }
    input {
      border: none;
      background: none;
      padding: 0;
      outline: none;
      font: inherit;
      text-align: center;
      color: currentColor;
    }
  `],
})
export class MyTelInput implements FormValueControl<MyTel | null> {
  readonly partsModel = signal({
    area: '',
    exchange: '',
    subscriber: '',
  });

  readonly parts = form(this.partsModel, schemaPath => {
    required(schemaPath.area);
    minLength(schemaPath.area, 3);
    maxLength(schemaPath.area, 3);
    required(schemaPath.exchange);
    minLength(schemaPath.exchange, 3);
    maxLength(schemaPath.exchange, 3);
    required(schemaPath.subscriber);
    minLength(schemaPath.subscriber, 4);
    maxLength(schemaPath.subscriber, 4);
  });

  readonly value = model<MyTel | null>(null);

  constructor() {
    effect(() => {
      const {area, exchange, subscriber} = this.partsModel();
      this.value.set(this.parts().valid() ? new MyTel(area, exchange, subscriber) : null);
    });

    effect(() => {
      const value = this.value() || new MyTel('', '', '');
      untracked(() => {
        const current = this.partsModel();
        if (
          current.area !== value.area ||
          current.exchange !== value.exchange ||
          current.subscriber !== value.subscriber
        ) {
          this.partsModel.set({
            area: value.area,
            exchange: value.exchange,
            subscriber: value.subscriber,
          });
        }
      });
    });
  }
}
```

## Providing our component as a MatFormFieldControl

The first step is to provide our new component as an implementation of the `MatFormFieldControl`
interface that the `<mat-form-field>` knows how to work with. To do this, we will have our class
implement `MatFormFieldControl`. Since this is a generic interface, we'll need to include a type
parameter indicating the type of data our control will work with, in this case `MyTel`. We then add
a provider to our component so that the form field will be able to inject it as a
`MatFormFieldControl`.

```ts
@Component({
  ...
  providers: [{provide: MatFormFieldControl, useExisting: MyTelInput}],
})
export class MyTelInput implements FormValueControl<MyTel | null>, MatFormFieldControl<MyTel> {
  ...
}
```

This sets up our component, so it can work with `<mat-form-field>`, but now we need to implement the
various methods and properties declared by the interface we just implemented. To learn more about
the `MatFormFieldControl` interface, see the
[form field API documentation](https://material.angular.dev/components/form-field/api).

### Implementing the methods and properties of MatFormFieldControl

#### `stateChanges`

Because the `<mat-form-field>` uses the `OnPush` change detection strategy, it needs to know
when something happens in the form field control that may require the form field to run change
detection.

Note that `stateChanges` is **optional** and not necessary if your control's properties are
implemented as signals (such as `focused`, `empty`, `required`, `disabled`, and `errorState`).
Since `<mat-form-field>` reads those signals directly, it automatically reacts to their changes.

If your control uses plain, non-signal properties that change over time, you can emit on the
`stateChanges` stream:

```ts
readonly stateChanges = new Subject<void>();

ngOnDestroy() {
  this.stateChanges.complete();
}
```

#### `id`

This property should return the ID of an element in the component's template that we want the
`<mat-form-field>` to associate all of its labels and hints with. In this case, we'll use the host
element and just generate a unique ID for it.

```ts
static nextId = 0;

readonly id = `example-tel-input-${MyTelInput.nextId++}`;
```
```ts
@Component({
  ...
  host: {
    '[id]': 'id',
  },
})
```

#### `placeholder`

If your control accepts a placeholder, you can expose it as a signal input:

```ts
readonly placeholder = input<string>('');
```

#### `ngField`

When your control is built to work with Signal Forms (`@angular/forms/signals`), this property
exposes the bound `Field` to the parent `<mat-form-field>`:

```ts
protected readonly _formFieldControl = inject(FORM_FIELD, {optional: true, self: true});

get ngField(): Field<MyTel> | null {
  return (this._formFieldControl?.field() as Field<MyTel>) ?? null;
}
```

`<mat-form-field>` will use `ngField` to read the signal form field's state (such as `valid`, `dirty`, `touched`, and `pending`)
and automatically synchronize the corresponding CSS classes on the `<mat-form-field>` host.


#### `ngControl`

This property allows the form field control to specify the `@angular/forms` control that is bound
to this component. When your control is built for Signal Forms, you can set this to `null`:

```ts
readonly ngControl = null;
```

If you also want your component to support traditional Reactive or Template-driven forms (`formControl` and `ngModel`), you can implement `ControlValueAccessor` and inject `NgControl`:

```ts
ngControl = inject(NgControl, {optional: true, self: true});
```

It is likely you will want to implement `ControlValueAccessor` so that your component can work with
`formControl` and `ngModel`. If you do implement `ControlValueAccessor` you will need to get a
reference to the `NgControl` associated with your control and make it publicly available.

Note that if your component implements `ControlValueAccessor`, it may already be set up to provide
`NG_VALUE_ACCESSOR` (in the `providers` part of the component's decorator, or possibly in a module
declaration). If so, you may get a *cannot instantiate cyclic dependency* error.

To resolve this, remove the `NG_VALUE_ACCESSOR` provider and instead set the value accessor directly:

```ts
@Component({
  ...,
  providers: [
    ...,
    // Remove this.
    // {
    //   provide: NG_VALUE_ACCESSOR,
    //   useExisting: forwardRef(() => MatFormFieldControl),
    //   multi: true,
    // },
  ],
})
export class MyTelInput implements MatFormFieldControl<MyTel>, ControlValueAccessor {
  ...
  ngControl = inject(NgControl, {optional: true, self: true});
  ...

  constructor() {
    // Replace the provider from above with this.
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
  }
}
```

For additional information about `ControlValueAccessor` see the [API docs](https://angular.dev/api/forms/ControlValueAccessor).

#### `focused`

This property indicates whether the form field control should be considered to be in a
focused state. When it is in a focused state, the form field is displayed with a solid color
underline. For the purposes of our component, we want to consider it focused if any of the part
inputs are focused. We can use the `focusin` and `focusout` events to easily check this.

`focused` can be declared as either a `boolean` or a `Signal<boolean>`. When implemented as a signal,
the form field automatically reacts to focus changes without needing to emit on `stateChanges`:

```ts
readonly focused = signal(false);

onFocusIn() {
  this.focused.set(true);
}

onFocusOut(event: FocusEvent) {
  if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
    this._touched.set(true);
    this.focused.set(false);
  }
}
```

#### `empty`

This property indicates whether the form field control is empty. For our control, we'll consider it
empty if all the parts are empty.

`empty` can be declared as either a `boolean` or a `Signal<boolean>`:

```ts
readonly empty = computed(() => {
  const {area, exchange, subscriber} = this.partsModel();
  return !area && !exchange && !subscriber;
});
```

#### `shouldLabelFloat`

This property is used to indicate whether the label should be in the floating position. We'll
use the same logic as `matInput` and float the placeholder when the input is focused or non-empty.
Since the placeholder will be overlapping our control when it's not floating, we should hide
the `–` characters when it's not floating.

`shouldLabelFloat` can be declared as either a `boolean` or a `Signal<boolean>`:

```ts
readonly shouldLabelFloat = computed(() => {
  const focused = this.focused();
  const empty = this.empty();
  return focused || !empty;
});
```

We can apply a class to the host element when the label should float:

```ts
@Component({
  ...
  host: {
    '[class.example-floating]': 'shouldLabelFloat()',
  },
})
```
```css
.example-tel-input-spacer {
  opacity: 0;
  transition: opacity 200ms;
}
:host.example-floating .example-tel-input-spacer {
  opacity: 1;
}
```

#### `required`

This property is used to indicate whether the input is required. `<mat-form-field>` uses this
information to add a required indicator to the placeholder.

`required` can be declared as either a `boolean` or a `Signal<boolean>`:

```ts
readonly required = input<boolean, unknown>(false, {
  transform: booleanAttribute,
});
```

#### `disabled`

This property tells the form field when it should be in the disabled state.

`disabled` can be declared as either a `boolean` or a `Signal<boolean>`:

```ts
readonly disabled = input<boolean, unknown>(false, {
  transform: booleanAttribute,
});
```

#### `errorState`

This property indicates whether the associated `ngField` or `NgControl` is in an error
state. For example, we can show an error if our component has been touched and its internal form is invalid.

`errorState` can be declared as either a `boolean` or a `Signal<boolean>`. When implemented as a
signal, `<mat-form-field>` automatically tracks its value without requiring manual change detection:

```ts
private readonly _touched = signal(false);

readonly errorState = computed(() => {
  const partsValid = this.parts().valid();
  const touched = this._touched();
  return !partsValid && touched;
});
```

For non-signal components, you can alternatively maintain a boolean `errorState` property and
re-evaluate it during `ngDoCheck()`:

```ts
/** Whether the component is in an error state. */
errorState: boolean = false;
...
// These are only relevant for non-signal forms.
private _parentForm = inject(NgForm, {optional: true});
private _parentFormGroup = inject(FormGroupDirective, {optional: true});
...

ngDoCheck() {
  if (this.ngControl) {
    this.updateErrorState();
  }
}

private updateErrorState() {
  const parentSubmitted = this._parentFormGroup?.submitted || this._parentForm?.submitted;
  const touchedOrParentSubmitted = this.touched || parentSubmitted;

  const newState = (this.ngControl?.invalid || this.parts.invalid) && touchedOrParentSubmitted;

  if (this.errorState !== newState) {
    this.errorState = newState;
    this.stateChanges?.next();
  }
}
```

Keep in mind that `updateErrorState()` must have minimal logic to avoid performance issues.

#### `controlType`

This property allows us to specify a unique string for the type of control in form field. The
`<mat-form-field>` will add a class based on this type that can be used to easily apply
special styles to a `<mat-form-field>` that contains a specific type of control. In this example
we'll use `example-tel-input` as our control type which will result in the form field adding the
class `mat-form-field-type-example-tel-input`.

```ts
controlType = 'example-tel-input';
```

#### `autofilled`

This optional property indicates whether the control is currently autofilled by the browser.
Like the other properties, `autofilled` can be declared as either a `boolean` or a `Signal<boolean>`:

```ts
readonly autofilled = signal(false);
```

#### `setDescribedByIds(ids: string[])`

This method is used by the `<mat-form-field>` to set element ids that should be used for the
`aria-describedby` attribute of your control. The ids are controlled through the form field
as hints or errors are conditionally displayed and should be reflected in the control's
`aria-describedby` attribute for an improved accessibility experience.

The `setDescribedByIds` method is invoked whenever the control's state changes. Custom controls
need to implement this method and update the `aria-describedby` attribute based on the specified
element ids. Below is an example that shows how this can be achieved.

Note that the method by default will not respect element ids that have been set manually on the
control element through the `aria-describedby` attribute. To ensure that your control does not
accidentally override existing element ids specified by consumers of your control, create a
`userAriaDescribedBy` property (which can be a `string` or `Signal<string>`):

```ts
readonly userAriaDescribedBy = input<string>('', {alias: 'aria-describedby'});
```

The form field will then pick up the user specified `aria-describedby` ids and merge
them with ids for hints or errors whenever `setDescribedByIds` is invoked.

```ts
setDescribedByIds(ids: string[]) {
  const controlElement = this._elementRef.nativeElement
    .querySelector('.example-tel-input-container')!;
  controlElement.setAttribute('aria-describedby', ids.join(' '));
}
```

#### `onContainerClick()`

This method will be called when the form field is clicked on. It allows your component to hook in
and handle that click however it wants. In our case we'll focus the first invalid `<input>`
(or the first input if all parts are empty):

```ts
protected readonly _areaInput = viewChild.required<ElementRef<HTMLInputElement>>('area');
protected readonly _exchangeInput = viewChild.required<ElementRef<HTMLInputElement>>('exchange');
protected readonly _subscriberInput =
  viewChild.required<ElementRef<HTMLInputElement>>('subscriber');

onContainerClick() {
  if (this.parts.subscriber().valid() || this.parts.exchange().valid()) {
    this._subscriberInput().nativeElement.focus();
  } else if (this.parts.area().valid()) {
    this._exchangeInput().nativeElement.focus();
  } else {
    this._areaInput().nativeElement.focus();
  }
}
```

### Improving accessibility

Our custom form field control consists of multiple inputs that describe segments of a phone
number. For accessibility purposes, we put those inputs as part of a `div` element with
`role="group"`. This ensures that screen reader users can tell that all those inputs belong
together.

One significant piece of information is missing for screen reader users though. They won't be able
to tell what this input group represents. To improve this, we should add a label for the group
element using either `aria-label` or `aria-labelledby`.

It's recommended to link the group to the label that is displayed as part of the parent
`<mat-form-field>`. This ensures that explicitly specified labels (using `<mat-label>`) are
actually used for labelling the control.

In our concrete example, we add an attribute binding for `aria-labelledby` and bind it
to the label element id provided by the parent `<mat-form-field>`.

```typescript
export class MyTelInput implements FormValueControl<MyTel | null>, MatFormFieldControl<MyTel> {
  ...
  protected readonly _formField = inject(MAT_FORM_FIELD, {optional: true});
  ...
}
```

```html
@Component({
  selector: 'example-tel-input',
  template: `
    <div role="group"
         class="example-tel-input-container"
         [attr.aria-labelledby]="_formField?.getLabelId()">
```

### Trying it out

Now that we've fully implemented the interface, we're ready to try our component out! All we need to
do is place it inside a `<mat-form-field>` and bind it to a signal form field:

```html
<mat-form-field>
  <example-tel-input [formField]="form.tel"></example-tel-input>
</mat-form-field>
```

We also get all the features that come with `<mat-form-field>` such as floating placeholder,
prefix, suffix, hints, and errors (if we've given the form field an `ngField` or `NgControl`
and correctly report the error state).

```html
<mat-form-field>
  <example-tel-input [formField]="form.tel" placeholder="Phone number"></example-tel-input>
  <mat-icon matSuffix>phone</mat-icon>
  <mat-hint>Include area code</mat-hint>
</mat-form-field>
```
