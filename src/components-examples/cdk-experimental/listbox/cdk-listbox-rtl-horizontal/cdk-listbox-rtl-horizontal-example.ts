import {Component} from '@angular/core';
import {Dir} from '@angular/cdk/bidi';
import {CdkListbox, CdkOption} from '@angular/cdk-experimental/listbox';
import {MatPseudoCheckbox} from '@angular/material/core';

/**
 * @title Listbox with RTL and horizontal orientation.
 */
@Component({
  selector: 'cdk-listbox-rtl-horizontal-example',
  exportAs: 'cdkListboxRtlHorizontalExample',
  templateUrl: 'cdk-listbox-rtl-horizontal-example.html',
  styleUrl: '../cdk-listbox-configurable/cdk-listbox-configurable-example.css',
  standalone: true,
  imports: [CdkListbox, CdkOption, Dir, MatPseudoCheckbox],
})
export class CdkListboxRtlHorizontalExample {
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
