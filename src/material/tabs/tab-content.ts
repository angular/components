/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, InjectionToken, TemplateRef, inject} from '@angular/core';

/**
 * Injection token that can be used to reference instances of `MatTabContent`. It serves as
 * alternative token to the actual `MatTabContent` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_TAB_CONTENT = new InjectionToken<MatTabContent>('MatTabContent');

/** Decorates the `ng-template` tags and reads out the template from it. */
@Directive({
  selector: '[matTabContent]',
  providers: [{provide: MAT_TAB_CONTENT, useExisting: MatTabContent}],
})
export class MatTabContent {
  template = inject<TemplateRef<any>>(TemplateRef);

  constructor(...args: unknown[]);
  constructor() {}
}
