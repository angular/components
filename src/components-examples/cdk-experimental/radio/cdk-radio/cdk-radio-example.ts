import {Component} from '@angular/core';
import {CdkRadioGroup, CdkRadioButton} from '@angular/cdk-experimental/radio';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';

/** @title Basic CDK Radio Group */
@Component({
  selector: 'cdk-radio-example',
  exportAs: 'cdkRadioExample',
  templateUrl: 'cdk-radio-example.html',
  styleUrl: 'cdk-radio-example.css',
  standalone: true,
  imports: [
    CdkRadioGroup,
    CdkRadioButton,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class CdkRadioExample {
  orientation: 'vertical' | 'horizontal' = 'vertical';
  disabled = new FormControl(false, {nonNullable: true});

  flavors = ['Vanilla', 'Chocolate', 'Strawberry', 'Mint Chip', 'Cookies & Cream', 'Rocky Road'];

  // New controls
  readonly = new FormControl(false, {nonNullable: true});
  skipDisabled = new FormControl(true, {nonNullable: true});
  focusMode: 'roving' | 'activedescendant' = 'roving';
  selectedValue: string | null = 'Vanilla'; // To control/reflect the radio group's value

  // Control for which radio options are individually disabled
  disabledOptions: string[] = ['Chocolate'];
}
