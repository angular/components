/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {KeyboardEventManager} from '../behaviors/event-manager/keyboard-event-manager';
import {PointerEventManager} from '../behaviors/event-manager/pointer-event-manager';
import {
  ExpansionItem,
  ExpansionControl,
  ListExpansion,
  ListExpansionInputs,
} from '../behaviors/expansion/expansion';
import {ListFocus, ListFocusInputs, ListFocusItem} from '../behaviors/list-focus/list-focus';
import {
  ListNavigation,
  ListNavigationInputs,
  ListNavigationItem,
} from '../behaviors/list-navigation/list-navigation';
import {SignalLike} from '../behaviors/signal-like/signal-like';

/** Inputs of the AccordionGroupPattern. */
export type AccordionGroupInputs = Omit<
  ListNavigationInputs<AccordionTriggerPattern> &
    ListFocusInputs<AccordionTriggerPattern> &
    ListExpansionInputs<AccordionTriggerPattern>,
  'focusMode'
>;

const focusMode = () => 'roving' as const;

export interface AccordionGroupPattern extends AccordionGroupInputs {}
/** A pattern controls the nested Accordions. */
export class AccordionGroupPattern {
  /** Controls navigation for the group. */
  navigation: ListNavigation<AccordionTriggerPattern>;

  /** Controls focus for the group. */
  focusManager: ListFocus<AccordionTriggerPattern>;

  /** Controls expansion for the group. */
  expansionManager: ListExpansion<AccordionTriggerPattern>;

  constructor(readonly inputs: AccordionGroupInputs) {
    this.wrap = inputs.wrap;
    this.orientation = inputs.orientation;
    this.textDirection = inputs.textDirection;
    this.activeIndex = inputs.activeIndex;
    this.disabled = inputs.disabled;
    this.multiExpandable = inputs.multiExpandable;
    this.items = inputs.items;
    this.expandedIds = inputs.expandedIds;
    this.skipDisabled = inputs.skipDisabled;
    this.focusManager = new ListFocus({
      ...inputs,
      focusMode,
    });
    this.navigation = new ListNavigation({
      ...inputs,
      focusMode,
      focusManager: this.focusManager,
    });
    this.expansionManager = new ListExpansion({
      ...inputs,
      focusMode,
      focusManager: this.focusManager,
    });
  }
}

/** Inputs for the AccordionTriggerPattern. */
export type AccordionTriggerInputs = ListNavigationItem &
  ListFocusItem &
  Omit<ExpansionItem, 'expansionId' | 'expandable'> & {
    /** A local unique identifier for the trigger. */
    value: SignalLike<string>;

    /** The parent accordion group that controls this trigger. */
    accordionGroup: SignalLike<AccordionGroupPattern>;

    /** The accordion panel controlled by this trigger. */
    accordionPanel: SignalLike<AccordionPanelPattern | undefined>;
  };

export interface AccordionTriggerPattern extends AccordionTriggerInputs {}
/** A pattern controls the expansion state of an accordion. */
export class AccordionTriggerPattern {
  /** Whether this tab has expandable content. */
  expandable: SignalLike<boolean>;

  /** The unique identifier used by the expansion behavior. */
  expansionId: SignalLike<string>;

  /** Whether an accordion is expanded. */
  expanded: SignalLike<boolean>;

  /** Controls the expansion state for the trigger. */
  expansionControl: ExpansionControl;

  /** Whether the trigger is active. */
  active = computed(() => this.inputs.accordionGroup().focusManager.activeItem() === this);

  /** Id of the accordion panel controlled by the trigger. */
  controls = computed(() => this.inputs.accordionPanel()?.id());

  /** The tabindex of the trigger. */
  tabindex = computed(() => (this.inputs.accordionGroup().focusManager.isFocusable(this) ? 0 : -1));

  /** Whether the trigger is disabled. Disabling an accordion group disables all the triggers. */
  disabled = computed(() => this.inputs.disabled() || this.inputs.accordionGroup().disabled());

  constructor(readonly inputs: AccordionTriggerInputs) {
    this.id = inputs.id;
    this.element = inputs.element;
    this.value = inputs.value;
    this.accordionGroup = inputs.accordionGroup;
    this.accordionPanel = inputs.accordionPanel;
    this.expansionControl = new ExpansionControl({
      ...inputs,
      expansionId: inputs.value,
      expandable: () => true,
      expansionManager: inputs.accordionGroup().expansionManager,
    });
    this.expandable = this.expansionControl.isExpandable;
    this.expansionId = this.expansionControl.expansionId;
    this.expanded = this.expansionControl.isExpanded;
  }

  /** The key used to navigate to the previous accordion trigger. */
  prevKey = computed(() => {
    if (this.inputs.accordionGroup().orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.inputs.accordionGroup().textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key used to navigate to the next accordion trigger. */
  nextKey = computed(() => {
    if (this.inputs.accordionGroup().orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.inputs.accordionGroup().textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The keydown event manager for the accordion trigger. */
  keydown = computed(() => {
    return new KeyboardEventManager()
      .on(this.prevKey, () => this.accordionGroup().navigation.prev())
      .on(this.nextKey, () => this.accordionGroup().navigation.next())
      .on('Home', () => this.accordionGroup().navigation.first())
      .on('End', () => this.accordionGroup().navigation.last())
      .on(' ', () => this.expansionControl.toggle())
      .on('Enter', () => this.expansionControl.toggle());
  });

  /** The pointerdown event manager for the accordion trigger. */
  pointerdown = computed(() => {
    return new PointerEventManager().on(e => {
      const item = this._getItem(e);

      if (item) {
        this.accordionGroup().navigation.goto(item);
        this.expansionControl.toggle();
      }
    });
  });

  /** Handles keydown events on the trigger, delegating to the group if not disabled. */
  onKeydown(event: KeyboardEvent): void {
    this.keydown().handle(event);
  }

  /** Handles pointerdown events on the trigger, delegating to the group if not disabled. */
  onPointerdown(event: PointerEvent): void {
    this.pointerdown().handle(event);
  }

  /** Handles focus events on the trigger. This ensures the tabbing changes the active index. */
  onFocus(event: FocusEvent): void {
    const item = this._getItem(event);

    if (item && this.inputs.accordionGroup().focusManager.isFocusable(item)) {
      this.accordionGroup().focusManager.focus(item);
    }
  }

  private _getItem(e: Event) {
    if (!(e.target instanceof HTMLElement)) {
      return;
    }

    const element = e.target.closest('[role="button"]');
    return this.accordionGroup()
      .items()
      .find(i => i.element() === element);
  }
}

/** Represents the required inputs for the AccordionPanelPattern. */
export interface AccordionPanelInputs {
  /** A global unique identifier for the panel. */
  id: SignalLike<string>;

  /** A local unique identifier for the panel, matching its trigger's value. */
  value: SignalLike<string>;

  /** The parent accordion trigger that controls this panel. */
  accordionTrigger: SignalLike<AccordionTriggerPattern | undefined>;
}

export interface AccordionPanelPattern extends AccordionPanelInputs {}
/** Represents an accordion panel. */
export class AccordionPanelPattern {
  /** Whether the accordion panel is hidden. True if the associated trigger is not expanded. */
  hidden: SignalLike<boolean>;

  constructor(readonly inputs: AccordionPanelInputs) {
    this.id = inputs.id;
    this.value = inputs.value;
    this.accordionTrigger = inputs.accordionTrigger;
    this.hidden = computed(() => inputs.accordionTrigger()?.expanded() === false);
  }
}
