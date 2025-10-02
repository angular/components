import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RadioGroup, RadioButton} from '@angular/aria/radio-group';

/** @title Readonly radio group. */
@Component({
  selector: 'radio-group-readonly-example',
  exportAs: 'RadioReadonlyExample',
  templateUrl: 'radio-group-readonly-example.html',
  styleUrl: '../radio-common.css',
  standalone: true,
  imports: [RadioGroup, RadioButton, FormsModule],
})
export class RadioGroupReadonlyExample {
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
