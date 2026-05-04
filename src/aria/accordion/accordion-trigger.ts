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
  OnDestroy,
  OnInit,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  afterRenderEffect,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {AccordionTriggerPattern} from '../private';
import {ACCORDION_GROUP} from './accordion-tokens';
import {AccordionPanel} from './accordion-panel';

/**
 * The trigger that toggles the visibility of its associated `ngAccordionPanel`.
 *
 * This directive requires the `panel` input be set to the template reference of the `ngAccordionPanel`
 * it controls. When clicked, it will expand or collapse the panel. It also handles keyboard
 * interactions for navigation within the `ngAccordionGroup`. It applies `role="button"` and manages
 * `aria-expanded`, `aria-controls`, and `aria-disabled` attributes for accessibility.
 * The `disabled` input can be used to disable the trigger.
 *
 * ```html
 * <button ngAccordionTrigger [panel]="panel">
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
    '[id]': 'id()',
    '[attr.aria-expanded]': 'expanded()',
    '[attr.aria-controls]': '_pattern.controls()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.disabled]': '_pattern.hardDisabled() ? true : null',
    '[attr.tabindex]': '_pattern.tabIndex()',
  },
})
export class AccordionTrigger implements OnInit, OnDestroy {
  /** A reference to the trigger element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the trigger element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The parent AccordionGroup. */
  private readonly _accordionGroup = inject(ACCORDION_GROUP);

  /** The associated AccordionPanel. */
  readonly panel = input.required<AccordionPanel>();

  /** The unique identifier for the trigger. */
  readonly id = input(inject(_IdGenerator).getId('ng-accordion-trigger-', true));

  /** The unique identifier for the corresponding trigger panel. */
  readonly panelId = computed(() => this.panel().id());

  /** Whether the trigger is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the corresponding panel is expanded. */
  readonly expanded = model<boolean>(false);

  /** Whether the trigger is active. */
  readonly active = computed(() => this._pattern.active());

  /** The UI pattern instance for this trigger. */
  _pattern!: AccordionTriggerPattern;

  constructor() {
    // Check for any violations after the DOM has been updated.
    afterRenderEffect({
      read: () => {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          const violations: string[] = [];

          if (this.panel() && this.panel().element.contains(this.element)) {
            violations.push(
              'ngAccordionTrigger must not be nested inside its controlled ngAccordionPanel, otherwise it will become unreachable when collapsed.',
            );
          }
          if (this.panel() && (this.panel() as any)._pattern !== this._pattern) {
            violations.push(
              'ngAccordionPanel is already controlled by another ngAccordionTrigger.',
            );
          }

          for (const violation of violations) {
            console.error(violation);
          }
        }
      },
    });
  }

  ngOnInit() {
    this._pattern = new AccordionTriggerPattern({
      ...this,
      element: () => this.element,
      accordionGroup: () => this._accordionGroup._pattern,
      accordionPanelId: this.panelId,
    });

    // Only bind panel pattern if it wasn't already claimed, otherwise keep the original
    // to let the violation checker detect it at render time.
    if (this.panel() && !(this.panel() as any)._pattern) {
      this.panel()._pattern = this._pattern;
    }

    this._accordionGroup._collection.register(this);
  }

  ngOnDestroy() {
    this.panel()._pattern = undefined;

    this._accordionGroup._collection.unregister(this);
  }

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
