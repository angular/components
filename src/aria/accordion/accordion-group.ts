/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  input,
  ElementRef,
  inject,
  contentChildren,
  signal,
  booleanAttribute,
  computed,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {AccordionGroupPattern, AccordionTriggerPattern} from '../private';
import {AccordionTrigger} from './accordion-trigger';
import {ACCORDION_GROUP} from './accordion-tokens';

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
 *       <button ngAccordionTrigger panel="panel1">Item 1</button>
 *     </h3>
 *     <div ngAccordionPanel #panel1="ngAccordionTrigger">
 *       <ng-template ngAccordionContent>
 *         <p>Content for Item 1.</p>
 *       </ng-template>
 *     </div>
 *   </div>
 *   <div class="accordion-item">
 *     <h3>
 *       <button ngAccordionTrigger panel="panel2">Item 2</button>
 *     </h3>
 *     <div ngAccordionPanel #panel2="ngAccordionTrigger">
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
    '(pointerdown)': '_pattern.onPointerdown($event)',
    '(focusin)': '_pattern.onFocus($event)',
  },
  providers: [{provide: ACCORDION_GROUP, useExisting: AccordionGroup}],
})
export class AccordionGroup {
  /** A reference to the group element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the group element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The AccordionTriggers nested inside this group. */
  private readonly _triggers = contentChildren(AccordionTrigger, {descendants: true});

  /** The AccordionTrigger patterns nested inside this group. */
  private readonly _triggerPatterns = computed(() =>
    this._triggers()
      .map(t => t._pattern)
      .filter(p => !!p),
  );

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
    activeItem: signal(undefined),
    items: this._triggerPatterns,
    // TODO(ok7sai): Investigate whether an accordion should support horizontal mode.
    orientation: () => 'vertical',
    getItem: element => this._findTriggerPattern(element),
    element: () => this.element,
  });

  /** Expands all accordion panels if multi-expandable. */
  expandAll() {
    this._pattern.expansionBehavior.openAll();
  }

  /** Collapses all accordion panels. */
  collapseAll() {
    this._pattern.expansionBehavior.closeAll();
  }

  /** Gets the trigger pattern for a given element. */
  private _findTriggerPattern(
    element: Element | null | undefined,
  ): AccordionTriggerPattern | undefined {
    let target = element;

    while (target) {
      const pattern = this._triggerPatterns().find(t => t.element() === target);
      if (pattern) {
        return pattern;
      }

      target = target.parentElement?.closest('[ngAccordionTrigger]');
    }

    return undefined;
  }
}
