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
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
  afterNextRender,
  OnDestroy,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {AccordionGroupPattern} from '../private';
import {SortedCollection} from '../private/utils/collection';
import {ACCORDION_GROUP} from './accordion-tokens';
import {AccordionTrigger} from './accordion-trigger';

/**
 * A container for a group of accordion items. It manages the overall state and
 * interactions of the accordion, such as keyboard navigation and expansion mode.
 *
 * The `ngAccordionGroup` serves as the root of a group of accordion triggers and panels,
 * coordinating the behavior of the `ngAccordionTrigger` and `ngAccordionPanel` elements within it.
 * It supports both single and multiple expansion modes.
 *
 * ```html
 * <div ngAccordionGroup [multiExpandable]="true">
 *   <div class="accordion-item">
 *     <h3>
 *       <button ngAccordionTrigger [panel]="panel1">Item 1</button>
 *     </h3>
 *     <div ngAccordionPanel #panel1="ngAccordionPanel">
 *       <ng-template ngAccordionContent>
 *         <p>Content for Item 1.</p>
 *       </ng-template>
 *     </div>
 *   </div>
 *   <div class="accordion-item">
 *     <h3>
 *       <button ngAccordionTrigger [panel]="panel2">Item 2</button>
 *     </h3>
 *     <div ngAccordionPanel #panel2="ngAccordionPanel">
 *       <ng-template ngAccordionContent>
 *         <p>Content for Item 2.</p>
 *       </ng-template>
 *     </div>
 *   </div>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 * @see [Accordion](guide/aria/accordion)
 */
@Directive({
  selector: '[ngAccordionGroup]',
  exportAs: 'ngAccordionGroup',
  host: {
    '(keydown)': '_pattern.onKeydown($event)',
    '(click)': '_pattern.onClick($event)',
    '(focusin)': '_pattern.onFocus($event)',
  },
  providers: [{provide: ACCORDION_GROUP, useExisting: AccordionGroup}],
})
export class AccordionGroup implements OnDestroy {
  /** A reference to the group element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the group element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The collection of AccordionTriggers. */
  readonly _collection = new SortedCollection<AccordionTrigger>();

  /** The corresponding patterns for the accordion triggers. */
  private readonly _triggerPatterns = computed(() => {
    return this._collection.orderedItems().map(t => t._pattern);
  });

  /** The text direction (ltr or rtl). */
  readonly textDirection = inject(Directionality).valueSignal;

  /** Whether the entire accordion group is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether multiple accordion items can be expanded simultaneously. */
  readonly multiExpandable = input(true, {transform: booleanAttribute});

  /**
   * Whether to allow disabled items to receive focus. When `true`, disabled items are
   * focusable but not interactive. When `false`, disabled items are skipped during navigation.
   */
  readonly softDisabled = input(true, {transform: booleanAttribute});

  /** Whether keyboard navigation should wrap around from the last item to the first, and vice-versa. */
  readonly wrap = input(false, {transform: booleanAttribute});

  /** The UI pattern instance for this accordion group. */
  readonly _pattern: AccordionGroupPattern = new AccordionGroupPattern({
    ...this,
    element: () => this.element,
    activeItem: signal(undefined),
    items: this._triggerPatterns,
    orientation: () => 'vertical',
  });

  constructor() {
    afterNextRender(() => {
      this._collection.startObserving(this.element);
    });
  }

  ngOnDestroy() {
    this._collection.stopObserving();
  }

  /** Expands all accordion panels if multi-expandable. */
  expandAll() {
    this._pattern.expandAll();
  }

  /** Collapses all accordion panels. */
  collapseAll() {
    this._pattern.collapseAll();
  }
}
