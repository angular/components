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
  orientation: 'vertical' | 'horizontal' = 'vertical';
  disabled = new FormControl(false, {nonNullable: true});
  toolbarDisabled = new FormControl(false, {nonNullable: true});

  fruits = ['Apple', 'Apricot', 'Banana'];
  buttonFruits = ['Pear', 'Blueberry', 'Cherry', 'Date'];

  // New controls
  readonly = new FormControl(false, {nonNullable: true});
  skipDisabled = new FormControl(true, {nonNullable: true});
  focusMode: 'roving' | 'activedescendant' = 'roving';
  wrap = new FormControl(true, {nonNullable: true});

  // Control for which radio options are individually disabled
  disabledOptions: string[] = ['Banana'];
  disabledButtonOptions: string[] = ['Pear'];

  test(x: String) {
    console.log(x);
  }
}
