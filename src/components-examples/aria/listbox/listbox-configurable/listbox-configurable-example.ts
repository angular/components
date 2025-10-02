import {Component} from '@angular/core';
import {Listbox, Option} from '@angular/aria/listbox';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatPseudoCheckbox} from '@angular/material/core';

/** @title Configurable Listbox. */
@Component({
  selector: 'listbox-configurable-example',
  exportAs: 'ListboxConfigurableExample',
  templateUrl: 'listbox-configurable-example.html',
  styleUrl: 'listbox-configurable-example.css',
  standalone: true,
  imports: [
    Listbox,
    Option,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatPseudoCheckbox,
  ],
})
export class ListboxConfigurableExample {
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
