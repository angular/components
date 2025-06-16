import {Component} from '@angular/core';
import {CdkListbox, CdkOption} from '@angular/cdk-experimental/listbox';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatPseudoCheckbox} from '@angular/material/core';

/** @title Configurable Listbox. */
@Component({
  selector: 'cdk-listbox-configurable-example',
  exportAs: 'cdkListboxConfigurableExample',
  templateUrl: 'cdk-listbox-configurable-example.html',
  styleUrl: 'cdk-listbox-configurable-example.css',
  standalone: true,
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
export class CdkListboxConfigurableExample {
  orientation: 'vertical' | 'horizontal' = 'vertical';
  focusMode: 'roving' | 'activedescendant' = 'roving';
  selectionMode: 'explicit' | 'follow' = 'explicit';

  selection: string[] = ['Banana', 'Blackberry'];
  disabledOptions: string[] = ['Banana', 'Cantaloupe'];

  wrap = new FormControl(true, {nonNullable: true});
  multi = new FormControl(true, {nonNullable: true});
  disabled = new FormControl(false, {nonNullable: true});
  readonly = new FormControl(false, {nonNullable: true});
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
