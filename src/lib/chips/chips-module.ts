/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatChipList} from './chip-list';
import {MatChip, MatChipRemove, MatChipAvatar, MatChipTrailingIcon} from './chip';
import {MatChipInput} from './chip-input';

const CHIP_DECLARATIONS = [
  MatChipList,
  MatChip,
  MatChipInput,
  MatChipRemove,
  MatChipAvatar,
  MatChipTrailingIcon,
];

@NgModule({
  imports: [],
  exports: CHIP_DECLARATIONS,
  declarations: CHIP_DECLARATIONS,
  providers: [ErrorStateMatcher]
})
export class MatChipsModule {}
