import {Component} from '@angular/core';
import {Dir} from '@angular/cdk/bidi';
import {FormsModule} from '@angular/forms';
import {RadioGroup, RadioButton} from '@angular/aria/radio-group';

/** @title RTL horizontal radio group. */
@Component({
  selector: 'radio-group-rtl-horizontal-example',
  templateUrl: 'radio-group-rtl-horizontal-example.html',
  styleUrl: '../radio-common.css',
  imports: [RadioGroup, RadioButton, Dir, FormsModule],
})
export class RadioGroupRtlHorizontalExample {
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
