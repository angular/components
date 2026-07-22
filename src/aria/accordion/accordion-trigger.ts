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
  signal,
  model,
  booleanAttribute,
  computed,
  WritableSignal,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {AccordionPanelPattern, AccordionTriggerPattern} from '../private';
import {ACCORDION_GROUP} from './accordion-tokens';

/**
 * The trigger that toggles the visibility of its associated `ngAccordionPanel`.
 *
 * This directive requires a `panelId` that must match the `panelId` of the `ngAccordionPanel` it
 * controls. When clicked, it will expand or collapse the panel. It also handles keyboard
 * interactions for navigation within the `ngAccordionGroup`. It applies `role="button"` and manages
 * `aria-expanded`, `aria-controls`, and `aria-disabled` attributes for accessibility.
 * The `disabled` input can be used to disable the trigger.
 *
 * ```html
 * <button ngAccordionTrigger panelId="unique-id-1">
 *   Accordion Trigger Text
 * </button>
 * ```
 *
 * @developerPreview 21.0
 * @see [Accordion](guide/aria/accordion)
 */
@Directive({
  selector: '[ngAccordionTrigger]',
  exportAs: 'ngAccordionTrigger',
  host: {
    '[attr.data-active]': 'active()',
    'role': 'button',
    '[id]': '_pattern.id()',
    '[attr.aria-expanded]': 'expanded()',
    '[attr.aria-controls]': '_pattern.controls()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.disabled]': '_pattern.hardDisabled() ? true : null',
    '[attr.tabindex]': '_pattern.tabIndex()',
  },
})
export class AccordionTrigger {
  /** A reference to the trigger element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the trigger element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The parent AccordionGroup. */
  private readonly _accordionGroup = inject(ACCORDION_GROUP);

  /** A unique identifier for the widget. */
  readonly id = input(inject(_IdGenerator).getId('ng-accordion-trigger-', true));

  /** A local unique identifier for the trigger, used to match with its panel's `panelId`. */
  readonly panelId = input.required<string>();

  /** Whether the trigger is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the corresponding panel is expanded. */
  readonly expanded = model<boolean>(false);

  /** Whether the trigger is active. */
  readonly active = computed(() => this._pattern.active());

  /** The accordion panel pattern controlled by this trigger. This is set by AccordionGroup. */
  readonly _accordionPanelPattern: WritableSignal<AccordionPanelPattern | undefined> =
    signal(undefined);

  /** The UI pattern instance for this trigger. */
  readonly _pattern: AccordionTriggerPattern = new AccordionTriggerPattern({
    ...this,
    accordionGroup: computed(() => this._accordionGroup._pattern),
    accordionPanel: this._accordionPanelPattern,
    element: () => this.element,
  });

  /** Expands this item. */
  expand() {
    this._pattern.open();
  }

  /** Collapses this item. */
  collapse() {
    this._pattern.close();
  }

  /** Toggles the expansion state of this item. */
  toggle() {
    this._pattern.toggle();
  }
}
