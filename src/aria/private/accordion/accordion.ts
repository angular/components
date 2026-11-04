/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ClickEventManager, KeyboardEventManager} from '../behaviors/event-manager';
import {ExpansionItem, ListExpansion, ListExpansionInputs} from '../behaviors/expansion/expansion';
import {ListFocus, ListFocusInputs, ListFocusItem} from '../behaviors/list-focus/list-focus';
import {
  ListNavigation,
  ListNavigationInputs,
  ListNavigationItem,
} from '../behaviors/list-navigation/list-navigation';
import {computed, SignalLike, WritableSignalLike} from '../behaviors/signal-like/signal-like';

/** Inputs of the AccordionGroupPattern. */
export interface AccordionGroupInputs extends Omit<
  ListNavigationInputs<AccordionTriggerPattern> &
    ListFocusInputs<AccordionTriggerPattern> &
    Omit<ListExpansionInputs, 'items'>,
  'focusMode'
> {}

const focusMode = () => 'roving' as const;

/** A pattern controls the nested Accordions. */
export class AccordionGroupPattern {
  /** Controls navigation for the group. */
  readonly navigationBehavior: ListNavigation<AccordionTriggerPattern>;

  /** Controls focus for the group. */
  readonly focusBehavior: ListFocus<AccordionTriggerPattern>;

  /** Controls expansion for the group. */
  readonly expansionBehavior: ListExpansion;

  constructor(readonly inputs: AccordionGroupInputs) {
    this.focusBehavior = new ListFocus({
      ...inputs,
      focusMode,
    });
    this.navigationBehavior = new ListNavigation({
      ...inputs,
      focusMode,
      focusManager: this.focusBehavior,
    });
    this.expansionBehavior = new ListExpansion({
      ...inputs,
    });
  }

  /** Expands all accordion panels if multi-expandable. */
  expandAll() {
    this.expansionBehavior.openAll();
  }

  /** Collapses all accordion panels. */
  collapseAll() {
    this.expansionBehavior.closeAll();
  }

  /** Returns a set of violations */
  validate(): string[] {
    const violations: string[] = [];

    if (!this.inputs.multiExpandable()) {
      const expandedCount = this.inputs.items().filter(t => t.expanded()).length;
      if (expandedCount > 1) {
        violations.push(
          'ngAccordionGroup has multiExpandable set to false, but multiple ngAccordionTrigger panels are initially expanded.',
        );
      }
    }

    return violations;
  }
}

/** Inputs for the AccordionTriggerPattern. */
export interface AccordionTriggerInputs
  extends Omit<ListNavigationItem & ListFocusItem, 'index'>, Omit<ExpansionItem, 'expandable'> {
  /** The parent accordion group that controls this trigger. */
  accordionGroup: SignalLike<AccordionGroupPattern>;

  /** The accordion panel id controlled by this trigger. */
  accordionPanelId: SignalLike<string>;
}

/** A pattern controls the expansion state of an accordion. */
export class AccordionTriggerPattern implements ListNavigationItem, ListFocusItem, ExpansionItem {
  /** A unique identifier for this trigger. */
  readonly id: SignalLike<string>; // set from inputs

  /** A reference to the trigger element. */
  readonly element: SignalLike<HTMLElement> = () => this.inputs.element()!;

  /** Whether this trigger has expandable panel. */
  readonly expandable: SignalLike<boolean> = () => true;

  /** Whether the corresponding panel is expanded. */
  readonly expanded: WritableSignalLike<boolean>; // set from inputs

  /** Whether the trigger is active. */
  readonly active = computed(() => this.inputs.accordionGroup().inputs.activeItem() === this);

  /** Id of the accordion panel controlled by the trigger. */
  readonly controls: SignalLike<string>; // set from inputs

  /** The tabindex of the trigger. */
  readonly tabIndex = computed(() =>
    this.inputs.accordionGroup().focusBehavior.isFocusable(this) ? 0 : -1,
  );

  /** Whether the trigger is disabled. Disabling an accordion group disables all the triggers. */
  readonly disabled = computed(
    () => this.inputs.disabled() || this.inputs.accordionGroup().inputs.disabled(),
  );

  /** Whether the trigger is hard disabled.  */
  readonly hardDisabled = computed(
    () => this.disabled() && !this.inputs.accordionGroup().inputs.softDisabled(),
  );

  /** The key used to navigate to the previous accordion trigger. */
  private readonly _prevKey = computed(() => {
    if (this.inputs.accordionGroup().inputs.orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.inputs.accordionGroup().inputs.textDirection() === 'rtl'
      ? 'ArrowRight'
      : 'ArrowLeft';
  });

  /** The key used to navigate to the next accordion trigger. */
  private readonly _nextKey = computed(() => {
    if (this.inputs.accordionGroup().inputs.orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.inputs.accordionGroup().inputs.textDirection() === 'rtl'
      ? 'ArrowLeft'
      : 'ArrowRight';
  });

  /** The keydown event manager for the accordion trigger. */
  readonly keydown = computed(() => {
    const group = this.inputs.accordionGroup();
    return new KeyboardEventManager()
      .on(this._prevKey, () => group.navigationBehavior.prev(), {ignoreRepeat: false})
      .on(this._nextKey, () => group.navigationBehavior.next(), {ignoreRepeat: false})
      .on('Home', () => group.navigationBehavior.first())
      .on('End', () => group.navigationBehavior.last())
      .on(' ', () => this.toggle())
      .on('Enter', () => this.toggle());
  });

  /** The click event manager for the accordion trigger. */
  readonly click = computed(() => {
    return new ClickEventManager<PointerEvent>().on(() => {
      const group = this.inputs.accordionGroup();
      group.navigationBehavior.goto(this);
      group.expansionBehavior.toggle(this);
    });
  });

  constructor(readonly inputs: AccordionTriggerInputs) {
    this.id = inputs.id;
    this.expanded = inputs.expanded;
    this.controls = inputs.accordionPanelId;
  }

  /** Handles keydown events on the trigger, delegating to the group if not disabled. */
  onKeydown(event: KeyboardEvent): void {
    if (!this.active()) {
      this.inputs.accordionGroup().focusBehavior.focus(this, {focusElement: false});
    }
    this.keydown().handle(event);
  }

  /** Handles click events on the trigger, delegating to the group if not disabled. */
  onClick(event: PointerEvent): void {
    this.click().handle(event);
  }

  /** Handles focus events on the trigger. This ensures the tabbing changes the active index. */
  onFocus(): void {
    this.inputs.accordionGroup().focusBehavior.focus(this, {focusElement: false});
  }

  /** Opens the accordion panel. */
  open(): void {
    this.inputs.accordionGroup().expansionBehavior.open(this);
  }

  /** Closes the accordion panel. */
  close(): void {
    this.inputs.accordionGroup().expansionBehavior.close(this);
  }

  /** Toggles the accordion panel. */
  toggle(): void {
    this.inputs.accordionGroup().expansionBehavior.toggle(this);
  }
}
