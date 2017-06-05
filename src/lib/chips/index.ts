/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MdChipList} from './chip-list';
import {MdChip} from './chip';
import {MdChipInput} from './chip-input';
import {MdChipRemove} from './chip-remove';

export * from './chip-list';
export * from './chip';
export * from './chip-input';
export * from './chip-remove';

@NgModule({
  imports: [],
  exports: [MdChipList, MdChip, MdChipInput, MdChipRemove, MdChipRemove],
  declarations: [MdChipList, MdChip, MdChipInput, MdChipRemove,  MdChipRemove]
})
export class MdChipsModule {}
