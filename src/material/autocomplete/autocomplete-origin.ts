/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, inject} from '@angular/core';

/**
 * Directive applied to an element to make it usable
 * as a connection point for an autocomplete panel.
 */
@Directive({
  selector: '[matAutocompleteOrigin]',
  exportAs: 'matAutocompleteOrigin',
})
export class MatAutocompleteOrigin {
  elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor(...args: unknown[]);
  constructor() {}
}
