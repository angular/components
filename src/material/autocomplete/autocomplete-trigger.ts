/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {addAriaReferencedId, removeAriaReferencedId} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {DOWN_ARROW, ENTER, ESCAPE, TAB, UP_ARROW, hasModifierKey} from '@angular/cdk/keycodes';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayRef,
  PositionStrategy,
  ScrollStrategy,
} from '@angular/cdk/overlay';
import {_getEventTarget} from '@angular/cdk/platform';
import {TemplatePortal} from '@angular/cdk/portal';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {DOCUMENT} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Host,
  Inject,
  InjectionToken,
  Injector,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Optional,
  SimpleChanges,
  ViewContainerRef,
  afterNextRender,
  booleanAttribute,
  forwardRef,
  inject,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {
  MatOption,
  MatOptionSelectionChange,
  _countGroupLabelsBeforeOption,
  _getOptionScrollPosition,
} from '@angular/material/core';
import {MAT_FORM_FIELD, MatFormField} from '@angular/material/form-field';
import {Observable, Subject, Subscription, defer, fromEvent, merge, of as observableOf} from 'rxjs';
import {delay, filter, map, startWith, switchMap, take, tap} from 'rxjs/operators';
import {
  MAT_AUTOCOMPLETE_DEFAULT_OPTIONS,
  MatAutocomplete,
  MatAutocompleteDefaultOptions,
} from './autocomplete';
import {MatAutocompleteOrigin} from './autocomplete-origin';

/**
 * Provider that allows the autocomplete to register as a ControlValueAccessor.
 * @docs-private
 */
export const MAT_AUTOCOMPLETE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatAutocompleteTrigger),
  multi: true,
};

/**
 * Creates an error to be thrown when attempting to use an autocomplete trigger without a panel.
 * @docs-private
 */
export function getMatAutocompleteMissingPanelError(): Error {
  return Error(
    'Attempting to open an undefined instance of `mat-autocomplete`. ' +
      'Make sure that the id passed to the `matAutocomplete` is correct and that ' +
      "you're attempting to open it after the ngAfterContentInit hook.",
  );
}

/** Injection token that determines the scroll handling while the autocomplete panel is open. */
export const MAT_AUTOCOMPLETE_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
  'mat-autocomplete-scroll-strategy',
  {
    providedIn: 'root',
    factory: () => {
      const overlay = inject(Overlay);
      return () => overlay.scrollStrategies.reposition();
    },
  },
);

/** @docs-private */
export function MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER = {
  provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY,
};

