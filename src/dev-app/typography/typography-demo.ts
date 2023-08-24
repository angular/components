/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'typography-demo',
  templateUrl: 'typography-demo.html',
  styleUrls: ['typography-demo.css'],
  imports: [MatCheckboxModule, FormsModule],
  standalone: true,
})
export class TypographyDemo {}
