import {Component} from '@angular/core';
import {RadioGroup, RadioButton} from '@angular/aria/radio-group';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';

/** @title Configurable CDK Radio Group */
@Component({
  selector: 'radio-group-configurable-example',
  templateUrl: 'radio-group-configurable-example.html',
  styleUrl: '../radio-common.css',
  imports: [
    RadioGroup,
    RadioButton,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class RadioGroupConfigurableExample {
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
  softDisabled = new FormControl(false, {nonNullable: true});
  focusMode: 'roving' | 'activedescendant' = 'roving';

  // Control for which radio options are individually disabled
  disabledOptions: string[] = ['Banana'];
}
