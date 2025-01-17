/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule, MatOptionModule} from '@angular/material/core';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatAutocomplete} from './autocomplete';
import {
  MatAutocompleteTrigger,
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER,
} from './autocomplete-trigger';
import {MatAutocompleteOrigin} from './autocomplete-origin';

@NgModule({
  imports: [
    OverlayModule,
    MatOptionModule,
    MatCommonModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatAutocompleteOrigin,
  ],
  exports: [
    CdkScrollableModule,
    MatAutocomplete,
    MatOptionModule,
    MatCommonModule,
    MatAutocompleteTrigger,
    MatAutocompleteOrigin,
  ],
  providers: [MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER],
})
export class MatAutocompleteModule {}
