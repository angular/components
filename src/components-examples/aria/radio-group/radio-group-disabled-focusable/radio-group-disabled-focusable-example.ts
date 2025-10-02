import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RadioGroup, RadioButton} from '@angular/aria/radio-group';

/** @title Radio group with disabled options that are focusable. */
@Component({
  selector: 'radio-group-disabled-focusable-example',
  exportAs: 'RadioDisabledFocusableExample',
  templateUrl: 'radio-group-disabled-focusable-example.html',
  styleUrl: '../radio-common.css',
  standalone: true,
  imports: [RadioGroup, RadioButton, FormsModule],
})
export class RadioGroupDisabledFocusableExample {
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
  disabledFruits = ['Banana', 'Kiwi'];
}
