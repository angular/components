import {Component} from '@angular/core';
import {CdkRadioGroup, CdkRadioButton} from '@angular/cdk-experimental/radio-group';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CdkToolbar, CdkToolbarWidget} from '@angular/cdk-experimental/toolbar';

/** @title Configurable CDK Radio Group */
@Component({
  selector: 'cdk-toolbar-configurable-example',
  exportAs: 'cdkToolbarConfigurableExample',
  templateUrl: 'cdk-toolbar-configurable-example.html',
  styleUrl: '../toolbar-common.css',
  standalone: true,
  imports: [
    CdkRadioGroup,
    CdkRadioButton,
    CdkToolbar,
    CdkToolbarWidget,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class CdkToolbarConfigurableExample {
  skipDisabled = new FormControl(false, {nonNullable: true});
  wrap = new FormControl(true, {nonNullable: true});
  toolbarDisabled = new FormControl(false, {nonNullable: true});
  orientation: 'vertical' | 'horizontal' = 'horizontal';

  fruits = ['Apple', 'Apricot', 'Banana'];
  buttonFruits = ['Pear', 'Blueberry', 'Cherry', 'Date'];

  // Radio group controls
  disabled = new FormControl(false, {nonNullable: true});
  readonly = new FormControl(false, {nonNullable: true});

  // Control for which radio options are individually disabled
  disabledOptions: string[] = ['Banana'];
  disabledButtonOptions: string[] = ['Pear'];

  test(x: String) {
    console.log(x);
  }
}
