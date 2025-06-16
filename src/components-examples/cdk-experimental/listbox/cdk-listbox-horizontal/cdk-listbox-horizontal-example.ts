import {Component} from '@angular/core';
import {CdkListbox, CdkOption} from '@angular/cdk-experimental/listbox';
import {MatPseudoCheckbox} from '@angular/material/core';

/**
 * @title Listbox with horizontal orientation.
 */
@Component({
  selector: 'cdk-listbox-horizontal-example',
  exportAs: 'cdkListboxHorizontalExample',
  templateUrl: 'cdk-listbox-horizontal-example.html',
  styleUrl: '../cdk-listbox-configurable/cdk-listbox-configurable-example.css',
  standalone: true,
  imports: [CdkListbox, CdkOption, MatPseudoCheckbox],
})
export class CdkListboxHorizontalExample {
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
