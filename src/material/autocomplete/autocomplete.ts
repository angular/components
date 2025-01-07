/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  InjectionToken,
  Input,
  OnDestroy,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  inject,
} from '@angular/core';
import {AnimationEvent} from '@angular/animations';
import {
  MAT_OPTGROUP,
  MAT_OPTION_PARENT_COMPONENT,
  MatOptgroup,
  MatOption,
  ThemePalette,
} from '@angular/material/core';
import {_IdGenerator, ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {Platform} from '@angular/cdk/platform';
import {panelAnimation} from './animations';
import {Subscription} from 'rxjs';

/** Event object that is emitted when an autocomplete option is selected. */
export class MatAutocompleteSelectedEvent {
  constructor(
    /** Reference to the autocomplete panel that emitted the event. */
    public source: MatAutocomplete,
    /** Option that was selected. */
    public option: MatOption,
  ) {}
}

/** Event object that is emitted when an autocomplete option is activated. */
export interface MatAutocompleteActivatedEvent {
  /** Reference to the autocomplete panel that emitted the event. */
  source: MatAutocomplete;

  /** Option that was selected. */
  option: MatOption | null;
}

/** Default `mat-autocomplete` options that can be overridden. */
export interface MatAutocompleteDefaultOptions {
  /** Whether the first option should be highlighted when an autocomplete panel is opened. */
  autoActiveFirstOption?: boolean;

  /** Whether the active option should be selected as the user is navigating. */
  autoSelectActiveOption?: boolean;

  /**
   * Whether the user is required to make a selection when
   * they're interacting with the autocomplete.
   */
  requireSelection?: boolean;

  /** Class or list of classes to be applied to the autocomplete's overlay panel. */
  overlayPanelClass?: string | string[];

  /** Whether icon indicators should be hidden for single-selection. */
  hideSingleSelectionIndicator?: boolean;
}

/** Injection token to be used to override the default options for `mat-autocomplete`. */
export const MAT_AUTOCOMPLETE_DEFAULT_OPTIONS = new InjectionToken<MatAutocompleteDefaultOptions>(
  'mat-autocomplete-default-options',
  {
    providedIn: 'root',
    factory: MAT_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY,
  },
);

/** @docs-private */
export function MAT_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY(): MatAutocompleteDefaultOptions {
  return {
    autoActiveFirstOption: false,
    autoSelectActiveOption: false,
    hideSingleSelectionIndicator: false,
    requireSelection: false,
  };
}

/** Autocomplete component. */
@Component({
  selector: 'mat-autocomplete',
  templateUrl: 'autocomplete.html',
  styleUrl: 'autocomplete.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'matAutocomplete',
  host: {
    'class': 'mat-mdc-autocomplete',
  },
  providers: [{provide: MAT_OPTION_PARENT_COMPONENT, useExisting: MatAutocomplete}],
  animations: [panelAnimation],
})
export class MatAutocomplete implements AfterContentInit, OnDestroy {
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected _defaults = inject<MatAutocompleteDefaultOptions>(MAT_AUTOCOMPLETE_DEFAULT_OPTIONS);

  private _activeOptionChanges = Subscription.EMPTY;

  /** Emits when the panel animation is done. Null if the panel doesn't animate. */
  _animationDone = new EventEmitter<AnimationEvent>();

  /** Manages active item in option list based on key events. */
  _keyManager: ActiveDescendantKeyManager<MatOption>;

  /** Whether the autocomplete panel should be visible, depending on option length. */
  showPanel: boolean = false;

  /** Whether the autocomplete panel is open. */
  get isOpen(): boolean {
    return this._isOpen && this.showPanel;
  }
  _isOpen: boolean = false;

  /** Latest trigger that opened the autocomplete. */
  _latestOpeningTrigger: unknown;

  /** @docs-private Sets the theme color of the panel. */
  _setColor(value: ThemePalette) {
    this._color = value;
    this._changeDetectorRef.markForCheck();
  }
  /** @docs-private theme color of the panel */
  protected _color: ThemePalette;

  // The @ViewChild query for TemplateRef here needs to be static because some code paths
  // lead to the overlay being created before change detection has finished for this component.
  // Notably, another component may trigger `focus` on the autocomplete-trigger.

  /** @docs-private */
  @ViewChild(TemplateRef, {static: true}) template: TemplateRef<any>;

  /** Element for the panel containing the autocomplete options. */
  @ViewChild('panel') panel: ElementRef;

  /** Reference to all options within the autocomplete. */
  @ContentChildren(MatOption, {descendants: true}) options: QueryList<MatOption>;

  /** Reference to all option groups within the autocomplete. */
  @ContentChildren(MAT_OPTGROUP, {descendants: true}) optionGroups: QueryList<MatOptgroup>;

  /** Aria label of the autocomplete. */
  @Input('aria-label') ariaLabel: string;

  /** Input that can be used to specify the `aria-labelledby` attribute. */
  @Input('aria-labelledby') ariaLabelledby: string;

  /** Function that maps an option's control value to its display value in the trigger. */
  @Input() displayWith: ((value: any) => string) | null = null;

  /**
   * Whether the first option should be highlighted when the autocomplete panel is opened.
   * Can be configured globally through the `MAT_AUTOCOMPLETE_DEFAULT_OPTIONS` token.
   */
  @Input({transform: booleanAttribute}) autoActiveFirstOption: boolean;

  /** Whether the active option should be selected as the user is navigating. */
  @Input({transform: booleanAttribute}) autoSelectActiveOption: boolean;

  /**
   * Whether the user is required to make a selection when they're interacting with the
   * autocomplete. If the user moves away from the autocomplete without selecting an option from
   * the list, the value will be reset. If the user opens the panel and closes it without
   * interacting or selecting a value, the initial value will be kept.
   */
  @Input({transform: booleanAttribute}) requireSelection: boolean;

  /**
   * Specify the width of the autocomplete panel.  Can be any CSS sizing value, otherwise it will
   * match the width of its host.
   */
  @Input() panelWidth: string | number;

  /** Whether ripples are disabled within the autocomplete panel. */
  @Input({transform: booleanAttribute}) disableRipple: boolean;

  /** Event that is emitted whenever an option from the list is selected. */
  @Output() readonly optionSelected: EventEmitter<MatAutocompleteSelectedEvent> =
    new EventEmitter<MatAutocompleteSelectedEvent>();

  /** Event that is emitted when the autocomplete panel is opened. */
  @Output() readonly opened: EventEmitter<void> = new EventEmitter<void>();

  /** Event that is emitted when the autocomplete panel is closed. */
  @Output() readonly closed: EventEmitter<void> = new EventEmitter<void>();

  /** Emits whenever an option is activated. */
  @Output() readonly optionActivated: EventEmitter<MatAutocompleteActivatedEvent> =
    new EventEmitter<MatAutocompleteActivatedEvent>();

  /**
   * Takes classes set on the host mat-autocomplete element and applies them to the panel
   * inside the overlay container to allow for easy styling.
   */
  @Input('class')
  set classList(value: string | string[]) {
    this._classList = value;
    this._elementRef.nativeElement.className = '';
  }
  _classList: string | string[];

  /** Whether checkmark indicator for single-selection options is hidden. */
  @Input({transform: booleanAttribute})
  get hideSingleSelectionIndicator(): boolean {
    return this._hideSingleSelectionIndicator;
  }
  set hideSingleSelectionIndicator(value: boolean) {
    this._hideSingleSelectionIndicator = value;
    this._syncParentProperties();
  }
  private _hideSingleSelectionIndicator: boolean;

  /** Syncs the parent state with the individual options. */
  _syncParentProperties(): void {
    if (this.options) {
      for (const option of this.options) {
        option._changeDetectorRef.markForCheck();
      }
    }
  }

  /** Unique ID to be used by autocomplete trigger's "aria-owns" property. */
  id: string = inject(_IdGenerator).getId('mat-autocomplete-');

  /**
   * Tells any descendant `mat-optgroup` to use the inert a11y pattern.
   * @docs-private
   */
  readonly inertGroups: boolean;

  constructor(...args: unknown[]);

  constructor() {
    const platform = inject(Platform);

    // TODO(crisbeto): the problem that the `inertGroups` option resolves is only present on
    // Safari using VoiceOver. We should occasionally check back to see whether the bug
    // wasn't resolved in VoiceOver, and if it has, we can remove this and the `inertGroups`
    // option altogether.
    this.inertGroups = platform?.SAFARI || false;
    this.autoActiveFirstOption = !!this._defaults.autoActiveFirstOption;
    this.autoSelectActiveOption = !!this._defaults.autoSelectActiveOption;
    this.requireSelection = !!this._defaults.requireSelection;
    this._hideSingleSelectionIndicator = this._defaults.hideSingleSelectionIndicator ?? false;
  }

  ngAfterContentInit() {
    this._keyManager = new ActiveDescendantKeyManager<MatOption>(this.options)
      .withWrap()
      .skipPredicate(this._skipPredicate);
    this._activeOptionChanges = this._keyManager.change.subscribe(index => {
      if (this.isOpen) {
        this.optionActivated.emit({source: this, option: this.options.toArray()[index] || null});
      }
    });

    // Set the initial visibility state.
    this._setVisibility();
  }

  ngOnDestroy() {
    this._keyManager?.destroy();
    this._activeOptionChanges.unsubscribe();
    this._animationDone.complete();
  }

  /**
   * Sets the panel scrollTop. This allows us to manually scroll to display options
   * above or below the fold, as they are not actually being focused when active.
   */
  _setScrollTop(scrollTop: number): void {
    if (this.panel) {
      this.panel.nativeElement.scrollTop = scrollTop;
    }
  }

  /** Returns the panel's scrollTop. */
  _getScrollTop(): number {
    return this.panel ? this.panel.nativeElement.scrollTop : 0;
  }

  /** Panel should hide itself when the option list is empty. */
  _setVisibility() {
    this.showPanel = !!this.options.length;
    this._changeDetectorRef.markForCheck();
  }

  /** Emits the `select` event. */
  _emitSelectEvent(option: MatOption): void {
    const event = new MatAutocompleteSelectedEvent(this, option);
    this.optionSelected.emit(event);
  }

  /** Gets the aria-labelledby for the autocomplete panel. */
  _getPanelAriaLabelledby(labelId: string | null): string | null {
    if (this.ariaLabel) {
      return null;
    }

    const labelExpression = labelId ? labelId + ' ' : '';
    return this.ariaLabelledby ? labelExpression + this.ariaLabelledby : labelId;
  }

  // `skipPredicate` determines if key manager should avoid putting a given option in the tab
  // order. Allow disabled list items to receive focus via keyboard to align with WAI ARIA
  // recommendation.
  //
  // Normally WAI ARIA's instructions are to exclude disabled items from the tab order, but it
  // makes a few exceptions for compound widgets.
  //
  // From [Developing a Keyboard Interface](
  // https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/):
  //   "For the following composite widget elements, keep them focusable when disabled: Options in a
  //   Listbox..."
  //
  // The user can focus disabled options using the keyboard, but the user cannot click disabled
  // options.
  protected _skipPredicate() {
    return false;
  }
}
