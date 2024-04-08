/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'typography-demo',
  templateUrl: 'typography-demo.html',
  styleUrl: 'typography-demo.css',
  imports: [MatCheckboxModule, FormsModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypographyDemo {}
