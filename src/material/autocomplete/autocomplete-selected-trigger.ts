/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, InjectionToken, TemplateRef, inject} from '@angular/core';

/**
 * Injection token that references the `MatAutocompleteSelectedTrigger`.
 * @docs-private
 */
export const MAT_AUTOCOMPLETE_SELECTED_TRIGGER = new InjectionToken<MatAutocompleteSelectedTrigger>(
  'MatAutocompleteSelectedTrigger',
);

/**
 * Used to provide a custom template for the selected option display in `mat-autocomplete`,
 * similar to `mat-select-trigger` for `mat-select`. Place inside `<mat-autocomplete>`:
 *
 * ```html
 * <mat-autocomplete>
 *   <ng-template matAutocompleteSelectedTrigger let-value>{{ value }}</ng-template>
 * </mat-autocomplete>
 * ```
 *
 * The `$implicit` template context variable is the raw selected value.
 */
@Directive({
  selector: 'ng-template[matAutocompleteSelectedTrigger]',
  providers: [
    {provide: MAT_AUTOCOMPLETE_SELECTED_TRIGGER, useExisting: MatAutocompleteSelectedTrigger},
  ],
})
export class MatAutocompleteSelectedTrigger {
  readonly templateRef = inject(TemplateRef);
}
