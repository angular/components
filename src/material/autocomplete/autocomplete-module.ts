/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayModule} from '@angular/cdk/overlay';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule, MatOptionModule} from '@angular/material/core';

import {MatAutocomplete} from './autocomplete';
import {MatAutocompleteOrigin} from './autocomplete-origin';
import {
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER,
  MatAutocompleteTrigger,
} from './autocomplete-trigger';


@NgModule({
  imports: [OverlayModule, MatOptionModule, MatCommonModule, CommonModule],
  exports: [
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatAutocompleteOrigin,
    CdkScrollableModule,
    MatOptionModule,
    MatCommonModule,
  ],
  declarations: [MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteOrigin],
  providers: [MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER],
})
export class MatAutocompleteModule {
}
