/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkComboboxInput, CdkComboboxPopup} from '@angular/cdk-experimental/combobox';
import {CdkListbox, CdkOption} from '@angular/cdk-experimental/listbox';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  templateUrl: 'cdk-combobox-demo.html',
  styleUrl: 'cdk-combobox-demo.css',
  imports: [CdkComboboxInput, CdkComboboxPopup, CdkListbox, CdkOption],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkComboboxDemo {
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
