/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  InjectionToken,
  inject,
  output, OutputEmitterRef, input, InputSignal,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';

/**
 * Injection token that can be used to reference instances of `CdkAccordion`. It serves
 * as alternative token to the actual `CdkAccordion` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_ACCORDION = new InjectionToken<CdkAccordion>('CdkAccordion');

/**
 * Directive whose purpose is to manage the expanded state of CdkAccordionItem children.
 */
@Directive({
  selector: 'cdk-accordion, [cdkAccordion]',
  exportAs: 'cdkAccordion',
  providers: [{provide: CDK_ACCORDION, useExisting: CdkAccordion}],
})
export class CdkAccordion {
  /** Output that emits true/false when openAll/closeAll is triggered. */
  readonly openCloseAllActions: OutputEmitterRef<boolean> = output<boolean>()

  /** A readonly id value to use for unique selection coordination. */
  readonly id: string = inject(_IdGenerator).getId('cdk-accordion-');

  /** Whether the accordion should allow multiple expanded accordion items simultaneously. */
  readonly multi: InputSignal<boolean> = input<boolean>(false, { alias: 'multi' });

  /** Opens all enabled accordion items in an accordion where multi is enabled. */
  openAll(): void {
    if (this.multi()) {
      this.openCloseAllActions.emit(true);
    }
  }

  /** Closes all enabled accordion items. */
  closeAll(): void {
    this.openCloseAllActions.emit(false);
  }
}
