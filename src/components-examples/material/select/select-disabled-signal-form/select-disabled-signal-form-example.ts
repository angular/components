import {Component, signal} from '@angular/core';
import {disabled, form, FormField} from '@angular/forms/signals';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';

/** @title Disabled select (signal forms) */
@Component({
  selector: 'select-disabled-signal-form-example',
  templateUrl: 'select-disabled-signal-form-example.html',
  imports: [MatCheckboxModule, FormField, MatFormFieldModule, MatSelectModule, MatInputModule],
})
export class SelectDisabledSignalFormExample {
  // TODO - more distinct name?
  protected form = form(signal({option: '', vehicle: '', disableField: false}), p => {
    disabled(p.option, {when: ({valueOf}) => valueOf(p.disableField)});
    disabled(p.vehicle, {when: ({valueOf}) => valueOf(p.disableField)});
  });
}
