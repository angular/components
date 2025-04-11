/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, TemplateRef, inject} from '@angular/core';

/**
 * Content for a `mat-step` that will be rendered lazily.
 */
@Directive({
  selector: 'ng-template[matStepContent]',
})
export class MatStepContent {
  _template = inject<TemplateRef<unknown>>(TemplateRef);

  constructor(...args: unknown[]);
  constructor() {}
}
