/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  ElementRef,
  InjectionToken,
  Input,
  HostAttributeToken,
  inject,
} from '@angular/core';

let nextUniqueId = 0;

/**
 * Injection token that can be used to reference instances of `MatError`. It serves as
 * alternative token to the actual `MatError` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_ERROR = new InjectionToken<MatError>('MatError');

/** Single error message to be shown underneath the form-field. */
@Directive({
  selector: 'mat-error, [matError]',
  host: {
    'class': 'mat-mdc-form-field-error mat-mdc-form-field-bottom-align',
    'aria-atomic': 'true',
    '[id]': 'id',
  },
  providers: [{provide: MAT_ERROR, useExisting: MatError}],
})
export class MatError {
  @Input() id: string = `mat-mdc-error-${nextUniqueId++}`;

  constructor(...args: unknown[]);

  constructor() {
    const ariaLive = inject(new HostAttributeToken('aria-live'), {optional: true});

    // If no aria-live value is set add 'polite' as a default. This is preferred over setting
    // role='alert' so that screen readers do not interrupt the current task to read this aloud.
    if (!ariaLive) {
      const elementRef = inject(ElementRef);
      elementRef.nativeElement.setAttribute('aria-live', 'polite');
    }
  }
}
