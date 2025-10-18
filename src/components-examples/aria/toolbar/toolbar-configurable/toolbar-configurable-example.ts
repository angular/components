import {Component} from '@angular/core';
import {RadioGroup, RadioButton} from '@angular/aria/radio-group';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Toolbar, ToolbarWidget} from '@angular/aria/toolbar';

/** @title Configurable CDK Radio Group */
@Component({
  selector: 'toolbar-configurable-example',
  templateUrl: 'toolbar-configurable-example.html',
  styleUrl: '../toolbar-common.css',
  imports: [
    RadioGroup,
    RadioButton,
    Toolbar,
    ToolbarWidget,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class ToolbarConfigurableExample {
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
