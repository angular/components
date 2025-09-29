import {Component} from '@angular/core';
import {Listbox, Option} from '@angular/aria/listbox';
import {MatPseudoCheckbox} from '@angular/material/core';

/**
 * @title Listbox with readonly state.
 */
@Component({
  selector: 'listbox-readonly-example',
  exportAs: 'ListboxReadonlyExample',
  templateUrl: 'listbox-readonly-example.html',
  styleUrl: '../listbox-configurable/listbox-configurable-example.css',
  standalone: true,
  imports: [Listbox, Option, MatPseudoCheckbox],
})
export class ListboxReadonlyExample {
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
