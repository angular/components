import {Component} from '@angular/core';
import {Dir} from '@angular/cdk/bidi';
import {FormsModule} from '@angular/forms';
import {CdkRadioGroup, CdkRadioButton} from '@angular/cdk-experimental/radio-group';

/** @title RTL horizontal radio group. */
@Component({
  selector: 'cdk-radio-group-rtl-horizontal-example',
  exportAs: 'cdkRadioRtlHorizontalExample',
  templateUrl: 'cdk-radio-group-rtl-horizontal-example.html',
  styleUrl: '../radio-common.css',
  standalone: true,
  imports: [CdkRadioGroup, CdkRadioButton, Dir, FormsModule],
})
export class CdkRadioGroupRtlHorizontalExample {
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
