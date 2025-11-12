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
import {
  DeferredContent,
  DeferredContentAware,
  AccordionGroupPattern,
  AccordionPanelPattern,
  AccordionTriggerPattern,
} from '@angular/aria/private';

/**
 * The content panel of an accordion item that is conditionally visible.
 *
 * This directive is a container for the content that is shown or hidden. It requires
 * a `panelId` that must match the `panelId` of its corresponding `ngAccordionTrigger`.
 * The content within the panel should be provided using an `ng-template` with the
 * `ngAccordionContent` directive so that the content is not rendered on the page until the trigger
 * is expanded. It applies `role="region"` for accessibility and uses the `inert` attribute to hide
 * its content from assistive technologies when not visible.
 *
 * ```html
 * <div ngAccordionPanel panelId="unique-id-1">
 *   <ng-template ngAccordionContent>
 *     <p>This content is lazily rendered and will be shown when the panel is expanded.</p>
 *   </ng-template>
 * </div>
 * ```
 *
 * @developerPreview 21.0
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
    '[attr.inert]': '!visible() ? true : null',
  },
})
export class AccordionPanel {
  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware);

  /** A global unique identifier for the panel. */
  private readonly _id = inject(_IdGenerator).getId('accordion-trigger-', true);

  /** A local unique identifier for the panel, used to match with its trigger's `panelId`. */
  panelId = input.required<string>();

  /** Whether the accordion panel is visible. True if the associated trigger is expanded. */
  readonly visible = computed(() => !this._pattern.hidden());

  /** The parent accordion trigger pattern that controls this panel. This is set by AccordionGroup. */
  readonly accordionTrigger: WritableSignal<AccordionTriggerPattern | undefined> =
    signal(undefined);

  /** The UI pattern instance for this panel. */
  readonly _pattern: AccordionPanelPattern = new AccordionPanelPattern({
    id: () => this._id,
    panelId: this.panelId,
    accordionTrigger: () => this.accordionTrigger(),
  });

  constructor() {
    // Connect the panel's hidden state to the DeferredContentAware's visibility.
    afterRenderEffect(() => {
      this._deferredContentAware.contentVisible.set(this.visible());
    });
  }

  /** Expands this item. */
  expand() {
    this.accordionTrigger()?.expansionControl.open();
  }

  /** Collapses this item. */
  collapse() {
    this.accordionTrigger()?.expansionControl.close();
  }

  /** Toggles the expansion state of this item. */
  toggle() {
    this.accordionTrigger()?.expansionControl.toggle();
  }
}

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
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.disabled]': 'hardDisabled() ? true : null',
    '[attr.tabindex]': '_pattern.tabIndex()',
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

  /** A local unique identifier for the trigger, used to match with its panel's `panelId`. */
  panelId = input.required<string>();

  /** Whether the trigger is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** Whether the trigger is active. */
  readonly active = computed(() => this._pattern.active());

  /** Whether the trigger is expanded. */
  readonly expanded = computed(() => this._pattern.expanded());

  // TODO(ok7sai): Consider moving this to UI patterns.
  /** Whether this trigger is inaccessible via keyboard navigation. */
  readonly hardDisabled = computed(() => this._pattern.disabled() && this._pattern.tabIndex() < 0);

  /** The accordion panel pattern controlled by this trigger. This is set by AccordionGroup. */
  readonly accordionPanel: WritableSignal<AccordionPanelPattern | undefined> = signal(undefined);

  /** The UI pattern instance for this trigger. */
  readonly _pattern: AccordionTriggerPattern = new AccordionTriggerPattern({
    id: () => this._id,
    panelId: this.panelId,
    disabled: this.disabled,
    element: () => this._elementRef.nativeElement,
    accordionGroup: computed(() => this._accordionGroup._pattern),
    accordionPanel: this.accordionPanel,
  });

  /** Expands this item. */
  expand() {
    this._pattern.expansionControl.open();
  }

  /** Collapses this item. */
  collapse() {
    this._pattern.expansionControl.close();
  }

  /** Toggles the expansion state of this item. */
  toggle() {
    this._pattern.expansionControl.toggle();
  }
}

/**
 * A container for a group of accordion items. It manages the overall state and
 * interactions of the accordion, such as keyboard navigation and expansion mode.
 *
 * The `ngAccordionGroup` serves as the root of a group of accordion triggers and panels,
 * coordinating the behavior of the `ngAccordionTrigger` and `ngAccordionPanel` elements within it.
 * It supports both single and multiple expansion modes.
 *
 * ```html
 * <div ngAccordionGroup [multiExpandable]="true" [(expandedPanels)]="expandedItems">
 *   <div class="accordion-item">
 *     <h3>
 *       <button ngAccordionTrigger panelId="item-1">Item 1</button>
 *     </h3>
 *     <div ngAccordionPanel panelId="item-1">
 *       <ng-template ngAccordionContent>
 *         <p>Content for Item 1.</p>
 *       </ng-template>
 *     </div>
 *   </div>
 *   <div class="accordion-item">
 *     <h3>
 *       <button ngAccordionTrigger panelId="item-2">Item 2</button>
 *     </h3>
 *     <div ngAccordionPanel panelId="item-2">
 *       <ng-template ngAccordionContent>
 *         <p>Content for Item 2.</p>
 *       </ng-template>
 *     </div>
 *   </div>
 * </div>
 * ```
 *
 * @developerPreview 21.0
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

  /** The ids of the currently expanded accordion panels. */
  expandedPanels = model<string[]>([]);

  /**
   * Whether to allow disabled items to receive focus. When `true`, disabled items are
   * focusable but not interactive. When `false`, disabled items are skipped during navigation.
   */
  softDisabled = input(true, {transform: booleanAttribute});

  /** Whether keyboard navigation should wrap around from the last item to the first, and vice-versa. */
  wrap = input(false, {transform: booleanAttribute});

  /** The UI pattern instance for this accordion group. */
  readonly _pattern: AccordionGroupPattern = new AccordionGroupPattern({
    ...this,
    // TODO(ok7sai): Consider making `activeItem` an internal state in the pattern and call
    // `setDefaultState` in the CDK.
    activeItem: signal(undefined),
    items: computed(() => this._triggers().map(trigger => trigger._pattern)),
    expandedIds: this.expandedPanels,
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
        const panel = panels.find(p => p.panelId() === trigger.panelId());
        trigger.accordionPanel.set(panel?._pattern);
        if (panel) {
          panel.accordionTrigger.set(trigger._pattern);
        }
      }
    });
  }

  /** Expands all accordion panels if multi-expandable. */
  expandAll() {
    this._pattern.expansionManager.openAll();
  }

  /** Collapses all accordion panels. */
  collapseAll() {
    this._pattern.expansionManager.closeAll();
  }
}

/**
 * A structural directive that provides a mechanism for lazily rendering the content for an
 * `ngAccordionPanel`.
 *
 * This directive should be applied to an `ng-template` inside an `ngAccordionPanel`.
 * It allows the content of the panel to be lazily rendered, improving performance
 * by only creating the content when the panel is first expanded.
 *
 * ```html
 * <div ngAccordionPanel panelId="unique-id-1">
 *   <ng-template ngAccordionContent>
 *     <p>This is the content that will be displayed inside the panel.</p>
 *   </ng-template>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: 'ng-template[ngAccordionContent]',
  hostDirectives: [DeferredContent],
})
export class AccordionContent {}
