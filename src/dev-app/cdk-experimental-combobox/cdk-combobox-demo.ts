/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkComboboxModule} from '@angular/cdk-experimental/combobox';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  templateUrl: 'cdk-combobox-demo.html',
  standalone: true,
  imports: [CdkComboboxModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkComboboxDemo {}
