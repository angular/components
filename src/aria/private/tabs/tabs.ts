/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {KeyboardEventManager, ClickEventManager} from '../behaviors/event-manager';
import {ExpansionItem, ListExpansion, ListExpansionInputs} from '../behaviors/expansion/expansion';
import {
  SignalLike,
  WritableSignalLike,
  computed,
  linkedSignal,
  signal,
} from '../behaviors/signal-like/signal-like';
import {LabelControl, LabelControlOptionalInputs} from '../behaviors/label/label';
import {ListFocus} from '../behaviors/list-focus/list-focus';
import {
  ListNavigation,
  ListNavigationInputs,
  ListNavigationItem,
} from '../behaviors/list-navigation/list-navigation';

/** The required inputs to tabs. */
export interface TabInputs
  extends Omit<ListNavigationItem, 'index'>, Omit<ExpansionItem, 'expandable' | 'expanded'> {
  /** The parent tablist that controls the tab. */
  tabList: SignalLike<TabListPattern>;

  /** The remote tabpanel controlled by the tab. */
  tabPanel: SignalLike<TabPanelPattern | undefined>;
}

/** A tab in a tablist. */
export class TabPattern {
  /** A global unique identifier for the tab. */
  readonly id: SignalLike<string>; // set from inputs

  /** Whether the tab is disabled. */
  readonly disabled: SignalLike<boolean>; // set from inputs

  /** The html element that should receive focus. */
  readonly element: SignalLike<HTMLElement> = () => this.inputs.element()!;

  /** Whether this tab has expandable panel. */
  readonly expandable: SignalLike<boolean> = () => true;

  /*
   * Whether the tab panel is expanded.
   * Primarily controlled by the behavior, which will read/write this value.
   * The consumer of this pattern will instead only use the selectedTab input.
   * The pattern will be responsible for synchronizing their state.
   */
  readonly expanded: WritableSignalLike<boolean> = linkedSignal(
    () => this.inputs.tabList().selectedTab() === this,
  );

  /** Whether the tab is active. */
  readonly active = computed(() => this.inputs.tabList().inputs.activeItem() === this);

  /** Whether the tab is selected. */
  readonly selected = computed(() => this.inputs.tabList().selectedTab() === this);

  /** The tab index of the tab. */
  readonly tabIndex = computed(() => this.inputs.tabList().focusBehavior.getItemTabIndex(this));

  /** The id of the tabpanel associated with the tab. */
  readonly controls = computed(() => this.inputs.tabPanel()?.id());

  constructor(readonly inputs: TabInputs) {
    this.id = inputs.id;
    this.disabled = inputs.disabled;
  }

  /** Opens the tab. */
  open(): boolean {
    return this.inputs.tabList().open(this);
  }
}

/** The required inputs for the tabpanel. */
export interface TabPanelInputs extends LabelControlOptionalInputs {
  /** A global unique identifier for the tabpanel. */
  id: SignalLike<string>;

  /** The tab that controls this tabpanel. */
  readonly tab: SignalLike<TabPattern | undefined>;
}

/** A tabpanel associated with a tab. */
export class TabPanelPattern {
  /** A global unique identifier for the tabpanel. */
  readonly id: SignalLike<string>; // set from inputs

  /** Controls label for this tabpanel. */
  readonly labelManager: LabelControl;

  /** Whether the tabpanel is hidden. */
  readonly hidden = computed(() => this.inputs.tab()?.expanded() === false);

  /** The tab index of this tabpanel. */
  readonly tabIndex = computed(() => (this.hidden() ? -1 : 0));

  /** The aria-labelledby value for this tabpanel. */
  readonly labelledBy = computed(() =>
    this.labelManager.labelledBy().length > 0
      ? this.labelManager.labelledBy().join(' ')
      : undefined,
  );

  constructor(readonly inputs: TabPanelInputs) {
    this.id = inputs.id;

    this.labelManager = new LabelControl({
      ...inputs,
      defaultLabelledBy: computed(() => (this.inputs.tab() ? [this.inputs.tab()!.id()] : [])),
    });
  }
}

/** The required inputs for the tablist. */
export interface TabListInputs
  extends
    Omit<ListNavigationInputs<TabPattern>, 'multi'>,
    Omit<ListExpansionInputs, 'multiExpandable' | 'items'> {
  /** The selection strategy used by the tablist. */
  selectionMode: SignalLike<'follow' | 'explicit'>;

  /** The currently selected tab. */
  selectedTab: WritableSignalLike<TabPattern | undefined>;
}

/** Controls the state of a tablist. */
export class TabListPattern {
  /** The list focus behavior for the tablist. */
  readonly focusBehavior: ListFocus<TabPattern>;

  /** The list navigation behavior for the tablist. */
  readonly navigationBehavior: ListNavigation<TabPattern>;

  /** Controls expansion for the tablist. */
  readonly expansionBehavior: ListExpansion;

