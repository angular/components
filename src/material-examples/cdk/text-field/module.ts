import {TextFieldModule} from '@angular/cdk/text-field';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {
  TextFieldAutosizeTextareaBasicExample
} from './text-field-autosize-basic/text-field-autosize-basic-example';
import {
  TextFieldAutofillMonitorExample
} from './text-field-autofill-monitor/text-field-autofill-monitor-example';
import {
  TextFieldAutosizeTextareaExample
} from './text-field-autosize-textarea/text-field-autosize-textarea-example';
import {
  TextFieldAutofillDirectiveExample
} from './text-field-autofill-directive/text-field-autofill-directive-example';
export {
  TextFieldAutofillDirectiveExample,
  TextFieldAutofillMonitorExample,
  TextFieldAutosizeTextareaExample,
};

const EXAMPLES = [
  TextFieldAutosizeTextareaBasicExample,
  TextFieldAutofillDirectiveExample,
  TextFieldAutofillMonitorExample,
  TextFieldAutosizeTextareaExample,
];

@NgModule({
  imports: [
    CommonModule,
    TextFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CdkTextFieldExamplesModule {
}
