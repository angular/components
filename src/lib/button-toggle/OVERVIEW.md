Buttons toggles aregroups of buttons that can be toggled on and off. They can be configured to 
behave as checkboxes or as radio buttons. Button toggles are always part of a 
`md-button-toggle-group`.

<!-- example(button-toggle-overview) -->

### Exclusive selection vs. multiple selection
By default, `md-button-toggle-group` acts like a radio-button group- only one item can be selected.
In this mode, the `value` of the `md-radio-group` will reflect the value of the selected button and
`ngModel` is supported. 

Adding the `multiple` attribute allows multiple items to be selected (checkbox behavior). In this
mode the values of the the toggles are not used, the `md-radio-group` does not have a value, and 
`ngModel` is not supported.

### Accessibility
The button-toggles will present themselves as either checkboxes or radio-buttons based on the 
presence of the `multiple` attribute. 

### Orientation
The button-toggles can be rendered in a vertical orientation by adding the `vertical` attribute.
