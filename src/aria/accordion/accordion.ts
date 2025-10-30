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
import {DeferredContent, DeferredContentAware} from '@angular/aria/deferred-content';
import {
  AccordionGroupPattern,
  AccordionPanelPattern,
  AccordionTriggerPattern,
} from '@angular/aria/private';

/**
 * Represents the content panel of an accordion item. It is controlled by an
 * associated `AccordionTrigger`.
 */
@Directive({
  selector: '[ngAccordionPanel]',
  exportAs: 'ngAccordionPanel',
  hostDirectives: [
    {
      directive: DeferredContentAware,
      inputs: ['preserveContent'],
    },
  ],
  host: {
    'class': 'ng-accordion-panel',
    'role': 'region',
    '[attr.id]': '_pattern.id()',
    '[attr.aria-labelledby]': '_pattern.accordionTrigger()?.id()',
    '[attr.inert]': 'hidden() ? true : null',
  },
})
export class AccordionPanel {
  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware);

  /** A global unique identifier for the panel. */
  private readonly _id = inject(_IdGenerator).getId('accordion-trigger-', true);

  /** A local unique identifier for the panel, used to match with its trigger's value. */
  value = input.required<string>();

  /** Whether the accordion panel is hidden. True if the associated trigger is not expanded. */
  readonly hidden = computed(() => this._pattern.hidden());

  /** The parent accordion trigger pattern that controls this panel. This is set by AccordionGroup. */
  readonly accordionTrigger: WritableSignal<AccordionTriggerPattern | undefined> =
    signal(undefined);

  /** The UI pattern instance for this panel. */
  readonly _pattern: AccordionPanelPattern = new AccordionPanelPattern({
    id: () => this._id,
    value: this.value,
    accordionTrigger: () => this.accordionTrigger(),
  });

  constructor() {
    // Connect the panel's hidden state to the DeferredContentAware's visibility.
    afterRenderEffect(() => {
      this._deferredContentAware.contentVisible.set(!this.hidden());
    });
  }

  /** Opens this item. */
  open(itemValue: string) {
    this.accordionTrigger()?.expansionControl.open();
  }

  /** Closes this item. */
  close(itemValue: string) {
    this.accordionTrigger()?.expansionControl.close();
  }

  /** Toggles the expansion state of this item. */
  toggle(itemValue: string) {
    this.accordionTrigger()?.expansionControl.toggle();
  }
}

/**
 * Represents the trigger button for an accordion item. It controls the expansion
 * state of an associated `AccordionPanel`.
 */
@Directive({
  selector: '[ngAccordionTrigger]',
  exportAs: 'ngAccordionTrigger',
  host: {
    'class': 'ng-accordion-trigger',
    '[attr.data-active]': 'active()',
    'role': 'button',
    '[id]': '_pattern.id()',
    '[attr.aria-expanded]': 'expanded()',
    '[attr.aria-controls]': '_pattern.controls()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.disabled]': 'hardDisabled() ? true : null',
    '[attr.tabindex]': 'tabindex()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
    '(focusin)': '_pattern.onFocus($event)',
  },
})
export class AccordionTrigger {
  /** A global unique identifier for the trigger. */
  private readonly _id = inject(_IdGenerator).getId('ng-accordion-trigger-', true);

  /** A reference to the trigger element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent AccordionGroup. */
  private readonly _accordionGroup = inject(AccordionGroup);

  /** A local unique identifier for the trigger, used to match with its panel's value. */
  value = input.required<string>();

  /** Whether the trigger is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** Whether the trigger is active. */
  readonly active = computed(() => this._pattern.active());

  /** Whether the trigger is expanded. */
  readonly expanded = computed(() => this._pattern.expanded());

  /** The index of the trigger within its accordion group. */
  readonly index = computed(() => this._pattern.index());

  /** The tabindex of the trigger. */
  readonly tabindex = computed(() => this._pattern.tabindex());

  /**
   * Whether this trigger is completely inaccessible.
   *
   * TODO(ok7sai): Consider move this to UI patterns.
   */
  readonly hardDisabled = computed(() => this._pattern.disabled() && this._pattern.tabindex() < 0);

  /** The accordion panel pattern controlled by this trigger. This is set by AccordionGroup. */
  readonly accordionPanel: WritableSignal<AccordionPanelPattern | undefined> = signal(undefined);

  /** The UI pattern instance for this trigger. */
  readonly _pattern: AccordionTriggerPattern = new AccordionTriggerPattern({
    id: () => this._id,
    value: this.value,
    disabled: this.disabled,
    element: () => this._elementRef.nativeElement,
    accordionGroup: computed(() => this._accordionGroup._pattern),
    accordionPanel: this.accordionPanel,
  });

