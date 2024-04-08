/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkComboboxModule} from '@angular/cdk-experimental/combobox';
import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  templateUrl: 'cdk-combobox-demo.html',
  standalone: true,
  imports: [CdkComboboxModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkComboboxDemo {}
