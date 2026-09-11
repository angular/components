# Wrapping existing form field controls

Angular Material controls such as `matInput` and `mat-select` can be wrapped in reusable
components. The right pattern depends on whether the wrapper owns the `<mat-form-field>` or is
itself intended to be the control inside a `<mat-form-field>` supplied by the caller.

## Wrapper owns the form field

This is the simplest option when a reusable component should contain its label, Material control,
errors, hints, and other shared behavior. Make the wrapper a `ControlValueAccessor` so that callers
can use it with `formControl`, `formControlName`, or `ngModel` just like any other Angular form
control.

For example, a reusable language select can wrap both `<mat-form-field>` and `<mat-select>`:

```ts
@Component({
  selector: 'example-language-select',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LanguageSelect),
      multi: true,
    },
  ],
  template: `
    <mat-form-field>
      <mat-label>Language</mat-label>
      <mat-select
        [disabled]="disabled"
        [value]="value"
        (selectionChange)="setValue($event.value)"
        (blur)="onTouched()">
        @for (language of languages; track language.code) {
          <mat-option [value]="language.code">{{language.name}}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSelect implements ControlValueAccessor {
  readonly languages = [
    {code: 'en', name: 'English'},
    {code: 'fr', name: 'French'},
  ];

  value: string | null = null;
  disabled = false;

  private onChange = (value: string | null) => {};
  protected onTouched = () => {};

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  writeValue(value: string | null): void {
    this.value = value;
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    this.changeDetectorRef.markForCheck();
  }

  protected setValue(value: string): void {
    this.value = value;
    this.onChange(value);
  }
}
```

The wrapper can then be used directly in a reactive form:

```html
<form [formGroup]="form">
  <example-language-select formControlName="language" />
</form>
```

The same pattern works for `matInput`. The wrapper forwards input and blur events to the callbacks
registered by Angular forms:

```html
<mat-form-field>
  <mat-label>Display name</mat-label>
  <input
    matInput
    [disabled]="disabled"
    [value]="value"
    (input)="onInput($event)"
    (blur)="onTouched()">
</mat-form-field>
```

```ts
protected onInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  this.value = value;
  this.onChange(value);
}
```

When a wrapper uses `ChangeDetectionStrategy.OnPush`, call `markForCheck()` from `writeValue` and
`setDisabledState` because those methods can be invoked by the forms API outside of an input event
handled by the wrapper.

`ControlValueAccessor` propagates the value, touched state, and disabled state. It does not make an
inner Material control share the parent form control's validation state automatically. If the outer
form-field styling and errors need to follow that state, use the caller-owned pattern below and
make the wrapper itself a `MatFormFieldControl`.

## Caller owns the form field

Sometimes the desired API puts the wrapper inside a form field owned by the caller:

```html
<mat-form-field>
  <mat-label>Language</mat-label>
  <example-language-control formControlName="language" />
</mat-form-field>
```

In this case, wrapping a `matInput` or `mat-select` in the component's own template is not enough.
The outer `<mat-form-field>` cannot use a Material control hidden behind another component's view
boundary as its form-field control. The wrapper itself needs to implement `MatFormFieldControl`.

See
[Creating a custom form field control](https://material.angular.dev/guide/creating-a-custom-form-field-control)
for the complete `MatFormFieldControl` contract, including focus, empty state, error state,
accessibility, and `stateChanges`. A component that should also work with Angular forms can
implement both `MatFormFieldControl` and `ControlValueAccessor`.

## Wrapping a group of fields

For reusable groups such as an address editor, choose the API based on ownership:

* Pass a `FormGroup` to the child when the child should edit controls that remain owned by the
  parent form.
* Implement `ControlValueAccessor` when the entire group should behave as one aggregate form
  control value.

Keeping the ownership explicit avoids duplicating control state and makes touched, disabled, and
validation behavior easier to reason about.
