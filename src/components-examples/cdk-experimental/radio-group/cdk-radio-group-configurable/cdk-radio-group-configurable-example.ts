import {Component} from '@angular/core';
import {CdkRadioGroup, CdkRadioButton} from '@angular/cdk-experimental/radio-group';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';

/** @title Configurable CDK Radio Group */
@Component({
  selector: 'cdk-radio-group-configurable-example',
  exportAs: 'cdkRadioConfigurableExample',
  templateUrl: 'cdk-radio-group-configurable-example.html',
  styleUrl: '../radio-common.css',
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
export class CdkRadioGroupConfigurableExample {
  orientation: 'vertical' | 'horizontal' = 'vertical';
  disabled = new FormControl(false, {nonNullable: true});

  fruits = [
    'Apple',
    'Apricot',
    'Banana',
    'Blackberry',
    'Blueberry',
    'Cantaloupe',
    'Cherry',
    'Clementine',
    'Cranberry',
    'Dates',
    'Figs',
    'Grapes',
    'Grapefruit',
    'Guava',
    'Kiwi',
    'Kumquat',
    'Lemon',
    'Lime',
    'Mandarin',
    'Mango',
    'Nectarine',
    'Orange',
    'Papaya',
    'Passion',
    'Peach',
    'Pear',
    'Pineapple',
    'Plum',
    'Pomegranate',
    'Raspberries',
    'Strawberry',
    'Tangerine',
    'Watermelon',
  ];

  // New controls
  readonly = new FormControl(false, {nonNullable: true});
  skipDisabled = new FormControl(true, {nonNullable: true});
  focusMode: 'roving' | 'activedescendant' = 'roving';

  // Control for which radio options are individually disabled
  disabledOptions: string[] = ['Banana'];
}
