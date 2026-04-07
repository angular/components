/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatOptionModule} from '../core';
import {BidiModule} from '@angular/cdk/bidi';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatAutocomplete} from './autocomplete';
import {MatAutocompleteSelectedTrigger} from './autocomplete-selected-trigger';
import {MatAutocompleteTrigger} from './autocomplete-trigger';
import {MatAutocompleteOrigin} from './autocomplete-origin';

@NgModule({
  imports: [
    OverlayModule,
    MatOptionModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatAutocompleteOrigin,
    MatAutocompleteSelectedTrigger,
  ],
  exports: [
    CdkScrollableModule,
    MatAutocomplete,
    MatOptionModule,
    BidiModule,
    MatAutocompleteTrigger,
    MatAutocompleteOrigin,
    MatAutocompleteSelectedTrigger,
  ],
})
export class MatAutocompleteModule {}