  /** Opens this item. */
  open(itemValue: string) {
    this._pattern.expansionControl.open();
  }

  /** Closes this item. */
  close(itemValue: string) {
    this._pattern.expansionControl.close();
  }

  /** Toggles the expansion state of this item. */
  toggle(itemValue: string) {
    this._pattern.expansionControl.toggle();
  }
}

/**
 * Container for a group of accordion items. It manages the overall state and
 * interactions of the accordion, such as keyboard navigation and expansion mode.
 */
@Directive({
  selector: '[ngAccordionGroup]',
  exportAs: 'ngAccordionGroup',
  host: {
    'class': 'ng-accordion-group',
  },
})
export class AccordionGroup {
  /** A reference to the group element. */
  private readonly _elementRef = inject(ElementRef);

  /** The AccordionTriggers nested inside this group. */
  protected readonly _triggers = contentChildren(AccordionTrigger, {descendants: true});

  /** The AccordionPanels nested inside this group. */
  protected readonly _panels = contentChildren(AccordionPanel, {descendants: true});

  /** The text direction (ltr or rtl). */
  readonly textDirection = inject(Directionality).valueSignal;

  /** Whether the entire accordion group is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** Whether multiple accordion items can be expanded simultaneously. */
  multiExpandable = input(true, {transform: booleanAttribute});

  /** The values of the current selected/expanded accordions. */
  value = model<string[]>([]);

  /** Whether to allow disabled items to receive focus. */
  softDisabled = input(false, {transform: booleanAttribute});

  /** Whether keyboard navigation should wrap around from the last item to the first, and vice-versa. */
  wrap = input(false, {transform: booleanAttribute});

  /** The UI pattern instance for this accordion group. */
  readonly _pattern: AccordionGroupPattern = new AccordionGroupPattern({
    ...this,
    // TODO(ok7sai): Consider making `activeItem` an internal state in the pattern and call
    // `setDefaultState` in the CDK.
    activeItem: signal(undefined),
    items: computed(() => this._triggers().map(trigger => trigger._pattern)),
    expandedIds: this.value,
    // TODO(ok7sai): Investigate whether an accordion should support horizontal mode.
    orientation: () => 'vertical',
    element: () => this._elementRef.nativeElement,
  });

  constructor() {
    // Effect to link triggers with their corresponding panels and update the group's items.
    afterRenderEffect(() => {
      const triggers = this._triggers();
      const panels = this._panels();

      for (const trigger of triggers) {
        const panel = panels.find(p => p.value() === trigger.value());
        trigger.accordionPanel.set(panel?._pattern);
        if (panel) {
          panel.accordionTrigger.set(trigger._pattern);
        }
      }
    });
  }

  /** Navigates to the first accordion panel. */
  first() {
    this._pattern.navigation.first();
  }

  /** Navigates to the last accordion panel. */
  last() {
    this._pattern.navigation.last();
  }

  /** Navigates to the previous accordion panel. */
  prev() {
    this._pattern.navigation.prev();
  }

  /** Navigates to the next accordion panel. */
  next() {
    this._pattern.navigation.next();
  }

  /** Opens the accordion panel with the specified value. */
  open(itemValue: string) {
    const trigger = this._findTriggerPatternByValue(itemValue);

    if (trigger) {
      this._pattern.expansionManager.open(trigger);
    }
  }

  /** Closes the accordion panel with the specified value. */
  close(itemValue: string) {
    const trigger = this._findTriggerPatternByValue(itemValue);

    if (trigger) {
      this._pattern.expansionManager.close(trigger);
    }
  }

  /** Toggles the expansion state of the accordion panel with the specified value. */
  toggle(itemValue: string) {
    const trigger = this._findTriggerPatternByValue(itemValue);

    if (trigger) {
      this._pattern.expansionManager.toggle(trigger);
    }
  }

  /** Opens all accordion panels if multi-expandable. */
  openAll() {
    this._pattern.expansionManager.openAll();
  }

  /** Closes all accordion panels. */
  closeAll() {
    this._pattern.expansionManager.closeAll();
  }

  _findTriggerPatternByValue(value: string) {
    const trigger = this._triggers().find(t => t.value() === value);

    return trigger?._pattern;
  }
}

/**
 * A structural directive that marks the `ng-template` to be used as the content
 * for a `AccordionPanel`. This content can be lazily loaded.
 */
@Directive({
  selector: 'ng-template[ngAccordionContent]',
  hostDirectives: [DeferredContent],
})
export class AccordionContent {}
