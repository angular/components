import {Component} from '@angular/core';
import {Dir} from '@angular/cdk/bidi';
import {Listbox, Option} from '@angular/aria/listbox';
import {MatPseudoCheckbox} from '@angular/material/core';

/**
 * @title Listbox with RTL and horizontal orientation.
 */
@Component({
  selector: 'listbox-rtl-horizontal-example',
  templateUrl: 'listbox-rtl-horizontal-example.html',
  styleUrl: '../listbox-configurable/listbox-configurable-example.css',
  imports: [Listbox, Option, Dir, MatPseudoCheckbox],
})
export class ListboxRtlHorizontalExample {
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
