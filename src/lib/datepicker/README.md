# MdDatepicker
Datepicker allow the user to select date and time.

## `<md-datepicker>`
### Properties

| Name | Type | Description |
| --- | --- | --- |
| `type` | `'date' | 'time' | 'datetime'` | The type of the datepicker |
| `disabled` | `boolean` | Whether or not the datepicker is disabled |
| `name` | `number` | Datepicker name. |
| `id` | `number` | The unique ID of this datepicker. |
| `min` | `number` | The min date of Datepicker. |
| `max` | `number` | The max date of Datepicker. |
| `placeholder` | `number` | Datepicker placeholder label |
| `format` | `number` | The date format of datepicker |
| `tabindex` | `number` | The tabIndex of the datepicker. |

### Events

| Name | Type | Description |
| --- | --- | --- |
| `change` | `Event` | Fired when change date |

### Examples
A datepicker would have the following markup.
```html
<md2-datepicker [(ngModel)]="date"></md2-datepicker>
```
