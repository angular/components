#### Custom datepicker component with disabled properties

As with any standard `<input>`, it is possible to disable the datepicker input by adding the `disabled` property. By
default, the `<cdk-datepicker>` will inherit their disabled state from the `<input>`, but this can be overridden by
setting the `disabled` property on the datepicker. This can be useful if you want to disable text input but allow
selection in the datepicker. Writing a custom datepicker component extended from `CdkDatepicker` will illustrate the
`disabled` states in the `CdkDatepicker` more clearly.

##### Completely disabled datepicker
<input [cdkDatepicker]="dp1" placeholder="Completely disabled" disabled>
<cdk-datepicker #dp1></cdk-datepicker>

##### Disabled input datepicker
<input [cdkDatepicker]="dp3" placeholder="Input disabled" disabled>
<cdk-datepicker #dp3 disabled="false"></cdk-datepicker>

#### Input and change events

The input's native `(input)` and `(change)` events will only trigger due to user interaction with the input element.
Therefore, the datepicker input also has support for `(dateInput)` and `(dateChange)` events. These trigger when the
user interacts with the input.

The `(dateInput)` event will fire whenever the value changes due to the user typing a date. The `(dateChange)` event
will fire whenever the user finishes typing input (on `<input>` blur).

<input [cdkDatepicker]="picker" placeholder="Input & change events"
    (dateInput)="addEvent('input', $event)" (dateChange)="addEvent('change', $event)">
<cdk-datepicker #picker></cdk-datepicker>
