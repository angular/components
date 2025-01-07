/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  _IdGenerator,
  ActiveDescendantKeyManager,
  addAriaReferencedId,
  LiveAnnouncer,
  removeAriaReferencedId,
} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {SelectionModel} from '@angular/cdk/collections';
import {
  A,
  DOWN_ARROW,
  ENTER,
  hasModifierKey,
  LEFT_ARROW,
  RIGHT_ARROW,
  SPACE,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  ConnectedPosition,
  Overlay,
  ScrollStrategy,
} from '@angular/cdk/overlay';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {
  AfterContentInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  DoCheck,
  ElementRef,
  EventEmitter,
  inject,
  InjectionToken,
  Input,
  numberAttribute,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
  HostAttributeToken,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormGroupDirective,
  NgControl,
  NgForm,
  Validators,
} from '@angular/forms';
import {
  _countGroupLabelsBeforeOption,
  _ErrorStateTracker,
  _getOptionScrollPosition,
  ErrorStateMatcher,
  MAT_OPTGROUP,
  MAT_OPTION_PARENT_COMPONENT,
  MatOptgroup,
  MatOption,
  MatOptionSelectionChange,
} from '@angular/material/core';
import {MAT_FORM_FIELD, MatFormField, MatFormFieldControl} from '@angular/material/form-field';
import {defer, merge, Observable, Subject} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  startWith,
  switchMap,
  take,
  takeUntil,
} from 'rxjs/operators';
import {matSelectAnimations} from './select-animations';
import {
  getMatSelectDynamicMultipleError,
  getMatSelectNonArrayValueError,
  getMatSelectNonFunctionValueError,
} from './select-errors';
import {NgClass} from '@angular/common';

/** Injection token that determines the scroll handling while a select is open. */
export const MAT_SELECT_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
  'mat-select-scroll-strategy',
  {
    providedIn: 'root',
    factory: () => {
      const overlay = inject(Overlay);
      return () => overlay.scrollStrategies.reposition();
    },
  },
);

/** @docs-private */
export function MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY(
  overlay: Overlay,
): () => ScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

/** Object that can be used to configure the default options for the select module. */
export interface MatSelectConfig {
  /** Whether option centering should be disabled. */
  disableOptionCentering?: boolean;

  /** Time to wait in milliseconds after the last keystroke before moving focus to an item. */
  typeaheadDebounceInterval?: number;

  /** Class or list of classes to be applied to the menu's overlay panel. */
  overlayPanelClass?: string | string[];

  /** Whether icon indicators should be hidden for single-selection. */
  hideSingleSelectionIndicator?: boolean;

  /**
   * Width of the panel. If set to `auto`, the panel will match the trigger width.
   * If set to null or an empty string, the panel will grow to match the longest option's text.
   */
  panelWidth?: string | number | null;

  /**
   * Whether nullable options can be selected by default.
   * See `MatSelect.canSelectNullableOptions` for more information.
   */
  canSelectNullableOptions?: boolean;
}

/** Injection token that can be used to provide the default options the select module. */
export const MAT_SELECT_CONFIG = new InjectionToken<MatSelectConfig>('MAT_SELECT_CONFIG');

/** @docs-private */
export const MAT_SELECT_SCROLL_STRATEGY_PROVIDER = {
  provide: MAT_SELECT_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
};

/**
 * Injection token that can be used to reference instances of `MatSelectTrigger`. It serves as
 * alternative token to the actual `MatSelectTrigger` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_SELECT_TRIGGER = new InjectionToken<MatSelectTrigger>('MatSelectTrigger');

/** Change event object that is emitted when the select value has changed. */
export class MatSelectChange {
  constructor(
    /** Reference to the select that emitted the change event. */
    public source: MatSelect,
    /** Current value of the select that emitted the event. */
    public value: any,
  ) {}
}

