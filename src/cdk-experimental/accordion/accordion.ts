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
  afterRenderEffect,
  signal,
  model,
  booleanAttribute,
  computed,
  WritableSignal,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {DeferredContent, DeferredContentAware} from '@angular/cdk-experimental/deferred-content';
import {
  AccordionGroupPattern,
  AccordionPanelPattern,
  AccordionTriggerPattern,
} from '../ui-patterns/';

/**
 * Represents the content panel of an accordion item. It is controlled by an
 * associated `CdkAccordionTrigger`.
 */
@Directive({
  selector: '[cdkAccordionPanel]',
  exportAs: 'cdkAccordionPanel',
  hostDirectives: [
    {
      directive: DeferredContentAware,
      inputs: ['preserveContent'],
    },
  ],
  host: {
    'class': 'cdk-accordion-panel',
    'role': 'region',
    '[attr.id]': 'pattern.id()',
    '[attr.aria-labelledby]': 'pattern.accordionTrigger()?.id()',
    '[attr.inert]': 'pattern.hidden() ? true : null',
  },
})
export class CdkAccordionPanel {
  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware);

  /** A global unique identifier for the panel. */
  private readonly _id = inject(_IdGenerator).getId('cdk-accordion-trigger-');

  /** A local unique identifier for the panel, used to match with its trigger's value. */
  value = input.required<string>();

  /** The parent accordion trigger pattern that controls this panel. This is set by CdkAccordionGroup. */
  readonly accordionTrigger: WritableSignal<AccordionTriggerPattern | undefined> =
    signal(undefined);

  /** The UI pattern instance for this panel. */
  readonly pattern: AccordionPanelPattern = new AccordionPanelPattern({
    id: () => this._id,
    value: this.value,
    accordionTrigger: () => this.accordionTrigger(),
  });

  constructor() {
    // Connect the panel's hidden state to the DeferredContentAware's visibility.
    afterRenderEffect(() => {
      this._deferredContentAware.contentVisible.set(!this.pattern.hidden());
    });
  }
}

/**
 * Represents the trigger button for an accordion item. It controls the expansion
 * state of an associated `CdkAccordionPanel`.
 */
@Directive({
  selector: '[cdkAccordionTrigger]',
  exportAs: 'cdkAccordionTrigger',
  host: {
    'class': 'cdk-accordion-trigger',
    '[class.cdk-active]': 'pattern.active()',
    'role': 'button',
    '[id]': 'pattern.id()',
    '[attr.aria-expanded]': 'pattern.expanded()',
    '[attr.aria-controls]': 'pattern.controls()',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[attr.tabindex]': 'pattern.tabindex()',
    '(keydown)': 'pattern.onKeydown($event)',
    '(pointerdown)': 'pattern.onPointerdown($event)',
    '(focusin)': 'pattern.onFocus($event)',
  },
})
export class CdkAccordionTrigger {
  /** A global unique identifier for the trigger. */
  private readonly _id = inject(_IdGenerator).getId('cdk-accordion-trigger-');

  /** A reference to the trigger element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent CdkAccordionGroup. */
  private readonly _accordionGroup = inject(CdkAccordionGroup);

  /** A local unique identifier for the trigger, used to match with its panel's value. */
  value = input.required<string>();

  /** Whether the trigger is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** The accordion panel pattern controlled by this trigger. This is set by CdkAccordionGroup. */
  readonly accordionPanel: WritableSignal<AccordionPanelPattern | undefined> = signal(undefined);

  /** The UI pattern instance for this trigger. */
  readonly pattern: AccordionTriggerPattern = new AccordionTriggerPattern({
    id: () => this._id,
    value: this.value,
    disabled: this.disabled,
    element: () => this._elementRef.nativeElement,
    accordionGroup: computed(() => this._accordionGroup.pattern),
    accordionPanel: this.accordionPanel,
  });
}

/**
 * Container for a group of accordion items. It manages the overall state and
 * interactions of the accordion, such as keyboard navigation and expansion mode.
 */
@Directive({
  selector: '[cdkAccordionGroup]',
  exportAs: 'cdkAccordionGroup',
  host: {
    'class': 'cdk-accordion-group',
  },
})
export class CdkAccordionGroup {
  /** The CdkAccordionTriggers nested inside this group. */
  protected readonly _triggers = contentChildren(CdkAccordionTrigger, {descendants: true});

  /** The CdkAccordionPanels nested inside this group. */
  protected readonly _panels = contentChildren(CdkAccordionPanel, {descendants: true});

  /** The text direction (ltr or rtl). */
  readonly textDirection = inject(Directionality).valueSignal;

  /** Whether the entire accordion group is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** Whether multiple accordion items can be expanded simultaneously. */
  multiExpandable = input(true, {transform: booleanAttribute});

  /** The values of the current selected/expanded accordions. */
  value = model<string[]>([]);

  /** Whether disabled items should be skipped during keyboard navigation. */
  skipDisabled = input(true, {transform: booleanAttribute});

  /** Whether keyboard navigation should wrap around from the last item to the first, and vice-versa. */
  wrap = input(false, {transform: booleanAttribute});

  /** The UI pattern instance for this accordion group. */
  readonly pattern: AccordionGroupPattern = new AccordionGroupPattern({
    ...this,
    // TODO(ok7sai): Consider making `activeIndex` an internal state in the pattern and call
    // `setDefaultState` in the CDK.
    activeIndex: signal(0),
    items: computed(() => this._triggers().map(trigger => trigger.pattern)),
    expandedIds: this.value,
    // TODO(ok7sai): Investigate whether an accordion should support horizontal mode.
    orientation: () => 'vertical',
  });

  constructor() {
    // Effect to link triggers with their corresponding panels and update the group's items.
    afterRenderEffect(() => {
      const triggers = this._triggers();
      const panels = this._panels();

      for (const trigger of triggers) {
        const panel = panels.find(p => p.value() === trigger.value());
        trigger.accordionPanel.set(panel?.pattern);
        if (panel) {
          panel.accordionTrigger.set(trigger.pattern);
        }
      }
    });
  }
}

/**
 * A structural directive that marks the `ng-template` to be used as the content
 * for a `CdkAccordionPanel`. This content can be lazily loaded.
 */
@Directive({
  selector: 'ng-template[cdkAccordionContent]',
  hostDirectives: [DeferredContent],
})
export class CdkAccordionContent {}
