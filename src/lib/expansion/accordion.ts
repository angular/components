/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, SimpleChanges, OnChanges, OnDestroy} from '@angular/core';
import {CdkAccordion} from '@angular/cdk/accordion';
import {Subject} from 'rxjs/Subject';

/** Workaround for https://github.com/angular/angular/issues/17849 */
export const _CdkAccordion = CdkAccordion;

/** MatAccordion's display modes. */
export type MatAccordionDisplayMode = 'default' | 'flat';

/** MdAccordion's display modes. */
export type MatAccordionTogglePosition = 'start' | 'end' | 'hidden';

/** Unique ID counter */
let nextId = 0;

/**
 * Directive for a Material Design Accordion.
 */
@Directive({
  selector: 'mat-accordion',
  inputs: ['multi'],
  exportAs: 'matAccordion',
  host: {
    class: 'mat-accordion'
  }
})
export class MatAccordion extends _CdkAccordion implements OnChanges, OnDestroy {
  /** A readonly id value to use for unique selection coordination. */
  readonly id = `cdk-accordion-${nextId++}`;

  /** Stream that emits for changes in `@Input` properties. */
  _inputChanges = new Subject<SimpleChanges>();

  /** The positioning of the expansion indicator. */
  @Input() togglePosition: MatAccordionTogglePosition = 'end';

  /**
   * The display mode used for all expansion panels in the accordion. Currently two display
   * modes exist:
   *   default - a gutter-like spacing is placed around any expanded panel, placing the expanded
   *     panel at a different elevation from the reset of the accordion.
   *  flat - no spacing is placed around expanded panels, showing all panels at the same
   *     elevation.
   */
  @Input() displayMode: MatAccordionDisplayMode = 'default';

  ngOnChanges(changes: SimpleChanges) {
    this._inputChanges.next(changes);
  }

  ngOnDestroy() {
    this._inputChanges.complete();
  }
}
