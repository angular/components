/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {CdkCombobox} from './combobox';
import {CdkComboboxPopup} from './combobox-popup';

const EXPORTED_DECLARATIONS = [CdkCombobox, CdkComboboxPopup];
@NgModule({
  imports: [OverlayModule, ...EXPORTED_DECLARATIONS],
  exports: EXPORTED_DECLARATIONS,
})
export class CdkComboboxModule {}
