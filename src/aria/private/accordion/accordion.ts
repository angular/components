/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {KeyboardEventManager, PointerEventManager} from '../behaviors/event-manager';
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
> {
  /** A function that returns the trigger associated with a given element. */
  getItem: (e: Element | null | undefined) => AccordionTriggerPattern | undefined;
}

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

  /** The key used to navigate to the previous accordion trigger. */
  prevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key used to navigate to the next accordion trigger. */
  nextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The keydown event manager for the accordion trigger. */
  keydown = computed(() => {
    return new KeyboardEventManager()
      .on(this.prevKey, () => this.navigationBehavior.prev(), {ignoreRepeat: false})
      .on(this.nextKey, () => this.navigationBehavior.next(), {ignoreRepeat: false})
      .on('Home', () => this.navigationBehavior.first())
      .on('End', () => this.navigationBehavior.last())
      .on(' ', () => this.toggle())
      .on('Enter', () => this.toggle());
  });

  /** The pointerdown event manager for the accordion trigger. */
  pointerdown = computed(() => {
    return new PointerEventManager().on(e => {
      const item = this.inputs.getItem(e.target as Element);
      if (!item) return;

      this.navigationBehavior.goto(item);
      this.expansionBehavior.toggle(item);
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
    const item = this.inputs.getItem(event.target as Element);
    if (!item) return;
    if (!this.focusBehavior.isFocusable(item)) return;

    this.focusBehavior.focus(item);
  }

  /** Toggles the expansion state of the active accordion item. */
  toggle() {
    const activeItem = this.inputs.activeItem();
    if (activeItem === undefined) return;
    this.expansionBehavior.toggle(activeItem);
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
  readonly id: SignalLike<string> = () => this.inputs.id();

  /** A reference to the trigger element. */
  readonly element: SignalLike<HTMLElement> = () => this.inputs.element()!;

  /** Whether this trigger has expandable panel. */
  readonly expandable: SignalLike<boolean> = () => true;

  /** Whether the corresponding panel is expanded. */
  readonly expanded: WritableSignalLike<boolean>;

  /** Whether the trigger is active. */
  readonly active = computed(() => this.inputs.accordionGroup().inputs.activeItem() === this);

  /** Id of the accordion panel controlled by the trigger. */
  readonly controls = computed(() => this.inputs.accordionPanelId());

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

  constructor(readonly inputs: AccordionTriggerInputs) {
    this.expanded = inputs.expanded;
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
