import {Component} from '@angular/core';
import {Listbox, Option} from '@angular/aria/listbox';
import {MatPseudoCheckbox} from '@angular/material/core';

/**
 * @title Listbox with multi-selection and selection following focus.
 */
@Component({
  selector: 'listbox-multi-select-follow-focus-example',
  exportAs: 'ListboxMultiSelectFollowFocusExample',
  templateUrl: 'listbox-multi-select-follow-focus-example.html',
  styleUrl: '../listbox-configurable/listbox-configurable-example.css',
  standalone: true,
  imports: [Listbox, Option, MatPseudoCheckbox],
})
export class ListboxMultiSelectFollowFocusExample {
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
