# MdStepper
`MdStepper` is a component to display different steps.

### Screenshots
![image](https://gyazo.com/4676abfe372d01c76e64f4ac074adb41)

## `<md-stepper>`
### Bound Properties

| Name | Type | Description | Default |
| --- | --- | --- | --- |
| `mode` | `"linear" | "nonlinear"` | Changes the behaviour of the `stepper` | 'linear' |

### Examples
A linear stepper would have the following markup:
```html
<md-stepper mode="linear">
    <md-step label="Step one">
      Content
    </md-step>
</md-stepper>
```

A non-linear stepper would have this markup:
```html
<md-stepper mode="nonlinear">
    <md-step label="Step one">
      Content
    </md-step>
</md-stepper>
```

## `<md-step>`
### Bound Properties

| Name | Type | Description | Default |
| --- | --- | --- | --- |
| `label` | `string` | Sets the `step` title | '' |
| `editable` | `boolean` | Toggles editability after `step` is completed | true |
| `valid` | `boolean` | Sets validity of the `step` | true |
| `optional` | `boolean` | Makes the `step` optional | false |

### Examples

A not-editable step would have following markup:
```html
  <md-step label="Step one" editable="false">
    Content
  </md-step>
```

You can toggle the validity of the step by using:
```html
  <md-step label="Step one" [valid]="myVariable">
    Content
  </md-step>
```

## Theming
The `md-stepper` is using the `primary` palette for its styling.