  /** Whether the tablist has been interacted with. */
  readonly hasBeenInteracted = signal(false);

  /** The currently active tab. */
  readonly activeTab: SignalLike<TabPattern | undefined>; // set from inputs

  /** The currently selected tab. */
  readonly selectedTab: WritableSignalLike<TabPattern | undefined>; // set from inputs

  /** Whether the tablist is vertically or horizontally oriented. */
  readonly orientation: SignalLike<'vertical' | 'horizontal'>; // set from inputs

  /** Whether the tablist is disabled. */
  readonly disabled: SignalLike<boolean>; // set from inputs

  /** The tab index of the tablist. */
  readonly tabIndex = computed(() => this.focusBehavior.getListTabIndex());

  /** The id of the current active tab. */
  readonly activeDescendant = computed(() => this.focusBehavior.getActiveDescendant());

  /** Whether selection should follow focus. */
  readonly followFocus = computed(() => this.inputs.selectionMode() === 'follow');

  /** The key used to navigate to the previous tab in the tablist. */
  readonly prevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key used to navigate to the next item in the list. */
  readonly nextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The keydown event manager for the tablist. */
  readonly keydown = computed(() => {
    return new KeyboardEventManager()
      .on(
        this.prevKey,
        () => this._navigate(() => this.navigationBehavior.prev(), this.followFocus()),
        {ignoreRepeat: false},
      )
      .on(
        this.nextKey,
        () => this._navigate(() => this.navigationBehavior.next(), this.followFocus()),
        {ignoreRepeat: false},
      )
      .on('Home', () => this._navigate(() => this.navigationBehavior.first(), this.followFocus()))
      .on('End', () => this._navigate(() => this.navigationBehavior.last(), this.followFocus()))
      .on(' ', () => this.open())
      .on('Enter', () => this.open());
  });

  /** The click event manager for the tablist. */
  readonly clickManager = computed(() => {
    return new ClickEventManager<PointerEvent>().on(e =>
      this._navigate(() => this.navigationBehavior.goto(this._getItem(e)!), true),
    );
  });

  constructor(readonly inputs: TabListInputs) {
    this.selectedTab = inputs.selectedTab;
    this.activeTab = inputs.activeItem;
    this.orientation = inputs.orientation;
    this.disabled = inputs.disabled;

    this.focusBehavior = new ListFocus(inputs);

    this.navigationBehavior = new ListNavigation({
      ...inputs,
      focusManager: this.focusBehavior,
    });

    this.expansionBehavior = new ListExpansion({
      ...inputs,
      multiExpandable: () => false,
    });
  }

  /**
   * Sets the tablist to its default initial state.
   *
   * Sets the active index of the tablist to the first focusable selected
   * tab if one exists. Otherwise, sets focus to the first focusable tab.
   *
   * This method should be called once the tablist and its tabs are properly initialized.
   */
  setDefaultState() {
    let firstItem: TabPattern | undefined;

    for (const item of this.inputs.items()) {
      if (!this.focusBehavior.isFocusable(item)) continue;

      if (firstItem === undefined) {
        firstItem = item;
      }

      if (item.selected()) {
        this.inputs.activeItem.set(item);
        return;
      }
    }
    if (firstItem !== undefined) {
      this.inputs.activeItem.set(firstItem);
    }
  }

  /** Sets the default active state of the tablist before receiving interaction for the first time. */
  setDefaultStateEffect(): void {
    if (this.hasBeenInteracted()) return;

    this.setDefaultState();
  }

  /** Handles keydown events for the tablist. */
  onKeydown(event: KeyboardEvent) {
    if (!this.disabled()) {
      this.hasBeenInteracted.set(true);
      this.keydown().handle(event);
    }
  }

  /** The click event manager for the tablist. */
  onClick(event: PointerEvent) {
    if (!this.disabled()) {
      this.hasBeenInteracted.set(true);
      this.clickManager().handle(event);
    }
  }

  /** Handles focusin events for the tablist. */
  onFocusIn() {
    this.hasBeenInteracted.set(true);
  }

  /** Opens the given tab or the current active tab. */
  open(tab?: TabPattern): boolean;
  open(tab: TabPattern | undefined): boolean {
    tab ??= this.activeTab();

    if (tab === undefined) return false;

    const success = this.expansionBehavior.open(tab);
    if (success) {
      this.selectedTab.set(tab);
    }

    return success;
  }

  /** Executes a navigation operation and expand the active tab if needed. */
  private _navigate(op: () => boolean, shouldExpand: boolean = false): void {
    const success = op();
    if (success && shouldExpand) {
      this.open();
    }
  }

  /** Returns the tab item associated with the given pointer event. */
  private _getItem(e: PointerEvent) {
    if (!(e.target instanceof HTMLElement)) {
      return;
    }

    const element = e.target.closest('[role="tab"]');
    return this.inputs.items().find(i => i.element() === element);
  }
}