@Component({
  selector: 'mat-select',
  exportAs: 'matSelect',
  templateUrl: 'select.html',
  styleUrl: 'select.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'combobox',
    'aria-haspopup': 'listbox',
    'class': 'mat-mdc-select',
    '[attr.id]': 'id',
    '[attr.tabindex]': 'disabled ? -1 : tabIndex',
    '[attr.aria-controls]': 'panelOpen ? id + "-panel" : null',
    '[attr.aria-expanded]': 'panelOpen',
    '[attr.aria-label]': 'ariaLabel || null',
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState',
    '[attr.aria-activedescendant]': '_getAriaActiveDescendant()',
    '[class.mat-mdc-select-disabled]': 'disabled',
    '[class.mat-mdc-select-invalid]': 'errorState',
    '[class.mat-mdc-select-required]': 'required',
    '[class.mat-mdc-select-empty]': 'empty',
    '[class.mat-mdc-select-multiple]': 'multiple',
    '(keydown)': '_handleKeydown($event)',
    '(focus)': '_onFocus()',
    '(blur)': '_onBlur()',
  },
  animations: [matSelectAnimations.transformPanel],
  providers: [
    {provide: MatFormFieldControl, useExisting: MatSelect},
    {provide: MAT_OPTION_PARENT_COMPONENT, useExisting: MatSelect},
  ],
  imports: [CdkOverlayOrigin, CdkConnectedOverlay, NgClass],
})
export class MatSelect
  implements
    AfterContentInit,
    OnChanges,
    OnDestroy,
    OnInit,
    DoCheck,
    ControlValueAccessor,
    MatFormFieldControl<any>
{
  protected _viewportRuler = inject(ViewportRuler);
  protected _changeDetectorRef = inject(ChangeDetectorRef);
  readonly _elementRef = inject(ElementRef);
  private _dir = inject(Directionality, {optional: true});
  private _idGenerator = inject(_IdGenerator);
  protected _parentFormField = inject<MatFormField>(MAT_FORM_FIELD, {optional: true});
  ngControl = inject(NgControl, {self: true, optional: true})!;
  private _liveAnnouncer = inject(LiveAnnouncer);
  protected _defaultOptions = inject(MAT_SELECT_CONFIG, {optional: true});
  private _initialized = new Subject();

  /** All of the defined select options. */
  @ContentChildren(MatOption, {descendants: true}) options: QueryList<MatOption>;

  // TODO(crisbeto): this is only necessary for the non-MDC select, but it's technically a
  // public API so we have to keep it. It should be deprecated and removed eventually.
  /** All of the defined groups of options. */
  @ContentChildren(MAT_OPTGROUP, {descendants: true}) optionGroups: QueryList<MatOptgroup>;

  /** User-supplied override of the trigger element. */
  @ContentChild(MAT_SELECT_TRIGGER) customTrigger: MatSelectTrigger;

  /**
   * This position config ensures that the top "start" corner of the overlay
   * is aligned with with the top "start" of the origin by default (overlapping
   * the trigger completely). If the panel cannot fit below the trigger, it
   * will fall back to a position above the trigger.
   */
  _positions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    },
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      panelClass: 'mat-mdc-select-panel-above',
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      panelClass: 'mat-mdc-select-panel-above',
    },
  ];

  /** Scrolls a particular option into the view. */
  _scrollOptionIntoView(index: number): void {
    const option = this.options.toArray()[index];

    if (option) {
      const panel: HTMLElement = this.panel.nativeElement;
      const labelCount = _countGroupLabelsBeforeOption(index, this.options, this.optionGroups);
      const element = option._getHostElement();

      if (index === 0 && labelCount === 1) {
        // If we've got one group label before the option and we're at the top option,
        // scroll the list to the top. This is better UX than scrolling the list to the
        // top of the option, because it allows the user to read the top group's label.
        panel.scrollTop = 0;
      } else {
        panel.scrollTop = _getOptionScrollPosition(
          element.offsetTop,
          element.offsetHeight,
          panel.scrollTop,
          panel.offsetHeight,
        );
      }
    }
  }

  /** Called when the panel has been opened and the overlay has settled on its final position. */
  private _positioningSettled() {
    this._scrollOptionIntoView(this._keyManager.activeItemIndex || 0);
  }

  /** Creates a change event object that should be emitted by the select. */
  private _getChangeEvent(value: any) {
    return new MatSelectChange(this, value);
  }

  /** Factory function used to create a scroll strategy for this select. */
  private _scrollStrategyFactory = inject(MAT_SELECT_SCROLL_STRATEGY);

  /** Whether or not the overlay panel is open. */
  private _panelOpen = false;

  /** Comparison function to specify which option is displayed. Defaults to object equality. */
  private _compareWith = (o1: any, o2: any) => o1 === o2;

  /** Unique id for this input. */
  private _uid = this._idGenerator.getId('mat-select-');

  /** Current `aria-labelledby` value for the select trigger. */
  private _triggerAriaLabelledBy: string | null = null;

  /**
   * Keeps track of the previous form control assigned to the select.
   * Used to detect if it has changed.
   */
  private _previousControl: AbstractControl | null | undefined;

  /** Emits whenever the component is destroyed. */
  protected readonly _destroy = new Subject<void>();

  /** Tracks the error state of the select. */
  private _errorStateTracker: _ErrorStateTracker;

  /**
   * Emits whenever the component state changes and should cause the parent
   * form-field to update. Implemented as part of `MatFormFieldControl`.
   * @docs-private
   */
  readonly stateChanges = new Subject<void>();

  /**
   * Disable the automatic labeling to avoid issues like #27241.
   * @docs-private
   */
  readonly disableAutomaticLabeling = true;

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input('aria-describedby') userAriaDescribedBy: string;

  /** Deals with the selection logic. */
  _selectionModel: SelectionModel<MatOption>;

  /** Manages keyboard events for options in the panel. */
  _keyManager: ActiveDescendantKeyManager<MatOption>;

  /** Ideal origin for the overlay panel. */
  _preferredOverlayOrigin: CdkOverlayOrigin | ElementRef | undefined;

  /** Width of the overlay panel. */
  _overlayWidth: string | number;

  /** `View -> model callback called when value changes` */
  _onChange: (value: any) => void = () => {};

  /** `View -> model callback called when select has been touched` */
  _onTouched = () => {};

  /** ID for the DOM node containing the select's value. */
  _valueId = this._idGenerator.getId('mat-select-value-');

  /** Emits when the panel element is finished transforming in. */
  readonly _panelDoneAnimatingStream = new Subject<string>();

  /** Strategy that will be used to handle scrolling while the select panel is open. */
  _scrollStrategy: ScrollStrategy;

  _overlayPanelClass: string | string[] = this._defaultOptions?.overlayPanelClass || '';

  /** Whether the select is focused. */
  get focused(): boolean {
    return this._focused || this._panelOpen;
  }
  private _focused = false;

  /** A name for this control that can be used by `mat-form-field`. */
  controlType = 'mat-select';

  /** Trigger that opens the select. */
  @ViewChild('trigger') trigger: ElementRef;

  /** Panel containing the select options. */
  @ViewChild('panel') panel: ElementRef;

  /** Overlay pane containing the options. */
  @ViewChild(CdkConnectedOverlay)
  protected _overlayDir: CdkConnectedOverlay;

  /** Classes to be passed to the select panel. Supports the same syntax as `ngClass`. */
  @Input() panelClass: string | string[] | Set<string> | {[key: string]: any};

  /** Whether the select is disabled. */
  @Input({transform: booleanAttribute})
  disabled: boolean = false;

  /** Whether ripples in the select are disabled. */
  @Input({transform: booleanAttribute})
  disableRipple: boolean = false;

  /** Tab index of the select. */
  @Input({
    transform: (value: unknown) => (value == null ? 0 : numberAttribute(value)),
  })
  tabIndex: number = 0;

  /** Whether checkmark indicator for single-selection options is hidden. */
  @Input({transform: booleanAttribute})
  get hideSingleSelectionIndicator(): boolean {
    return this._hideSingleSelectionIndicator;
  }
  set hideSingleSelectionIndicator(value: boolean) {
    this._hideSingleSelectionIndicator = value;
    this._syncParentProperties();
  }
  private _hideSingleSelectionIndicator: boolean =
    this._defaultOptions?.hideSingleSelectionIndicator ?? false;

  /** Placeholder to be shown if no value has been selected. */
  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  private _placeholder: string;

  /** Whether the component is required. */
  @Input({transform: booleanAttribute})
  get required(): boolean {
    return this._required ?? this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }
  set required(value: boolean) {
    this._required = value;
    this.stateChanges.next();
  }
  private _required: boolean | undefined;

  /** Whether the user should be allowed to select multiple options. */
  @Input({transform: booleanAttribute})
  get multiple(): boolean {
    return this._multiple;
  }
  set multiple(value: boolean) {
    if (this._selectionModel && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw getMatSelectDynamicMultipleError();
    }

    this._multiple = value;
  }
  private _multiple: boolean = false;

  /** Whether to center the active option over the trigger. */
  @Input({transform: booleanAttribute})
  disableOptionCentering = this._defaultOptions?.disableOptionCentering ?? false;

  /**
   * Function to compare the option values with the selected values. The first argument
   * is a value from an option. The second is a value from the selection. A boolean
   * should be returned.
   */
  @Input()
  get compareWith() {
    return this._compareWith;
  }
  set compareWith(fn: (o1: any, o2: any) => boolean) {
    if (typeof fn !== 'function' && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw getMatSelectNonFunctionValueError();
    }
    this._compareWith = fn;
    if (this._selectionModel) {
      // A different comparator means the selection could change.
      this._initializeSelection();
    }
  }

  /** Value of the select control. */
  @Input()
  get value(): any {
    return this._value;
  }
  set value(newValue: any) {
    const hasAssigned = this._assignValue(newValue);

    if (hasAssigned) {
      this._onChange(newValue);
    }
  }
  private _value: any;

  /** Aria label of the select. */
  @Input('aria-label') ariaLabel: string = '';

  /** Input that can be used to specify the `aria-labelledby` attribute. */
  @Input('aria-labelledby') ariaLabelledby: string;

  /** Object used to control when error messages are shown. */
  @Input()
  get errorStateMatcher() {
    return this._errorStateTracker.matcher;
  }
  set errorStateMatcher(value: ErrorStateMatcher) {
    this._errorStateTracker.matcher = value;
  }

  /** Time to wait in milliseconds after the last keystroke before moving focus to an item. */
  @Input({transform: numberAttribute})
  typeaheadDebounceInterval: number;

  /**
   * Function used to sort the values in a select in multiple mode.
   * Follows the same logic as `Array.prototype.sort`.
   */
  @Input() sortComparator: (a: MatOption, b: MatOption, options: MatOption[]) => number;

  /** Unique id of the element. */
  @Input()
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value || this._uid;
    this.stateChanges.next();
  }
  private _id: string;

  /** Whether the select is in an error state. */
  get errorState() {
    return this._errorStateTracker.errorState;
  }
  set errorState(value: boolean) {
    this._errorStateTracker.errorState = value;
  }

  /**
   * Width of the panel. If set to `auto`, the panel will match the trigger width.
   * If set to null or an empty string, the panel will grow to match the longest option's text.
   */
  @Input() panelWidth: string | number | null =
    this._defaultOptions && typeof this._defaultOptions.panelWidth !== 'undefined'
      ? this._defaultOptions.panelWidth
      : 'auto';

  /**
   * By default selecting an option with a `null` or `undefined` value will reset the select's
   * value. Enable this option if the reset behavior doesn't match your requirements and instead
   * the nullable options should become selected. The value of this input can be controlled app-wide
   * using the `MAT_SELECT_CONFIG` injection token.
   */
  @Input({transform: booleanAttribute})
  canSelectNullableOptions: boolean = this._defaultOptions?.canSelectNullableOptions ?? false;

  /** Combined stream of all of the child options' change events. */
  readonly optionSelectionChanges: Observable<MatOptionSelectionChange> = defer(() => {
    const options = this.options;

    if (options) {
      return options.changes.pipe(
        startWith(options),
        switchMap(() => merge(...options.map(option => option.onSelectionChange))),
      );
    }

    return this._initialized.pipe(switchMap(() => this.optionSelectionChanges));
  });

  /** Event emitted when the select panel has been toggled. */
  @Output() readonly openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** Event emitted when the select has been opened. */
  @Output('opened') readonly _openedStream: Observable<void> = this.openedChange.pipe(
    filter(o => o),
    map(() => {}),
  );

  /** Event emitted when the select has been closed. */
  @Output('closed') readonly _closedStream: Observable<void> = this.openedChange.pipe(
    filter(o => !o),
    map(() => {}),
  );

  /** Event emitted when the selected value has been changed by the user. */
  @Output() readonly selectionChange = new EventEmitter<MatSelectChange>();

  /**
   * Event that emits whenever the raw value of the select changes. This is here primarily
   * to facilitate the two-way binding for the `value` input.
   * @docs-private
   */
  @Output() readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(...args: unknown[]);

  constructor() {
    const defaultErrorStateMatcher = inject(ErrorStateMatcher);
    const parentForm = inject(NgForm, {optional: true});
    const parentFormGroup = inject(FormGroupDirective, {optional: true});
    const tabIndex = inject(new HostAttributeToken('tabindex'), {optional: true});

    if (this.ngControl) {
      // Note: we provide the value accessor through here, instead of
      // the `providers` to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }

    // Note that we only want to set this when the defaults pass it in, otherwise it should
    // stay as `undefined` so that it falls back to the default in the key manager.
    if (this._defaultOptions?.typeaheadDebounceInterval != null) {
      this.typeaheadDebounceInterval = this._defaultOptions.typeaheadDebounceInterval;
    }

    this._errorStateTracker = new _ErrorStateTracker(
      defaultErrorStateMatcher,
      this.ngControl,
      parentFormGroup,
      parentForm,
      this.stateChanges,
    );
    this._scrollStrategy = this._scrollStrategyFactory();
    this.tabIndex = tabIndex == null ? 0 : parseInt(tabIndex) || 0;

    // Force setter to be called in case id was not specified.
    this.id = this.id;
  }

  ngOnInit() {
    this._selectionModel = new SelectionModel<MatOption>(this.multiple);
    this.stateChanges.next();

    // We need `distinctUntilChanged` here, because some browsers will
    // fire the animation end event twice for the same animation. See:
    // https://github.com/angular/angular/issues/24084
    this._panelDoneAnimatingStream
      .pipe(distinctUntilChanged(), takeUntil(this._destroy))
      .subscribe(() => this._panelDoneAnimating(this.panelOpen));

    this._viewportRuler
      .change()
      .pipe(takeUntil(this._destroy))
      .subscribe(() => {
        if (this.panelOpen) {
          this._overlayWidth = this._getOverlayWidth(this._preferredOverlayOrigin);
          this._changeDetectorRef.detectChanges();
        }
      });
  }

  ngAfterContentInit() {
    this._initialized.next();
    this._initialized.complete();

    this._initKeyManager();

    this._selectionModel.changed.pipe(takeUntil(this._destroy)).subscribe(event => {
      event.added.forEach(option => option.select());
      event.removed.forEach(option => option.deselect());
    });

    this.options.changes.pipe(startWith(null), takeUntil(this._destroy)).subscribe(() => {
      this._resetOptions();
      this._initializeSelection();
    });
  }

  ngDoCheck() {
    const newAriaLabelledby = this._getTriggerAriaLabelledby();
    const ngControl = this.ngControl;

    // We have to manage setting the `aria-labelledby` ourselves, because part of its value
    // is computed as a result of a content query which can cause this binding to trigger a
    // "changed after checked" error.
    if (newAriaLabelledby !== this._triggerAriaLabelledBy) {
      const element: HTMLElement = this._elementRef.nativeElement;
      this._triggerAriaLabelledBy = newAriaLabelledby;
      if (newAriaLabelledby) {
        element.setAttribute('aria-labelledby', newAriaLabelledby);
      } else {
        element.removeAttribute('aria-labelledby');
      }
    }

    if (ngControl) {
      // The disabled state might go out of sync if the form group is swapped out. See #17860.
      if (this._previousControl !== ngControl.control) {
        if (
          this._previousControl !== undefined &&
          ngControl.disabled !== null &&
          ngControl.disabled !== this.disabled
        ) {
          this.disabled = ngControl.disabled;
        }

        this._previousControl = ngControl.control;
      }

      this.updateErrorState();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Updating the disabled state is handled by the input, but we need to additionally let
    // the parent form field know to run change detection when the disabled state changes.
    if (changes['disabled'] || changes['userAriaDescribedBy']) {
      this.stateChanges.next();
    }

    if (changes['typeaheadDebounceInterval'] && this._keyManager) {
      this._keyManager.withTypeAhead(this.typeaheadDebounceInterval);
    }
  }

  ngOnDestroy() {
    this._keyManager?.destroy();
    this._destroy.next();
    this._destroy.complete();
    this.stateChanges.complete();
    this._clearFromModal();
  }

  /** Toggles the overlay panel open or closed. */
  toggle(): void {
    this.panelOpen ? this.close() : this.open();
  }

  /** Opens the overlay panel. */
  open(): void {
    if (!this._canOpen()) {
      return;
    }

    // It's important that we read this as late as possible, because doing so earlier will
    // return a different element since it's based on queries in the form field which may
    // not have run yet. Also this needs to be assigned before we measure the overlay width.
    if (this._parentFormField) {
      this._preferredOverlayOrigin = this._parentFormField.getConnectedOverlayOrigin();
    }

    this._overlayWidth = this._getOverlayWidth(this._preferredOverlayOrigin);
    this._applyModalPanelOwnership();
    this._panelOpen = true;
    this._keyManager.withHorizontalOrientation(null);
    this._highlightCorrectOption();
    this._changeDetectorRef.markForCheck();

    // Required for the MDC form field to pick up when the overlay has been opened.
    this.stateChanges.next();
  }

  /**
   * Track which modal we have modified the `aria-owns` attribute of. When the combobox trigger is
   * inside an aria-modal, we apply aria-owns to the parent modal with the `id` of the options
   * panel. Track the modal we have changed so we can undo the changes on destroy.
   */
  private _trackedModal: Element | null = null;

  /**
   * If the autocomplete trigger is inside of an `aria-modal` element, connect
   * that modal to the options panel with `aria-owns`.
   *
   * For some browser + screen reader combinations, when navigation is inside
   * of an `aria-modal` element, the screen reader treats everything outside
   * of that modal as hidden or invisible.
   *
   * This causes a problem when the combobox trigger is _inside_ of a modal, because the
   * options panel is rendered _outside_ of that modal, preventing screen reader navigation
   * from reaching the panel.
   *
   * We can work around this issue by applying `aria-owns` to the modal with the `id` of
   * the options panel. This effectively communicates to assistive technology that the
   * options panel is part of the same interaction as the modal.
   *
   * At time of this writing, this issue is present in VoiceOver.
   * See https://github.com/angular/components/issues/20694
   */
  private _applyModalPanelOwnership() {
    // TODO(http://github.com/angular/components/issues/26853): consider de-duplicating this with
    // the `LiveAnnouncer` and any other usages.
    //
    // Note that the selector here is limited to CDK overlays at the moment in order to reduce the
    // section of the DOM we need to look through. This should cover all the cases we support, but
    // the selector can be expanded if it turns out to be too narrow.
    const modal = this._elementRef.nativeElement.closest(
      'body > .cdk-overlay-container [aria-modal="true"]',
    );

    if (!modal) {
      // Most commonly, the autocomplete trigger is not inside a modal.
      return;
    }

    const panelId = `${this.id}-panel`;

    if (this._trackedModal) {
      removeAriaReferencedId(this._trackedModal, 'aria-owns', panelId);
    }

    addAriaReferencedId(modal, 'aria-owns', panelId);
    this._trackedModal = modal;
  }

  /** Clears the reference to the listbox overlay element from the modal it was added to. */
  private _clearFromModal() {
    if (!this._trackedModal) {
      // Most commonly, the autocomplete trigger is not used inside a modal.
      return;
    }

    const panelId = `${this.id}-panel`;

    removeAriaReferencedId(this._trackedModal, 'aria-owns', panelId);
    this._trackedModal = null;
  }

  /** Closes the overlay panel and focuses the host element. */
  close(): void {
    if (this._panelOpen) {
      this._panelOpen = false;
      this._keyManager.withHorizontalOrientation(this._isRtl() ? 'rtl' : 'ltr');
      this._changeDetectorRef.markForCheck();
      this._onTouched();
      // Required for the MDC form field to pick up when the overlay has been closed.
      this.stateChanges.next();
    }
  }

  /**
   * Sets the select's value. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   *
   * @param value New value to be written to the model.
   */
  writeValue(value: any): void {
    this._assignValue(value);
  }

  /**
   * Saves a callback function to be invoked when the select's value
   * changes from user input. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   *
   * @param fn Callback to be triggered when the value changes.
   */
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  /**
   * Saves a callback function to be invoked when the select is blurred
   * by the user. Part of the ControlValueAccessor interface required
   * to integrate with Angular's core forms API.
   *
   * @param fn Callback to be triggered when the component has been touched.
   */
  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  /**
   * Disables the select. Part of the ControlValueAccessor interface required
   * to integrate with Angular's core forms API.
   *
   * @param isDisabled Sets whether the component is disabled.
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }

  /** Whether or not the overlay panel is open. */
  get panelOpen(): boolean {
    return this._panelOpen;
  }

  /** The currently selected option. */
  get selected(): MatOption | MatOption[] {
    return this.multiple ? this._selectionModel?.selected || [] : this._selectionModel?.selected[0];
  }

  /** The value displayed in the trigger. */
  get triggerValue(): string {
    if (this.empty) {
      return '';
    }

    if (this._multiple) {
      const selectedOptions = this._selectionModel.selected.map(option => option.viewValue);

      if (this._isRtl()) {
        selectedOptions.reverse();
      }

      // TODO(crisbeto): delimiter should be configurable for proper localization.
      return selectedOptions.join(', ');
    }

    return this._selectionModel.selected[0].viewValue;
  }

  /** Refreshes the error state of the select. */
  updateErrorState() {
    this._errorStateTracker.updateErrorState();
  }

  /** Whether the element is in RTL mode. */
  _isRtl(): boolean {
    return this._dir ? this._dir.value === 'rtl' : false;
  }

  /** Handles all keydown events on the select. */
  _handleKeydown(event: KeyboardEvent): void {
    if (!this.disabled) {
      this.panelOpen ? this._handleOpenKeydown(event) : this._handleClosedKeydown(event);
    }
  }

  /** Handles keyboard events while the select is closed. */
  private _handleClosedKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    const isArrowKey =
      keyCode === DOWN_ARROW ||
      keyCode === UP_ARROW ||
      keyCode === LEFT_ARROW ||
      keyCode === RIGHT_ARROW;
    const isOpenKey = keyCode === ENTER || keyCode === SPACE;
    const manager = this._keyManager;

    // Open the select on ALT + arrow key to match the native <select>
    if (
      (!manager.isTyping() && isOpenKey && !hasModifierKey(event)) ||
      ((this.multiple || event.altKey) && isArrowKey)
    ) {
      event.preventDefault(); // prevents the page from scrolling down when pressing space
      this.open();
    } else if (!this.multiple) {
      const previouslySelectedOption = this.selected;
      manager.onKeydown(event);
      const selectedOption = this.selected;

      // Since the value has changed, we need to announce it ourselves.
      if (selectedOption && previouslySelectedOption !== selectedOption) {
        // We set a duration on the live announcement, because we want the live element to be
        // cleared after a while so that users can't navigate to it using the arrow keys.
        this._liveAnnouncer.announce((selectedOption as MatOption).viewValue, 10000);
      }
    }
  }

  /** Handles keyboard events when the selected is open. */
  private _handleOpenKeydown(event: KeyboardEvent): void {
    const manager = this._keyManager;
    const keyCode = event.keyCode;
    const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW;
    const isTyping = manager.isTyping();

    if (isArrowKey && event.altKey) {
      // Close the select on ALT + arrow key to match the native <select>
      event.preventDefault();
      this.close();
      // Don't do anything in this case if the user is typing,
      // because the typing sequence can include the space key.
    } else if (
      !isTyping &&
      (keyCode === ENTER || keyCode === SPACE) &&
      manager.activeItem &&
      !hasModifierKey(event)
    ) {
      event.preventDefault();
      manager.activeItem._selectViaInteraction();
    } else if (!isTyping && this._multiple && keyCode === A && event.ctrlKey) {
      event.preventDefault();
      const hasDeselectedOptions = this.options.some(opt => !opt.disabled && !opt.selected);

      this.options.forEach(option => {
        if (!option.disabled) {
          hasDeselectedOptions ? option.select() : option.deselect();
        }
      });
    } else {
      const previouslyFocusedIndex = manager.activeItemIndex;

      manager.onKeydown(event);

      if (
        this._multiple &&
        isArrowKey &&
        event.shiftKey &&
        manager.activeItem &&
        manager.activeItemIndex !== previouslyFocusedIndex
      ) {
        manager.activeItem._selectViaInteraction();
      }
    }
  }

  _onFocus() {
    if (!this.disabled) {
      this._focused = true;
      this.stateChanges.next();
    }
  }

  /**
   * Calls the touched callback only if the panel is closed. Otherwise, the trigger will
   * "blur" to the panel when it opens, causing a false positive.
   */
  _onBlur() {
    this._focused = false;
    this._keyManager?.cancelTypeahead();

    if (!this.disabled && !this.panelOpen) {
      this._onTouched();
      this._changeDetectorRef.markForCheck();
      this.stateChanges.next();
    }
  }

  /**
   * Callback that is invoked when the overlay panel has been attached.
   */
  _onAttached(): void {
    this._overlayDir.positionChange.pipe(take(1)).subscribe(() => {
      this._changeDetectorRef.detectChanges();
      this._positioningSettled();
    });
  }

  /** Returns the theme to be used on the panel. */
  _getPanelTheme(): string {
    return this._parentFormField ? `mat-${this._parentFormField.color}` : '';
  }

  /** Whether the select has a value. */
  get empty(): boolean {
    return !this._selectionModel || this._selectionModel.isEmpty();
  }

  private _initializeSelection(): void {
    // Defer setting the value in order to avoid the "Expression
    // has changed after it was checked" errors from Angular.
    Promise.resolve().then(() => {
      if (this.ngControl) {
        this._value = this.ngControl.value;
      }

      this._setSelectionByValue(this._value);
      this.stateChanges.next();
    });
  }

  /**
   * Sets the selected option based on a value. If no option can be
   * found with the designated value, the select trigger is cleared.
   */
  private _setSelectionByValue(value: any | any[]): void {
    this.options.forEach(option => option.setInactiveStyles());
    this._selectionModel.clear();

    if (this.multiple && value) {
      if (!Array.isArray(value) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        throw getMatSelectNonArrayValueError();
      }

      value.forEach((currentValue: any) => this._selectOptionByValue(currentValue));
      this._sortValues();
    } else {
      const correspondingOption = this._selectOptionByValue(value);

      // Shift focus to the active item. Note that we shouldn't do this in multiple
      // mode, because we don't know what option the user interacted with last.
      if (correspondingOption) {
        this._keyManager.updateActiveItem(correspondingOption);
      } else if (!this.panelOpen) {
        // Otherwise reset the highlighted option. Note that we only want to do this while
        // closed, because doing it while open can shift the user's focus unnecessarily.
        this._keyManager.updateActiveItem(-1);
      }
    }

    this._changeDetectorRef.markForCheck();
  }

  /**
   * Finds and selects and option based on its value.
   * @returns Option that has the corresponding value.
   */
  private _selectOptionByValue(value: any): MatOption | undefined {
    const correspondingOption = this.options.find((option: MatOption) => {
      // Skip options that are already in the model. This allows us to handle cases
      // where the same primitive value is selected multiple times.
      if (this._selectionModel.isSelected(option)) {
        return false;
      }

      try {
        // Treat null as a special reset value.
        return (
          (option.value != null || this.canSelectNullableOptions) &&
          this._compareWith(option.value, value)
        );
      } catch (error) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          // Notify developers of errors in their comparator.
          console.warn(error);
        }
        return false;
      }
    });

    if (correspondingOption) {
      this._selectionModel.select(correspondingOption);
    }

    return correspondingOption;
  }

  /** Assigns a specific value to the select. Returns whether the value has changed. */
  private _assignValue(newValue: any | any[]): boolean {
    // Always re-assign an array, because it might have been mutated.
    if (newValue !== this._value || (this._multiple && Array.isArray(newValue))) {
      if (this.options) {
        this._setSelectionByValue(newValue);
      }

      this._value = newValue;
      return true;
    }
    return false;
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
  private _skipPredicate = (option: MatOption) => {
    if (this.panelOpen) {
      // Support keyboard focusing disabled options in an ARIA listbox.
      return false;
    }

    // When the panel is closed, skip over disabled options. Support options via the UP/DOWN arrow
    // keys on a closed select. ARIA listbox interaction pattern is less relevant when the panel is
    // closed.
    return option.disabled;
  };

  /** Gets how wide the overlay panel should be. */
  private _getOverlayWidth(
    preferredOrigin: ElementRef<ElementRef> | CdkOverlayOrigin | undefined,
  ): string | number {
    if (this.panelWidth === 'auto') {
      const refToMeasure =
        preferredOrigin instanceof CdkOverlayOrigin
          ? preferredOrigin.elementRef
          : preferredOrigin || this._elementRef;
      return refToMeasure.nativeElement.getBoundingClientRect().width;
    }

    return this.panelWidth === null ? '' : this.panelWidth;
  }
  /** Syncs the parent state with the individual options. */
  _syncParentProperties(): void {
    if (this.options) {
      for (const option of this.options) {
        option._changeDetectorRef.markForCheck();
      }
    }
  }

  /** Sets up a key manager to listen to keyboard events on the overlay panel. */
  private _initKeyManager() {
    this._keyManager = new ActiveDescendantKeyManager<MatOption>(this.options)
      .withTypeAhead(this.typeaheadDebounceInterval)
      .withVerticalOrientation()
      .withHorizontalOrientation(this._isRtl() ? 'rtl' : 'ltr')
      .withHomeAndEnd()
      .withPageUpDown()
      .withAllowedModifierKeys(['shiftKey'])
      .skipPredicate(this._skipPredicate);

    this._keyManager.tabOut.subscribe(() => {
      if (this.panelOpen) {
        // Select the active item when tabbing away. This is consistent with how the native
        // select behaves. Note that we only want to do this in single selection mode.
        if (!this.multiple && this._keyManager.activeItem) {
          this._keyManager.activeItem._selectViaInteraction();
        }

        // Restore focus to the trigger before closing. Ensures that the focus
        // position won't be lost if the user got focus into the overlay.
        this.focus();
        this.close();
      }
    });

    this._keyManager.change.subscribe(() => {
      if (this._panelOpen && this.panel) {
        this._scrollOptionIntoView(this._keyManager.activeItemIndex || 0);
      } else if (!this._panelOpen && !this.multiple && this._keyManager.activeItem) {
        this._keyManager.activeItem._selectViaInteraction();
      }
    });
  }

  /** Drops current option subscriptions and IDs and resets from scratch. */
  private _resetOptions(): void {
    const changedOrDestroyed = merge(this.options.changes, this._destroy);

    this.optionSelectionChanges.pipe(takeUntil(changedOrDestroyed)).subscribe(event => {
      this._onSelect(event.source, event.isUserInput);

      if (event.isUserInput && !this.multiple && this._panelOpen) {
        this.close();
        this.focus();
      }
    });

    // Listen to changes in the internal state of the options and react accordingly.
    // Handles cases like the labels of the selected options changing.
    merge(...this.options.map(option => option._stateChanges))
      .pipe(takeUntil(changedOrDestroyed))
      .subscribe(() => {
        // `_stateChanges` can fire as a result of a change in the label's DOM value which may
        // be the result of an expression changing. We have to use `detectChanges` in order
        // to avoid "changed after checked" errors (see #14793).
        this._changeDetectorRef.detectChanges();
        this.stateChanges.next();
      });
  }

  /** Invoked when an option is clicked. */
  private _onSelect(option: MatOption, isUserInput: boolean): void {
    const wasSelected = this._selectionModel.isSelected(option);

    if (!this.canSelectNullableOptions && option.value == null && !this._multiple) {
      option.deselect();
      this._selectionModel.clear();

      if (this.value != null) {
        this._propagateChanges(option.value);
      }
    } else {
      if (wasSelected !== option.selected) {
        option.selected
          ? this._selectionModel.select(option)
          : this._selectionModel.deselect(option);
      }

      if (isUserInput) {
        this._keyManager.setActiveItem(option);
      }

      if (this.multiple) {
        this._sortValues();

        if (isUserInput) {
          // In case the user selected the option with their mouse, we
          // want to restore focus back to the trigger, in order to
          // prevent the select keyboard controls from clashing with
          // the ones from `mat-option`.
          this.focus();
        }
      }
    }

    if (wasSelected !== this._selectionModel.isSelected(option)) {
      this._propagateChanges();
    }

    this.stateChanges.next();
  }

  /** Sorts the selected values in the selected based on their order in the panel. */
  private _sortValues() {
    if (this.multiple) {
      const options = this.options.toArray();

      this._selectionModel.sort((a, b) => {
        return this.sortComparator
          ? this.sortComparator(a, b, options)
          : options.indexOf(a) - options.indexOf(b);
      });
      this.stateChanges.next();
    }
  }

  /** Emits change event to set the model value. */
  private _propagateChanges(fallbackValue?: any): void {
    let valueToEmit: any;

    if (this.multiple) {
      valueToEmit = (this.selected as MatOption[]).map(option => option.value);
    } else {
      valueToEmit = this.selected ? (this.selected as MatOption).value : fallbackValue;
    }

    this._value = valueToEmit;
    this.valueChange.emit(valueToEmit);
    this._onChange(valueToEmit);
    this.selectionChange.emit(this._getChangeEvent(valueToEmit));
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Highlights the selected item. If no option is selected, it will highlight
   * the first *enabled* option.
   */
  private _highlightCorrectOption(): void {
    if (this._keyManager) {
      if (this.empty) {
        // Find the index of the first *enabled* option. Avoid calling `_keyManager.setActiveItem`
        // because it activates the first option that passes the skip predicate, rather than the
        // first *enabled* option.
        let firstEnabledOptionIndex = -1;
        for (let index = 0; index < this.options.length; index++) {
          const option = this.options.get(index)!;
          if (!option.disabled) {
            firstEnabledOptionIndex = index;
            break;
          }
        }

        this._keyManager.setActiveItem(firstEnabledOptionIndex);
      } else {
        this._keyManager.setActiveItem(this._selectionModel.selected[0]);
      }
    }
  }

  /** Whether the panel is allowed to open. */
  protected _canOpen(): boolean {
    return !this._panelOpen && !this.disabled && this.options?.length > 0;
  }

  /** Focuses the select element. */
  focus(options?: FocusOptions): void {
    this._elementRef.nativeElement.focus(options);
  }

  /** Gets the aria-labelledby for the select panel. */
  _getPanelAriaLabelledby(): string | null {
    if (this.ariaLabel) {
      return null;
    }

    const labelId = this._parentFormField?.getLabelId() || null;
    const labelExpression = labelId ? labelId + ' ' : '';
    return this.ariaLabelledby ? labelExpression + this.ariaLabelledby : labelId;
  }

  /** Determines the `aria-activedescendant` to be set on the host. */
  _getAriaActiveDescendant(): string | null {
    if (this.panelOpen && this._keyManager && this._keyManager.activeItem) {
      return this._keyManager.activeItem.id;
    }

    return null;
  }

  /** Gets the aria-labelledby of the select component trigger. */
  private _getTriggerAriaLabelledby(): string | null {
    if (this.ariaLabel) {
      return null;
    }

    const labelId = this._parentFormField?.getLabelId();
    let value = (labelId ? labelId + ' ' : '') + this._valueId;

    if (this.ariaLabelledby) {
      value += ' ' + this.ariaLabelledby;
    }

    return value;
  }

  /** Called when the overlay panel is done animating. */
  protected _panelDoneAnimating(isOpen: boolean) {
    this.openedChange.emit(isOpen);
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  setDescribedByIds(ids: string[]) {
    if (ids.length) {
      this._elementRef.nativeElement.setAttribute('aria-describedby', ids.join(' '));
    } else {
      this._elementRef.nativeElement.removeAttribute('aria-describedby');
    }
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  onContainerClick() {
    this.focus();
    this.open();
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  get shouldLabelFloat(): boolean {
    // Since the panel doesn't overlap the trigger, we
    // want the label to only float when there's a value.
    return this.panelOpen || !this.empty || (this.focused && !!this.placeholder);
  }
}

/**
 * Allows the user to customize the trigger that is displayed when the select has a value.
 */
@Directive({
  selector: 'mat-select-trigger',
  providers: [{provide: MAT_SELECT_TRIGGER, useExisting: MatSelectTrigger}],
})
export class MatSelectTrigger {}