/** Base class with all of the `MatAutocompleteTrigger` functionality. */
@Directive({
  selector: `input[matAutocomplete], textarea[matAutocomplete]`,
  host: {
    'class': 'mat-mdc-autocomplete-trigger',
    '[attr.autocomplete]': 'autocompleteAttribute',
    '[attr.role]': 'autocompleteDisabled ? null : "combobox"',
    '[attr.aria-autocomplete]': 'autocompleteDisabled ? null : "list"',
    '[attr.aria-activedescendant]': '(panelOpen && activeOption) ? activeOption.id : null',
    '[attr.aria-expanded]': 'autocompleteDisabled ? null : panelOpen.toString()',
    '[attr.aria-controls]': '(autocompleteDisabled || !panelOpen) ? null : autocomplete?.id',
    '[attr.aria-haspopup]': 'autocompleteDisabled ? null : "listbox"',
    // Note: we use `focusin`, as opposed to `focus`, in order to open the panel
    // a little earlier. This avoids issues where IE delays the focusing of the input.
    '(focusin)': '_handleFocus()',
    '(blur)': '_onTouched()',
    '(input)': '_handleInput($event)',
    '(keydown)': '_handleKeydown($event)',
    '(click)': '_handleClick()',
  },
  exportAs: 'matAutocompleteTrigger',
  providers: [MAT_AUTOCOMPLETE_VALUE_ACCESSOR],
  standalone: true,
})
export class MatAutocompleteTrigger
  implements ControlValueAccessor, AfterViewInit, OnChanges, OnDestroy
{
  private _overlayRef: OverlayRef | null;
  private _portal: TemplatePortal;
  private _componentDestroyed = false;
  private _scrollStrategy: () => ScrollStrategy;
  private _keydownSubscription: Subscription | null;
  private _outsideClickSubscription: Subscription | null;

  /** Old value of the native input. Used to work around issues with the `input` event on IE. */
  private _previousValue: string | number | null;

  /** Value of the input element when the panel was attached (even if there are no options). */
  private _valueOnAttach: string | number | null;

  /** Value on the previous keydown event. */
  private _valueOnLastKeydown: string | null;

  /** Strategy that is used to position the panel. */
  private _positionStrategy: FlexibleConnectedPositionStrategy;

  /** Whether or not the label state is being overridden. */
  private _manuallyFloatingLabel = false;

  /** The subscription for closing actions (some are bound to document). */
  private _closingActionsSubscription: Subscription;

  /** Subscription to viewport size changes. */
  private _viewportSubscription = Subscription.EMPTY;

  /** Implements BreakpointObserver to be used to detect handset landscape */
  private _breakpointObserver = inject(BreakpointObserver);
  private _handsetLandscapeSubscription = Subscription.EMPTY;

  /**
   * Whether the autocomplete can open the next time it is focused. Used to prevent a focused,
   * closed autocomplete from being reopened if the user switches to another browser tab and then
   * comes back.
   */
  private _canOpenOnNextFocus = true;

  /** Value inside the input before we auto-selected an option. */
  private _valueBeforeAutoSelection: string | undefined;

  /**
   * Current option that we have auto-selected as the user is navigating,
   * but which hasn't been propagated to the model value yet.
   */
  private _pendingAutoselectedOption: MatOption | null;

  /** Stream of keyboard events that can close the panel. */
  private readonly _closeKeyEventStream = new Subject<void>();

  /**
   * Event handler for when the window is blurred. Needs to be an
   * arrow function in order to preserve the context.
   */
  private _windowBlurHandler = () => {
    // If the user blurred the window while the autocomplete is focused, it means that it'll be
    // refocused when they come back. In this case we want to skip the first focus event, if the
    // pane was closed, in order to avoid reopening it unintentionally.
    this._canOpenOnNextFocus =
      this._document.activeElement !== this._element.nativeElement || this.panelOpen;
  };

  /** `View -> model callback called when value changes` */
  _onChange: (value: any) => void = () => {};

  /** `View -> model callback called when autocomplete has been touched` */
  _onTouched = () => {};

  /** The autocomplete panel to be attached to this trigger. */
  @Input('matAutocomplete') autocomplete: MatAutocomplete;

  /**
   * Position of the autocomplete panel relative to the trigger element. A position of `auto`
   * will render the panel underneath the trigger if there is enough space for it to fit in
   * the viewport, otherwise the panel will be shown above it. If the position is set to
   * `above` or `below`, the panel will always be shown above or below the trigger. no matter
   * whether it fits completely in the viewport.
   */
  @Input('matAutocompletePosition') position: 'auto' | 'above' | 'below' = 'auto';

  /**
   * Reference relative to which to position the autocomplete panel.
   * Defaults to the autocomplete trigger element.
   */
  @Input('matAutocompleteConnectedTo') connectedTo: MatAutocompleteOrigin;

  /**
   * `autocomplete` attribute to be set on the input element.
   * @docs-private
   */
  @Input('autocomplete') autocompleteAttribute: string = 'off';

  /**
   * Whether the autocomplete is disabled. When disabled, the element will
   * act as a regular input and the user won't be able to open the panel.
   */
  @Input({alias: 'matAutocompleteDisabled', transform: booleanAttribute})
  autocompleteDisabled: boolean;

  private _initialized = new Subject();

  private _injector = inject(Injector);

  constructor(
    private _element: ElementRef<HTMLInputElement>,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef,
    private _zone: NgZone,
    private _changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_AUTOCOMPLETE_SCROLL_STRATEGY) scrollStrategy: any,
    @Optional() private _dir: Directionality | null,
    @Optional() @Inject(MAT_FORM_FIELD) @Host() private _formField: MatFormField | null,
    @Optional() @Inject(DOCUMENT) private _document: any,
    private _viewportRuler: ViewportRuler,
    @Optional()
    @Inject(MAT_AUTOCOMPLETE_DEFAULT_OPTIONS)
    private _defaults?: MatAutocompleteDefaultOptions | null,
  ) {
    this._scrollStrategy = scrollStrategy;
  }

  /** Class to apply to the panel when it's above the input. */
  private _aboveClass = 'mat-mdc-autocomplete-panel-above';

  ngAfterViewInit() {
    this._initialized.next();
    this._initialized.complete();

    const window = this._getWindow();

    if (typeof window !== 'undefined') {
      this._zone.runOutsideAngular(() => window.addEventListener('blur', this._windowBlurHandler));
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['position'] && this._positionStrategy) {
      this._setStrategyPositions(this._positionStrategy);

      if (this.panelOpen) {
        this._overlayRef!.updatePosition();
      }
    }
  }

  ngOnDestroy() {
    const window = this._getWindow();

    if (typeof window !== 'undefined') {
      window.removeEventListener('blur', this._windowBlurHandler);
    }

    this._handsetLandscapeSubscription.unsubscribe();
    this._viewportSubscription.unsubscribe();
    this._componentDestroyed = true;
    this._destroyPanel();
    this._closeKeyEventStream.complete();
    this._clearFromModal();
  }

  /** Whether or not the autocomplete panel is open. */
  get panelOpen(): boolean {
    return this._overlayAttached && this.autocomplete.showPanel;
  }
  private _overlayAttached: boolean = false;

  /** Opens the autocomplete suggestion panel. */
  openPanel(): void {
    this._openPanelInternal();
  }

  /** Closes the autocomplete suggestion panel. */
  closePanel(): void {
    this._resetLabel();

    if (!this._overlayAttached) {
      return;
    }

    if (this.panelOpen) {
      // Only emit if the panel was visible.
      // `afterNextRender` always runs outside of the Angular zone, so all the subscriptions from
      // `_subscribeToClosingActions()` are also outside of the Angular zone.
      // We should manually run in Angular zone to update UI after panel closing.
      this._zone.run(() => {
        this.autocomplete.closed.emit();
      });
    }

    // Only reset if this trigger is the latest one that opened the
    // autocomplete since another may have taken it over.
    if (this.autocomplete._latestOpeningTrigger === this) {
      this.autocomplete._isOpen = false;
      this.autocomplete._latestOpeningTrigger = null;
    }

    this._overlayAttached = false;
    this._pendingAutoselectedOption = null;

    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
      this._closingActionsSubscription.unsubscribe();
    }

    this._updatePanelState();

    // Note that in some cases this can end up being called after the component is destroyed.
    // Add a check to ensure that we don't try to run change detection on a destroyed view.
    if (!this._componentDestroyed) {
      // We need to trigger change detection manually, because
      // `fromEvent` doesn't seem to do it at the proper time.
      // This ensures that the label is reset when the
      // user clicks outside.
      this._changeDetectorRef.detectChanges();
    }

    // Remove aria-owns attribute when the autocomplete is no longer visible.
    if (this._trackedModal) {
      removeAriaReferencedId(this._trackedModal, 'aria-owns', this.autocomplete.id);
    }
  }

  /**
   * Updates the position of the autocomplete suggestion panel to ensure that it fits all options
   * within the viewport.
   */
  updatePosition(): void {
    if (this._overlayAttached) {
      this._overlayRef!.updatePosition();
    }
  }

  /**
   * A stream of actions that should close the autocomplete panel, including
   * when an option is selected, on blur, and when TAB is pressed.
   */
  get panelClosingActions(): Observable<MatOptionSelectionChange | null> {
    return merge(
      this.optionSelections,
      this.autocomplete._keyManager.tabOut.pipe(filter(() => this._overlayAttached)),
      this._closeKeyEventStream,
      this._getOutsideClickStream(),
      this._overlayRef
        ? this._overlayRef.detachments().pipe(filter(() => this._overlayAttached))
        : observableOf(),
    ).pipe(
      // Normalize the output so we return a consistent type.
      map(event => (event instanceof MatOptionSelectionChange ? event : null)),
    );
  }

  /** Stream of changes to the selection state of the autocomplete options. */
  readonly optionSelections: Observable<MatOptionSelectionChange> = defer(() => {
    const options = this.autocomplete ? this.autocomplete.options : null;

    if (options) {
      return options.changes.pipe(
        startWith(options),
        switchMap(() => merge(...options.map(option => option.onSelectionChange))),
      );
    }

    // If there are any subscribers before `ngAfterViewInit`, the `autocomplete` will be undefined.
    // Return a stream that we'll replace with the real one once everything is in place.
    return this._initialized.pipe(switchMap(() => this.optionSelections));
  }) as Observable<MatOptionSelectionChange>;

  /** The currently active option, coerced to MatOption type. */
  get activeOption(): MatOption | null {
    if (this.autocomplete && this.autocomplete._keyManager) {
      return this.autocomplete._keyManager.activeItem;
    }

    return null;
  }

  /** Stream of clicks outside of the autocomplete panel. */
  private _getOutsideClickStream(): Observable<any> {
    return merge(
      fromEvent(this._document, 'click') as Observable<MouseEvent>,
      fromEvent(this._document, 'auxclick') as Observable<MouseEvent>,
      fromEvent(this._document, 'touchend') as Observable<TouchEvent>,
    ).pipe(
      filter(event => {
        // If we're in the Shadow DOM, the event target will be the shadow root, so we have to
        // fall back to check the first element in the path of the click event.
        const clickTarget = _getEventTarget<HTMLElement>(event)!;
        const formField = this._formField
          ? this._formField.getConnectedOverlayOrigin().nativeElement
          : null;
        const customOrigin = this.connectedTo ? this.connectedTo.elementRef.nativeElement : null;

        return (
          this._overlayAttached &&
          clickTarget !== this._element.nativeElement &&
          // Normally focus moves inside `mousedown` so this condition will almost always be
          // true. Its main purpose is to handle the case where the input is focused from an
          // outside click which propagates up to the `body` listener within the same sequence
          // and causes the panel to close immediately (see #3106).
          this._document.activeElement !== this._element.nativeElement &&
          (!formField || !formField.contains(clickTarget)) &&
          (!customOrigin || !customOrigin.contains(clickTarget)) &&
          !!this._overlayRef &&
          !this._overlayRef.overlayElement.contains(clickTarget)
        );
      }),
    );
  }

  // Implemented as part of ControlValueAccessor.
  writeValue(value: any): void {
    Promise.resolve(null).then(() => this._assignOptionValue(value));
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: any) => {}): void {
    this._onChange = fn;
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: () => {}) {
    this._onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor.
  setDisabledState(isDisabled: boolean) {
    this._element.nativeElement.disabled = isDisabled;
  }

  _handleKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    const hasModifier = hasModifierKey(event);

    // Prevent the default action on all escape key presses. This is here primarily to bring IE
    // in line with other browsers. By default, pressing escape on IE will cause it to revert
    // the input value to the one that it had on focus, however it won't dispatch any events
    // which means that the model value will be out of sync with the view.
    if (keyCode === ESCAPE && !hasModifier) {
      event.preventDefault();
    }

    this._valueOnLastKeydown = this._element.nativeElement.value;

    if (this.activeOption && keyCode === ENTER && this.panelOpen && !hasModifier) {
      this.activeOption._selectViaInteraction();
      this._resetActiveItem();
      event.preventDefault();
    } else if (this.autocomplete) {
      const prevActiveItem = this.autocomplete._keyManager.activeItem;
      const isArrowKey = keyCode === UP_ARROW || keyCode === DOWN_ARROW;

      if (keyCode === TAB || (isArrowKey && !hasModifier && this.panelOpen)) {
        this.autocomplete._keyManager.onKeydown(event);
      } else if (isArrowKey && this._canOpen()) {
        this._openPanelInternal(this._valueOnLastKeydown);
      }

      if (isArrowKey || this.autocomplete._keyManager.activeItem !== prevActiveItem) {
        this._scrollToOption(this.autocomplete._keyManager.activeItemIndex || 0);

        if (this.autocomplete.autoSelectActiveOption && this.activeOption) {
          if (!this._pendingAutoselectedOption) {
            this._valueBeforeAutoSelection = this._valueOnLastKeydown;
          }

          this._pendingAutoselectedOption = this.activeOption;
          this._assignOptionValue(this.activeOption.value);
        }
      }
    }
  }

  _handleInput(event: KeyboardEvent): void {
    let target = event.target as HTMLInputElement;
    let value: number | string | null = target.value;

    // Based on `NumberValueAccessor` from forms.
    if (target.type === 'number') {
      value = value == '' ? null : parseFloat(value);
    }

    // If the input has a placeholder, IE will fire the `input` event on page load,
    // focus and blur, in addition to when the user actually changed the value. To
    // filter out all of the extra events, we save the value on focus and between
    // `input` events, and we check whether it changed.
    // See: https://connect.microsoft.com/IE/feedback/details/885747/
    if (this._previousValue !== value) {
      this._previousValue = value;
      this._pendingAutoselectedOption = null;

      // If selection is required we don't write to the CVA while the user is typing.
      // At the end of the selection either the user will have picked something
      // or we'll reset the value back to null.
      if (!this.autocomplete || !this.autocomplete.requireSelection) {
        this._onChange(value);
      }

      if (!value) {
        this._clearPreviousSelectedOption(null, false);
      } else if (this.panelOpen && !this.autocomplete.requireSelection) {
        // Note that we don't reset this when `requireSelection` is enabled,
        // because the option will be reset when the panel is closed.
        const selectedOption = this.autocomplete.options?.find(option => option.selected);

        if (selectedOption) {
          const display = this._getDisplayValue(selectedOption.value);

          if (value !== display) {
            selectedOption.deselect(false);
          }
        }
      }

      if (this._canOpen() && this._document.activeElement === event.target) {
        // When the `input` event fires, the input's value will have already changed. This means
        // that if we take the `this._element.nativeElement.value` directly, it'll be one keystroke
        // behind. This can be a problem when the user selects a value, changes a character while
        // the input still has focus and then clicks away (see #28432). To work around it, we
        // capture the value in `keydown` so we can use it here.
        const valueOnAttach = this._valueOnLastKeydown ?? this._element.nativeElement.value;
        this._valueOnLastKeydown = null;
        this._openPanelInternal(valueOnAttach);
      }
    }
  }

  _handleFocus(): void {
    if (!this._canOpenOnNextFocus) {
      this._canOpenOnNextFocus = true;
    } else if (this._canOpen()) {
      this._previousValue = this._element.nativeElement.value;
      this._attachOverlay(this._previousValue);
      this._floatLabel(true);
    }
  }

  _handleClick(): void {
    if (this._canOpen() && !this.panelOpen) {
      this._openPanelInternal();
    }
  }

  /**
   * In "auto" mode, the label will animate down as soon as focus is lost.
   * This causes the value to jump when selecting an option with the mouse.
   * This method manually floats the label until the panel can be closed.
   * @param shouldAnimate Whether the label should be animated when it is floated.
   */
  private _floatLabel(shouldAnimate = false): void {
    if (this._formField && this._formField.floatLabel === 'auto') {
      if (shouldAnimate) {
        this._formField._animateAndLockLabel();
      } else {
        this._formField.floatLabel = 'always';
      }

      this._manuallyFloatingLabel = true;
    }
  }

  /** If the label has been manually elevated, return it to its normal state. */
  private _resetLabel(): void {
    if (this._manuallyFloatingLabel) {
      if (this._formField) {
        this._formField.floatLabel = 'auto';
      }
      this._manuallyFloatingLabel = false;
    }
  }

  /**
   * This method listens to a stream of panel closing actions and resets the
   * stream every time the option list changes.
   */
  private _subscribeToClosingActions(): Subscription {
    const initialRender = new Observable(subscriber => {
      afterNextRender(
        () => {
          subscriber.next();
        },
        {injector: this._injector},
      );
    });
    const optionChanges = this.autocomplete.options.changes.pipe(
      tap(() => this._positionStrategy.reapplyLastPosition()),
      // Defer emitting to the stream until the next tick, because changing
      // bindings in here will cause "changed after checked" errors.
      delay(0),
    );

    // When the options are initially rendered, and when the option list changes...
    return (
      merge(initialRender, optionChanges)
        .pipe(
          // create a new stream of panelClosingActions, replacing any previous streams
          // that were created, and flatten it so our stream only emits closing events...
          switchMap(() =>
            this._zone.run(() => {
              // `afterNextRender` always runs outside of the Angular zone, thus we have to re-enter
              // the Angular zone. This will lead to change detection being called outside of the Angular
              // zone and the `autocomplete.opened` will also emit outside of the Angular.
              const wasOpen = this.panelOpen;
              this._resetActiveItem();
              this._updatePanelState();
              this._changeDetectorRef.detectChanges();

              if (this.panelOpen) {
                this._overlayRef!.updatePosition();
              }

              if (wasOpen !== this.panelOpen) {
                // If the `panelOpen` state changed, we need to make sure to emit the `opened` or
                // `closed` event, because we may not have emitted it. This can happen
                // - if the users opens the panel and there are no options, but the
                //   options come in slightly later or as a result of the value changing,
                // - if the panel is closed after the user entered a string that did not match any
                //   of the available options,
                // - if a valid string is entered after an invalid one.
                if (this.panelOpen) {
                  this._emitOpened();
                } else {
                  this.autocomplete.closed.emit();
                }
              }

              return this.panelClosingActions;
            }),
          ),
          // when the first closing event occurs...
          take(1),
        )
        // set the value, close the panel, and complete.
        .subscribe(event => this._setValueAndClose(event))
    );
  }

  /**
   * Emits the opened event once it's known that the panel will be shown and stores
   * the state of the trigger right before the opening sequence was finished.
   */
  private _emitOpened() {
    this.autocomplete.opened.emit();
  }

  /** Destroys the autocomplete suggestion panel. */
  private _destroyPanel(): void {
    if (this._overlayRef) {
      this.closePanel();
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
  }

  /** Given a value, returns the string that should be shown within the input. */
  private _getDisplayValue<T>(value: T): T | string {
    const autocomplete = this.autocomplete;
    return autocomplete && autocomplete.displayWith ? autocomplete.displayWith(value) : value;
  }

  private _assignOptionValue(value: any): void {
    const toDisplay = this._getDisplayValue(value);

    if (value == null) {
      this._clearPreviousSelectedOption(null, false);
    }

    // Simply falling back to an empty string if the display value is falsy does not work properly.
    // The display value can also be the number zero and shouldn't fall back to an empty string.
    this._updateNativeInputValue(toDisplay != null ? toDisplay : '');
  }

  private _updateNativeInputValue(value: string): void {
    // If it's used within a `MatFormField`, we should set it through the property so it can go
    // through change detection.
    if (this._formField) {
      this._formField._control.value = value;
    } else {
      this._element.nativeElement.value = value;
    }

    this._previousValue = value;
  }

  /**
   * This method closes the panel, and if a value is specified, also sets the associated
   * control to that value. It will also mark the control as dirty if this interaction
   * stemmed from the user.
   */
  private _setValueAndClose(event: MatOptionSelectionChange | null): void {
    const panel = this.autocomplete;
    const toSelect = event ? event.source : this._pendingAutoselectedOption;

    if (toSelect) {
      this._clearPreviousSelectedOption(toSelect);
      this._assignOptionValue(toSelect.value);
      // TODO(crisbeto): this should wait until the animation is done, otherwise the value
      // gets reset while the panel is still animating which looks glitchy. It'll likely break
      // some tests to change it at this point.
      this._onChange(toSelect.value);
      panel._emitSelectEvent(toSelect);
      this._element.nativeElement.focus();
    } else if (
      panel.requireSelection &&
      this._element.nativeElement.value !== this._valueOnAttach
    ) {
      this._clearPreviousSelectedOption(null);
      this._assignOptionValue(null);
      // Wait for the animation to finish before clearing the form control value, otherwise
      // the options might change while the animation is running which looks glitchy.
      if (panel._animationDone) {
        panel._animationDone.pipe(take(1)).subscribe(() => this._onChange(null));
      } else {
        this._onChange(null);
      }
    }

    this.closePanel();
  }

  /**
   * Clear any previous selected option and emit a selection change event for this option
   */
  private _clearPreviousSelectedOption(skip: MatOption | null, emitEvent?: boolean) {
    // Null checks are necessary here, because the autocomplete
    // or its options may not have been assigned yet.
    this.autocomplete?.options?.forEach(option => {
      if (option !== skip && option.selected) {
        option.deselect(emitEvent);
      }
    });
  }

  private _openPanelInternal(valueOnAttach = this._element.nativeElement.value) {
    this._attachOverlay(valueOnAttach);
    this._floatLabel();
    // Add aria-owns attribute when the autocomplete becomes visible.
    if (this._trackedModal) {
      const panelId = this.autocomplete.id;
      addAriaReferencedId(this._trackedModal, 'aria-owns', panelId);
    }
  }

  private _attachOverlay(valueOnAttach: string): void {
    if (!this.autocomplete && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw getMatAutocompleteMissingPanelError();
    }

    let overlayRef = this._overlayRef;

    if (!overlayRef) {
      this._portal = new TemplatePortal(this.autocomplete.template, this._viewContainerRef, {
        id: this._formField?.getLabelId(),
      });
      overlayRef = this._overlay.create(this._getOverlayConfig());
      this._overlayRef = overlayRef;
      this._viewportSubscription = this._viewportRuler.change().subscribe(() => {
        if (this.panelOpen && overlayRef) {
          overlayRef.updateSize({width: this._getPanelWidth()});
        }
      });
      // Subscribe to the breakpoint events stream to detect when screen is in
      // handsetLandscape.
      this._handsetLandscapeSubscription = this._breakpointObserver
        .observe(Breakpoints.HandsetLandscape)
        .subscribe(result => {
          const isHandsetLandscape = result.matches;
          // Check if result.matches Breakpoints.HandsetLandscape. Apply HandsetLandscape
          // settings to prevent overlay cutoff in that breakpoint. Fixes b/284148377
          if (isHandsetLandscape) {
            this._positionStrategy
              .withFlexibleDimensions(true)
              .withGrowAfterOpen(true)
              .withViewportMargin(8);
          } else {
            this._positionStrategy
              .withFlexibleDimensions(false)
              .withGrowAfterOpen(false)
              .withViewportMargin(0);
          }
        });
    } else {
      // Update the trigger, panel width and direction, in case anything has changed.
      this._positionStrategy.setOrigin(this._getConnectedElement());
      overlayRef.updateSize({width: this._getPanelWidth()});
    }

    if (overlayRef && !overlayRef.hasAttached()) {
      overlayRef.attach(this._portal);
      this._valueOnAttach = valueOnAttach;
      this._valueOnLastKeydown = null;
      this._closingActionsSubscription = this._subscribeToClosingActions();
    }

    const wasOpen = this.panelOpen;

    this.autocomplete._isOpen = this._overlayAttached = true;
    this.autocomplete._latestOpeningTrigger = this;
    this.autocomplete._setColor(this._formField?.color);
    this._updatePanelState();
    this._applyModalPanelOwnership();

    // We need to do an extra `panelOpen` check in here, because the
    // autocomplete won't be shown if there are no options.
    if (this.panelOpen && wasOpen !== this.panelOpen) {
      this._emitOpened();
    }
  }

  /** Handles keyboard events coming from the overlay panel. */
  private _handlePanelKeydown = (event: KeyboardEvent) => {
    // Close when pressing ESCAPE or ALT + UP_ARROW, based on the a11y guidelines.
    // See: https://www.w3.org/TR/wai-aria-practices-1.1/#textbox-keyboard-interaction
    if (
      (event.keyCode === ESCAPE && !hasModifierKey(event)) ||
      (event.keyCode === UP_ARROW && hasModifierKey(event, 'altKey'))
    ) {
      // If the user had typed something in before we autoselected an option, and they decided
      // to cancel the selection, restore the input value to the one they had typed in.
      if (this._pendingAutoselectedOption) {
        this._updateNativeInputValue(this._valueBeforeAutoSelection ?? '');
        this._pendingAutoselectedOption = null;
      }
      this._closeKeyEventStream.next();
      this._resetActiveItem();
      // We need to stop propagation, otherwise the event will eventually
      // reach the input itself and cause the overlay to be reopened.
      event.stopPropagation();
      event.preventDefault();
    }
  };

  /** Updates the panel's visibility state and any trigger state tied to id. */
  private _updatePanelState() {
    this.autocomplete._setVisibility();

    // Note that here we subscribe and unsubscribe based on the panel's visiblity state,
    // because the act of subscribing will prevent events from reaching other overlays and
    // we don't want to block the events if there are no options.
    if (this.panelOpen) {
      const overlayRef = this._overlayRef!;

      if (!this._keydownSubscription) {
        // Use the `keydownEvents` in order to take advantage of
        // the overlay event targeting provided by the CDK overlay.
        this._keydownSubscription = overlayRef.keydownEvents().subscribe(this._handlePanelKeydown);
      }

      if (!this._outsideClickSubscription) {
        // Subscribe to the pointer events stream so that it doesn't get picked up by other overlays.
        // TODO(crisbeto): we should switch `_getOutsideClickStream` eventually to use this stream,
        // but the behvior isn't exactly the same and it ends up breaking some internal tests.
        this._outsideClickSubscription = overlayRef.outsidePointerEvents().subscribe();
      }
    } else {
      this._keydownSubscription?.unsubscribe();
      this._outsideClickSubscription?.unsubscribe();
      this._keydownSubscription = this._outsideClickSubscription = null;
    }
  }

  private _getOverlayConfig(): OverlayConfig {
    return new OverlayConfig({
      positionStrategy: this._getOverlayPosition(),
      scrollStrategy: this._scrollStrategy(),
      width: this._getPanelWidth(),
      direction: this._dir ?? undefined,
      panelClass: this._defaults?.overlayPanelClass,
    });
  }

  private _getOverlayPosition(): PositionStrategy {
    // Set default Overlay Position
    const strategy = this._overlay
      .position()
      .flexibleConnectedTo(this._getConnectedElement())
      .withFlexibleDimensions(false)
      .withPush(false);

    this._setStrategyPositions(strategy);
    this._positionStrategy = strategy;
    return strategy;
  }

  /** Sets the positions on a position strategy based on the directive's input state. */
  private _setStrategyPositions(positionStrategy: FlexibleConnectedPositionStrategy) {
    // Note that we provide horizontal fallback positions, even though by default the dropdown
    // width matches the input, because consumers can override the width. See #18854.
    const belowPositions: ConnectedPosition[] = [
      {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top'},
      {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'},
    ];

    // The overlay edge connected to the trigger should have squared corners, while
    // the opposite end has rounded corners. We apply a CSS class to swap the
    // border-radius based on the overlay position.
    const panelClass = this._aboveClass;
    const abovePositions: ConnectedPosition[] = [
      {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', panelClass},
      {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', panelClass},
    ];

    let positions: ConnectedPosition[];

    if (this.position === 'above') {
      positions = abovePositions;
    } else if (this.position === 'below') {
      positions = belowPositions;
    } else {
      positions = [...belowPositions, ...abovePositions];
    }

    positionStrategy.withPositions(positions);
  }

  private _getConnectedElement(): ElementRef<HTMLElement> {
    if (this.connectedTo) {
      return this.connectedTo.elementRef;
    }

    return this._formField ? this._formField.getConnectedOverlayOrigin() : this._element;
  }

  private _getPanelWidth(): number | string {
    return this.autocomplete.panelWidth || this._getHostWidth();
  }

  /** Returns the width of the input element, so the panel width can match it. */
  private _getHostWidth(): number {
    return this._getConnectedElement().nativeElement.getBoundingClientRect().width;
  }

  /**
   * Reset the active item to -1. This is so that pressing arrow keys will activate the correct
   * option.
   *
   * If the consumer opted-in to automatically activatating the first option, activate the first
   * *enabled* option.
   */
  private _resetActiveItem(): void {
    const autocomplete = this.autocomplete;

    if (autocomplete.autoActiveFirstOption) {
      // Find the index of the first *enabled* option. Avoid calling `_keyManager.setActiveItem`
      // because it activates the first option that passes the skip predicate, rather than the
      // first *enabled* option.
      let firstEnabledOptionIndex = -1;

      for (let index = 0; index < autocomplete.options.length; index++) {
        const option = autocomplete.options.get(index)!;
        if (!option.disabled) {
          firstEnabledOptionIndex = index;
          break;
        }
      }
      autocomplete._keyManager.setActiveItem(firstEnabledOptionIndex);
    } else {
      autocomplete._keyManager.setActiveItem(-1);
    }
  }

  /** Determines whether the panel can be opened. */
  private _canOpen(): boolean {
    const element = this._element.nativeElement;
    return !element.readOnly && !element.disabled && !this.autocompleteDisabled;
  }

  /** Use defaultView of injected document if available or fallback to global window reference */
  private _getWindow(): Window {
    return this._document?.defaultView || window;
  }

  /** Scrolls to a particular option in the list. */
  private _scrollToOption(index: number): void {
    // Given that we are not actually focusing active options, we must manually adjust scroll
    // to reveal options below the fold. First, we find the offset of the option from the top
    // of the panel. If that offset is below the fold, the new scrollTop will be the offset -
    // the panel height + the option height, so the active option will be just visible at the
    // bottom of the panel. If that offset is above the top of the visible panel, the new scrollTop
    // will become the offset. If that offset is visible within the panel already, the scrollTop is
    // not adjusted.
    const autocomplete = this.autocomplete;
    const labelCount = _countGroupLabelsBeforeOption(
      index,
      autocomplete.options,
      autocomplete.optionGroups,
    );

    if (index === 0 && labelCount === 1) {
      // If we've got one group label before the option and we're at the top option,
      // scroll the list to the top. This is better UX than scrolling the list to the
      // top of the option, because it allows the user to read the top group's label.
      autocomplete._setScrollTop(0);
    } else if (autocomplete.panel) {
      const option = autocomplete.options.toArray()[index];

      if (option) {
        const element = option._getHostElement();
        const newScrollPosition = _getOptionScrollPosition(
          element.offsetTop,
          element.offsetHeight,
          autocomplete._getScrollTop(),
          autocomplete.panel.nativeElement.offsetHeight,
        );

        autocomplete._setScrollTop(newScrollPosition);
      }
    }
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
    const modal = this._element.nativeElement.closest(
      'body > .cdk-overlay-container [aria-modal="true"]',
    );

    if (!modal) {
      // Most commonly, the autocomplete trigger is not inside a modal.
      return;
    }

    const panelId = this.autocomplete.id;

    if (this._trackedModal) {
      removeAriaReferencedId(this._trackedModal, 'aria-owns', panelId);
    }

    addAriaReferencedId(modal, 'aria-owns', panelId);
    this._trackedModal = modal;
  }

  /** Clears the references to the listbox overlay element from the modal it was added to. */
  private _clearFromModal() {
    if (this._trackedModal) {
      const panelId = this.autocomplete.id;

      removeAriaReferencedId(this._trackedModal, 'aria-owns', panelId);
      this._trackedModal = null;
    }
  }
}
