/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  AfterRenderRef,
  ANIMATION_MODULE_TYPE,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  InjectionToken,
  Injector,
  input,
  InputSignal,
  InputSignalWithTransform,
  OnDestroy,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  TemplateRef,
  untracked,
  viewChild,
  viewChildren,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_OPTION_PARENT_COMPONENT,
  MatOption,
  MatOptionParentComponent,
} from '../core';
import {Directionality} from '@angular/cdk/bidi';
import {Overlay, OverlayRef, ScrollStrategy} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {_getEventTarget} from '@angular/cdk/platform';
import {ENTER, ESCAPE, hasModifierKey, TAB} from '@angular/cdk/keycodes';
import {_IdGenerator, ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import type {MatTimepickerInput} from './timepicker-input';
import {
  generateOptions,
  MAT_TIMEPICKER_CONFIG,
  MatTimepickerOption,
  parseInterval,
  validateAdapter,
} from './util';
import {Subscription} from 'rxjs';

/** Event emitted when a value is selected in the timepicker. */
export interface MatTimepickerSelected<D> {
  value: D;
  source: MatTimepicker<D>;
}

/** Injection token used to configure the behavior of the timepicker dropdown while scrolling. */
export const MAT_TIMEPICKER_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
  'MAT_TIMEPICKER_SCROLL_STRATEGY',
  {
    providedIn: 'root',
    factory: () => {
      const overlay = inject(Overlay);
      return () => overlay.scrollStrategies.reposition();
    },
  },
);

/**
 * Renders out a listbox that can be used to select a time of day.
 * Intended to be used together with `MatTimepickerInput`.
 */
