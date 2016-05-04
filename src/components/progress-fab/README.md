# MdProgressFab
`MdProgressFab` is a normal FAB button surrounded with a `progress-circle`.

### Screenshots
![Preview](https://cloud.githubusercontent.com/assets/4987015/14406410/eaf20a54-fea6-11e5-8a24-4f751df7e80a.png)

## `[md-progress-fab]`
### Bound Properties

| Name | Type | Description |
| --- | --- | --- |
| `color` | `"primary" | "accent" | "warn"` | The color palette for the FAB button |
| `value` | `number` | Value for the `progress-circle`.<br/> Necessary when using the `determinate` mode. |
| `mode` | `"determinate" | "indeterminate"` | Mode for the `progress-circle`.<br/> |
| `progressColor` | `"primary" | "accent" | "warn"` | Color for the `progress-circle`.<br/> |


### Examples
A basic progress-fab will have the markup:
```html
<button md-progress-fab color="accent">
  <i class="material-icons md-24">favorite</i>
  </button>
```
It will use by default a `indeterminate` progress circle.
