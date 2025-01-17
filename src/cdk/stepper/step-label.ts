/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, TemplateRef, inject} from '@angular/core';

@Directive({
  selector: '[cdkStepLabel]',
})
export class CdkStepLabel {
  template = inject<TemplateRef<any>>(TemplateRef);

  constructor(...args: unknown[]);
  constructor() {}
}