@Component({
  selector: 'mat-timepicker',
  exportAs: 'matTimepicker',
  templateUrl: 'timepicker.html',
  styleUrl: 'timepicker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MatOption],
  providers: [
    {
      provide: MAT_OPTION_PARENT_COMPONENT,
      useExisting: MatTimepicker,
    },
  ],
})
export class MatTimepicker<D> implements OnDestroy, MatOptionParentComponent {
  private _overlay = inject(Overlay);
  private _dir = inject(Directionality, {optional: true});
  private _viewContainerRef = inject(ViewContainerRef);
  private _injector = inject(Injector);
  private _defaultConfig = inject(MAT_TIMEPICKER_CONFIG, {optional: true});
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter, {optional: true})!;
  private _dateFormats = inject(MAT_DATE_FORMATS, {optional: true})!;
  private _scrollStrategyFactory = inject(MAT_TIMEPICKER_SCROLL_STRATEGY);
  protected _animationsDisabled =
    inject(ANIMATION_MODULE_TYPE, {optional: true}) === 'NoopAnimations';

  private _isOpen = signal(false);
  private _activeDescendant = signal<string | null>(null);

  private _input = signal<MatTimepickerInput<D> | null>(null);
  private _overlayRef: OverlayRef | null = null;
  private _portal: TemplatePortal<unknown> | null = null;
  private _optionsCacheKey: string | null = null;
  private _localeChanges: Subscription;
  private _onOpenRender: AfterRenderRef | null = null;

  protected _panelTemplate = viewChild.required<TemplateRef<unknown>>('panelTemplate');
  protected _timeOptions: readonly MatTimepickerOption<D>[] = [];
  protected _options = viewChildren(MatOption);

  private _keyManager = new ActiveDescendantKeyManager(this._options, this._injector)
    .withHomeAndEnd(true)
    .withPageUpDown(true)
    .withVerticalOrientation(true);

  /**
   * Interval between each option in the timepicker. The value can either be an amount of
   * seconds (e.g. 90) or a number with a unit (e.g. 45m). Supported units are `s` for seconds,
   * `m` for minutes or `h` for hours.
   */
  readonly interval: InputSignalWithTransform<number | null, number | string | null> = input(
    parseInterval(this._defaultConfig?.interval || null),
    {transform: parseInterval},
  );

  /**
   * Array of pre-defined options that the user can select from, as an alternative to using the
   * `interval` input. An error will be thrown if both `options` and `interval` are specified.
   */
  readonly options: InputSignal<readonly MatTimepickerOption<D>[] | null> = input<
    readonly MatTimepickerOption<D>[] | null
  >(null);

  /** Whether the timepicker is open. */
  readonly isOpen: Signal<boolean> = this._isOpen.asReadonly();

  /** Emits when the user selects a time. */
  readonly selected: OutputEmitterRef<MatTimepickerSelected<D>> = output();

  /** Emits when the timepicker is opened. */
  readonly opened: OutputEmitterRef<void> = output();

  /** Emits when the timepicker is closed. */
  readonly closed: OutputEmitterRef<void> = output();

  /** ID of the active descendant option. */
  readonly activeDescendant: Signal<string | null> = this._activeDescendant.asReadonly();

  /** Unique ID of the timepicker's panel */
  readonly panelId: string = inject(_IdGenerator).getId('mat-timepicker-panel-');

  /** Whether ripples within the timepicker should be disabled. */
  readonly disableRipple: InputSignalWithTransform<boolean, unknown> = input(
    this._defaultConfig?.disableRipple ?? false,
    {
      transform: booleanAttribute,
    },
  );

  /** ARIA label for the timepicker panel. */
  readonly ariaLabel: InputSignal<string | null> = input<string | null>(null, {
    alias: 'aria-label',
  });

  /** ID of the label element for the timepicker panel. */
  readonly ariaLabelledby: InputSignal<string | null> = input<string | null>(null, {
    alias: 'aria-labelledby',
  });

  /** Whether the timepicker is currently disabled. */
  readonly disabled: Signal<boolean> = computed(() => !!this._input()?.disabled());

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      validateAdapter(this._dateAdapter, this._dateFormats);

      effect(() => {
        const options = this.options();
        const interval = this.interval();

        if (options !== null && interval !== null) {
          throw new Error(
            'Cannot specify both the `options` and `interval` inputs at the same time',
          );
        } else if (options?.length === 0) {
          throw new Error('Value of `options` input cannot be an empty array');
        }
      });
    }

    // Since the panel ID is static, we can set it once without having to maintain a host binding.
    const element = inject<ElementRef<HTMLElement>>(ElementRef);
    element.nativeElement.setAttribute('mat-timepicker-panel-id', this.panelId);
    this._handleLocaleChanges();
    this._handleInputStateChanges();
    this._keyManager.change.subscribe(() =>
      this._activeDescendant.set(this._keyManager.activeItem?.id || null),
    );
  }

  /** Opens the timepicker. */
  open(): void {
    const input = this._input();

    if (!input) {
      return;
    }

    // Focus should already be on the input, but this call is in case the timepicker is opened
    // programmatically. We need to call this even if the timepicker is already open, because
    // the user might be clicking the toggle.
    input.focus();

    if (this._isOpen()) {
      return;
    }

    this._isOpen.set(true);
    this._generateOptions();
    const overlayRef = this._getOverlayRef();
    overlayRef.updateSize({width: input.getOverlayOrigin().nativeElement.offsetWidth});
    this._portal ??= new TemplatePortal(this._panelTemplate(), this._viewContainerRef);

    // We need to check this in case `isOpen` was flipped, but change detection hasn't
    // had a chance to run yet. See https://github.com/angular/components/issues/30637
    if (!overlayRef.hasAttached()) {
      overlayRef.attach(this._portal);
    }

    this._onOpenRender?.destroy();
    this._onOpenRender = afterNextRender(
      () => {
        const options = this._options();
        this._syncSelectedState(input.value(), options, options[0]);
        this._onOpenRender = null;
      },
      {injector: this._injector},
    );

    this.opened.emit();
  }

  /** Closes the timepicker. */
  close(): void {
    if (this._isOpen()) {
      this._isOpen.set(false);
      this.closed.emit();

      if (this._animationsDisabled) {
        this._overlayRef?.detach();
      }
    }
  }

  /** Registers an input with the timepicker. */
  registerInput(input: MatTimepickerInput<D>): void {
    const currentInput = this._input();

    if (currentInput && input !== currentInput && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw new Error('MatTimepicker can only be registered with one input at a time');
    }

    this._input.set(input);
  }

  ngOnDestroy(): void {
    this._keyManager.destroy();
    this._localeChanges.unsubscribe();
    this._onOpenRender?.destroy();
    this._overlayRef?.dispose();
  }

  /** Selects a specific time value. */
  protected _selectValue(option: MatOption<D>) {
    this.close();
    this._keyManager.setActiveItem(option);
    this._options().forEach(current => {
      // This is primarily here so we don't show two selected options while animating away.
      if (current !== option) {
        current.deselect(false);
      }
    });
    this.selected.emit({value: option.value, source: this});
    this._input()?.focus();
  }

  /** Gets the value of the `aria-labelledby` attribute. */
  protected _getAriaLabelledby(): string | null {
    if (this.ariaLabel()) {
      return null;
    }
    return this.ariaLabelledby() || this._input()?._getLabelId() || null;
  }

  /** Handles animation events coming from the panel. */
  protected _handleAnimationEnd(event: AnimationEvent) {
    if (event.animationName === '_mat-timepicker-exit') {
      this._overlayRef?.detach();
    }
  }

  /** Creates an overlay reference for the timepicker panel. */
  private _getOverlayRef(): OverlayRef {
    if (this._overlayRef) {
      return this._overlayRef;
    }

    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(this._input()!.getOverlayOrigin())
      .withFlexibleDimensions(false)
      .withPush(false)
      .withTransformOriginOn('.mat-timepicker-panel')
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          panelClass: 'mat-timepicker-above',
        },
      ]);

    this._overlayRef = this._overlay.create({
      positionStrategy,
      scrollStrategy: this._scrollStrategyFactory(),
      direction: this._dir || 'ltr',
      hasBackdrop: false,
    });

    this._overlayRef.detachments().subscribe(() => this.close());
    this._overlayRef.keydownEvents().subscribe(event => this._handleKeydown(event));
    this._overlayRef.outsidePointerEvents().subscribe(event => {
      const target = _getEventTarget(event) as HTMLElement;
      const origin = this._input()?.getOverlayOrigin().nativeElement;

      if (target && origin && target !== origin && !origin.contains(target)) {
        this.close();
      }
    });

    return this._overlayRef;
  }

  /** Generates the list of options from which the user can select.. */
  private _generateOptions(): void {
    // Default the interval to 30 minutes.
    const interval = this.interval() ?? 30 * 60;
    const options = this.options();

    if (options !== null) {
      this._timeOptions = options;
    } else {
      const input = this._input();
      const adapter = this._dateAdapter;
      const timeFormat = this._dateFormats.display.timeInput;
      const min = input?.min() || adapter.setTime(adapter.today(), 0, 0, 0);
      const max = input?.max() || adapter.setTime(adapter.today(), 23, 59, 0);
      const cacheKey =
        interval + '/' + adapter.format(min, timeFormat) + '/' + adapter.format(max, timeFormat);

      // Don't re-generate the options if the inputs haven't changed.
      if (cacheKey !== this._optionsCacheKey) {
        this._optionsCacheKey = cacheKey;
        this._timeOptions = generateOptions(adapter, this._dateFormats, min, max, interval);
      }
    }
  }

  /**
   * Synchronizes the internal state of the component based on a specific selected date.
   * @param value Currently selected date.
   * @param options Options rendered out in the timepicker.
   * @param fallback Option to set as active if no option is selected.
   */
  private _syncSelectedState(
    value: D | null,
    options: readonly MatOption[],
    fallback: MatOption | null,
  ): void {
    let hasSelected = false;

    for (const option of options) {
      if (value && this._dateAdapter.sameTime(option.value, value)) {
        option.select(false);
        scrollOptionIntoView(option, 'center');
        untracked(() => this._keyManager.setActiveItem(option));
        hasSelected = true;
      } else {
        option.deselect(false);
      }
    }

    // If no option was selected, we need to reset the key manager since
    // it might be holding onto an option that no longer exists.
    if (!hasSelected) {
      if (fallback) {
        untracked(() => this._keyManager.setActiveItem(fallback));
        scrollOptionIntoView(fallback, 'center');
      } else {
        untracked(() => this._keyManager.setActiveItem(-1));
      }
    }
  }

  /** Handles keyboard events while the overlay is open. */
  private _handleKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;

    if (keyCode === TAB) {
      this.close();
    } else if (keyCode === ESCAPE && !hasModifierKey(event)) {
      event.preventDefault();
      this.close();
    } else if (keyCode === ENTER) {
      event.preventDefault();

      if (this._keyManager.activeItem) {
        this._selectValue(this._keyManager.activeItem);
      } else {
        this.close();
      }
    } else {
      const previousActive = this._keyManager.activeItem;
      this._keyManager.onKeydown(event);
      const currentActive = this._keyManager.activeItem;

      if (currentActive && currentActive !== previousActive) {
        scrollOptionIntoView(currentActive, 'nearest');
      }
    }
  }

  /** Sets up the logic that updates the timepicker when the locale changes. */
  private _handleLocaleChanges(): void {
    // Re-generate the options list if the locale changes.
    this._localeChanges = this._dateAdapter.localeChanges.subscribe(() => {
      this._optionsCacheKey = null;

      if (this.isOpen()) {
        this._generateOptions();
      }
    });
  }

  /**
   * Sets up the logic that updates the timepicker when the state of the connected input changes.
   */
  private _handleInputStateChanges(): void {
    effect(() => {
      const input = this._input();
      const options = this._options();

      if (this._isOpen() && input) {
        this._syncSelectedState(input.value(), options, null);
      }
    });
  }
}

/**
 * Scrolls an option into view.
 * @param option Option to be scrolled into view.
 * @param position Position to which to align the option relative to the scrollable container.
 */
function scrollOptionIntoView(option: MatOption, position: ScrollLogicalPosition) {
  option._getHostElement().scrollIntoView({block: position, inline: position});
}
