import {Component} from '@angular/core';
import {CdkListbox, CdkOption} from '@angular/cdk-experimental/listbox';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatPseudoCheckbox} from '@angular/material/core';

/** @title Listbox using UI Patterns. */
@Component({
  selector: 'cdk-listbox-example',
  exportAs: 'cdkListboxExample',
  templateUrl: 'cdk-listbox-example.html',
  styleUrl: 'cdk-listbox-example.css',
  imports: [
    CdkListbox,
    CdkOption,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatPseudoCheckbox,
  ],
})
export class CdkListboxExample {
  orientation: 'vertical' | 'horizontal' = 'vertical';
  focusMode: 'roving' | 'activedescendant' = 'roving';
  selectionMode: 'explicit' | 'follow' = 'explicit';

  wrap = new FormControl(true, {nonNullable: true});
  multi = new FormControl(false, {nonNullable: true});
  disabled = new FormControl(false, {nonNullable: true});
  skipDisabled = new FormControl(true, {nonNullable: true});

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
}
