import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CdkRadioGroup, CdkRadioButton} from '@angular/cdk-experimental/radio-group';

/** @title Active descendant radio group. */
@Component({
  selector: 'cdk-radio-group-active-descendant-example',
  exportAs: 'cdkRadioActiveDescendantExample',
  templateUrl: 'cdk-radio-group-active-descendant-example.html',
  standalone: true,
  styleUrl: '../radio-common.css',
  imports: [CdkRadioGroup, CdkRadioButton, FormsModule],
})
export class CdkRadioGroupActiveDescendantExample {
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
