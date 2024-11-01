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
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  booleanAttribute,
  inject,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {Subject} from 'rxjs';

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
export class CdkAccordion implements OnDestroy, OnChanges {
  /** Emits when the state of the accordion changes */
  readonly _stateChanges = new Subject<SimpleChanges>();

  /** Stream that emits true/false when openAll/closeAll is triggered. */
  readonly _openCloseAllActions: Subject<boolean> = new Subject<boolean>();

  /** A readonly id value to use for unique selection coordination. */
  readonly id: string = inject(_IdGenerator).getId('cdk-accordion-');

  /** Whether the accordion should allow multiple expanded accordion items simultaneously. */
  @Input({transform: booleanAttribute}) multi: boolean = false;

  /** Opens all enabled accordion items in an accordion where multi is enabled. */
  openAll(): void {
    if (this.multi) {
      this._openCloseAllActions.next(true);
    }
  }

  /** Closes all enabled accordion items. */
  closeAll(): void {
    this._openCloseAllActions.next(false);
  }

  ngOnChanges(changes: SimpleChanges) {
    this._stateChanges.next(changes);
  }

  ngOnDestroy() {
    this._stateChanges.complete();
    this._openCloseAllActions.complete();
  }
}
