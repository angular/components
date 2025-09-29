import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RadioGroup, RadioButton} from '@angular/aria/radio-group';

/** @title Horizontal radio group. */
@Component({
  selector: 'radio-group-horizontal-example',
  exportAs: 'RadioHorizontalExample',
  templateUrl: 'radio-group-horizontal-example.html',
  styleUrl: '../radio-common.css',
  standalone: true,
  imports: [RadioGroup, RadioButton, FormsModule],
})
export class RadioGroupHorizontalExample {
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
