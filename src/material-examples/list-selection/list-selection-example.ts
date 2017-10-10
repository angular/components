/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

/**
 * @title List with selection
 */
@Component({
  selector: 'list-selection-example',
  styleUrls: ['list-selection-example.css'],
  templateUrl: 'list-selection-example.html',
})
export class ListSelectionExample {
  typesOfShoes = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
}
