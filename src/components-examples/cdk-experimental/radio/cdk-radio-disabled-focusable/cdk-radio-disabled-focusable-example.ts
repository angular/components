import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CdkRadioGroup, CdkRadioButton} from '@angular/cdk-experimental/radio';

/** @title Radio group with disabled options that are focusable. */
@Component({
  selector: 'cdk-radio-disabled-focusable-example',
  exportAs: 'cdkRadioDisabledFocusableExample',
  templateUrl: 'cdk-radio-disabled-focusable-example.html',
  styleUrl: '../radio-common.css',
  standalone: true,
  imports: [CdkRadioGroup, CdkRadioButton, FormsModule],
})
export class CdkRadioDisabledFocusableExample {
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
