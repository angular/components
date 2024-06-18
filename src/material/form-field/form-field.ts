/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directionality} from '@angular/cdk/bidi';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {DOCUMENT, NgTemplateOutlet} from '@angular/common';
import {Platform, _getShadowRoot} from '@angular/cdk/platform';
import {
  ANIMATION_MODULE_TYPE,
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  Inject,
  InjectionToken,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  afterRender,
  inject,
} from '@angular/core';
import {AbstractControlDirective} from '@angular/forms';
import {ThemePalette} from '@angular/material/core';
import {Subject, merge} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MAT_ERROR, MatError} from './directives/error';
import {
  FLOATING_LABEL_PARENT,
  FloatingLabelParent,
  MatFormFieldFloatingLabel,
} from './directives/floating-label';
import {MatHint} from './directives/hint';
import {MatLabel} from './directives/label';
import {MatFormFieldLineRipple} from './directives/line-ripple';
import {MatFormFieldNotchedOutline} from './directives/notched-outline';
import {MAT_PREFIX, MatPrefix} from './directives/prefix';
import {MAT_SUFFIX, MatSuffix} from './directives/suffix';
import {matFormFieldAnimations} from './form-field-animations';
import {MatFormFieldControl as _MatFormFieldControl} from './form-field-control';
import {
  getMatFormFieldDuplicatedHintError,
  getMatFormFieldMissingControlError,
} from './form-field-errors';

/** Type for the available floatLabel values. */
export type FloatLabelType = 'always' | 'auto';

/** Possible appearance styles for the form field. */
export type MatFormFieldAppearance = 'fill' | 'outline';

/** Behaviors for how the subscript height is set. */
export type SubscriptSizing = 'fixed' | 'dynamic';

/**
 * Represents the default options for the form field that can be configured
 * using the `MAT_FORM_FIELD_DEFAULT_OPTIONS` injection token.
 */
export interface MatFormFieldDefaultOptions {
  /** Default form field appearance style. */
  appearance?: MatFormFieldAppearance;
  /**
   * Default color of the form field. This API is supported in M2 themes only, it has no effect in
   * M3 themes. For information on applying color variants in M3, see
   * https://material.angular.io/guide/theming#using-component-color-variants
   */
  color?: ThemePalette;
  /** Whether the required marker should be hidden by default. */
  hideRequiredMarker?: boolean;
  /**
   * Whether the label for form fields should by default float `always`,
   * `never`, or `auto` (only when necessary).
   */
  floatLabel?: FloatLabelType;
  /** Whether the form field should reserve space for one line by default. */
  subscriptSizing?: SubscriptSizing;
}

/**
 * Injection token that can be used to inject an instances of `MatFormField`. It serves
 * as alternative token to the actual `MatFormField` class which would cause unnecessary
 * retention of the `MatFormField` class and its component metadata.
 */
export const MAT_FORM_FIELD = new InjectionToken<MatFormField>('MatFormField');

/**
 * Injection token that can be used to configure the
 * default options for all form field within an app.
 */
export const MAT_FORM_FIELD_DEFAULT_OPTIONS = new InjectionToken<MatFormFieldDefaultOptions>(
  'MAT_FORM_FIELD_DEFAULT_OPTIONS',
);

let nextUniqueId = 0;

/** Default appearance used by the form field. */
const DEFAULT_APPEARANCE: MatFormFieldAppearance = 'fill';

/**
 * Whether the label for form fields should by default float `always`,
 * `never`, or `auto`.
 */
const DEFAULT_FLOAT_LABEL: FloatLabelType = 'auto';

/** Default way that the subscript element height is set. */
const DEFAULT_SUBSCRIPT_SIZING: SubscriptSizing = 'fixed';

/**
 * Default transform for docked floating labels in a MDC text-field. This value has been
 * extracted from the MDC text-field styles because we programmatically modify the docked
 * label transform, but do not want to accidentally discard the default label transform.
 */
const FLOATING_LABEL_DEFAULT_DOCKED_TRANSFORM = `translateY(-50%)`;

/**
 * Despite `MatFormFieldControl` being an abstract class, most of our usages enforce its shape
 * using `implements` instead of `extends`. This appears to be problematic when Closure compiler
 * is configured to use type information to rename properties, because it can't figure out which
 * class properties are coming from. This interface seems to work around the issue while preserving
 * our type safety (alternative being using `any` everywhere).
 * @docs-private
 */
interface MatFormFieldControl<T> extends _MatFormFieldControl<T> {}

/** Container for form controls that applies Material Design styling and behavior. */
@Component({
  selector: 'mat-form-field',
  exportAs: 'matFormField',
  templateUrl: './form-field.html',
  styleUrl: './form-field.css',
  animations: [matFormFieldAnimations.transitionMessages],
  host: {
    'class': 'mat-mdc-form-field',
    '[class.mat-mdc-form-field-label-always-float]': '_shouldAlwaysFloat()',
    '[class.mat-mdc-form-field-has-icon-prefix]': '_hasIconPrefix',
    '[class.mat-mdc-form-field-has-icon-suffix]': '_hasIconSuffix',
    // Note that these classes reuse the same names as the non-MDC version, because they can be
    // considered a public API since custom form controls may use them to style themselves.
    // See https://github.com/angular/components/pull/20502#discussion_r486124901.
    '[class.mat-form-field-invalid]': '_control.errorState',
    '[class.mat-form-field-disabled]': '_control.disabled',
    '[class.mat-form-field-autofilled]': '_control.autofilled',
    '[class.mat-form-field-no-animations]': '_animationMode === "NoopAnimations"',
    '[class.mat-form-field-appearance-fill]': 'appearance == "fill"',
    '[class.mat-form-field-appearance-outline]': 'appearance == "outline"',
    '[class.mat-form-field-hide-placeholder]': '_hasFloatingLabel() && !_shouldLabelFloat()',
    '[class.mat-focused]': '_control.focused',
    '[class.mat-primary]': 'color !== "accent" && color !== "warn"',
    '[class.mat-accent]': 'color === "accent"',
    '[class.mat-warn]': 'color === "warn"',
    '[class.ng-untouched]': '_shouldForward("untouched")',
    '[class.ng-touched]': '_shouldForward("touched")',
    '[class.ng-pristine]': '_shouldForward("pristine")',
    '[class.ng-dirty]': '_shouldForward("dirty")',
    '[class.ng-valid]': '_shouldForward("valid")',
    '[class.ng-invalid]': '_shouldForward("invalid")',
    '[class.ng-pending]': '_shouldForward("pending")',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: MAT_FORM_FIELD, useExisting: MatFormField},
    {provide: FLOATING_LABEL_PARENT, useExisting: MatFormField},
  ],
  standalone: true,
  imports: [
    MatFormFieldFloatingLabel,
    MatFormFieldNotchedOutline,
    NgTemplateOutlet,
    MatFormFieldLineRipple,
    MatHint,
  ],
})
export class MatFormField
  implements FloatingLabelParent, AfterContentInit, AfterContentChecked, AfterViewInit, OnDestroy
{
  @ViewChild('textField') _textField: ElementRef<HTMLElement>;
  @ViewChild('iconPrefixContainer') _iconPrefixContainer: ElementRef<HTMLElement>;
  @ViewChild('textPrefixContainer') _textPrefixContainer: ElementRef<HTMLElement>;
  @ViewChild(MatFormFieldFloatingLabel) _floatingLabel: MatFormFieldFloatingLabel | undefined;
  @ViewChild(MatFormFieldNotchedOutline) _notchedOutline: MatFormFieldNotchedOutline | undefined;
  @ViewChild(MatFormFieldLineRipple) _lineRipple: MatFormFieldLineRipple | undefined;

  @ContentChild(MatLabel) _labelChildNonStatic: MatLabel | undefined;
  @ContentChild(MatLabel, {static: true}) _labelChildStatic: MatLabel | undefined;
  @ContentChild(_MatFormFieldControl) _formFieldControl: MatFormFieldControl<any>;
  @ContentChildren(MAT_PREFIX, {descendants: true}) _prefixChildren: QueryList<MatPrefix>;
  @ContentChildren(MAT_SUFFIX, {descendants: true}) _suffixChildren: QueryList<MatSuffix>;
  @ContentChildren(MAT_ERROR, {descendants: true}) _errorChildren: QueryList<MatError>;
  @ContentChildren(MatHint, {descendants: true}) _hintChildren: QueryList<MatHint>;

  /** Whether the required marker should be hidden. */
  @Input()
  get hideRequiredMarker(): boolean {
    return this._hideRequiredMarker;
  }
  set hideRequiredMarker(value: BooleanInput) {
    this._hideRequiredMarker = coerceBooleanProperty(value);
  }
  private _hideRequiredMarker = false;

  /**
   * Theme color of the form field. This API is supported in M2 themes only, it
   * has no effect in M3 themes.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.io/guide/theming#using-component-color-variants.
   */
  @Input() color: ThemePalette = 'primary';

  /** Whether the label should always float or float as the user types. */
  @Input()
  get floatLabel(): FloatLabelType {
    return this._floatLabel || this._defaults?.floatLabel || DEFAULT_FLOAT_LABEL;
  }
  set floatLabel(value: FloatLabelType) {
    if (value !== this._floatLabel) {
      this._floatLabel = value;
      // For backwards compatibility. Custom form field controls or directives might set
      // the "floatLabel" input and expect the form field view to be updated automatically.
      // e.g. autocomplete trigger. Ideally we'd get rid of this and the consumers would just
      // emit the "stateChanges" observable. TODO(devversion): consider removing.
      this._changeDetectorRef.markForCheck();
    }
  }
  private _floatLabel: FloatLabelType;

  /** The form field appearance style. */
  @Input()
  get appearance(): MatFormFieldAppearance {
    return this._appearance;
  }
  set appearance(value: MatFormFieldAppearance) {
    const oldValue = this._appearance;
    const newAppearance = value || this._defaults?.appearance || DEFAULT_APPEARANCE;
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (newAppearance !== 'fill' && newAppearance !== 'outline') {
        throw new Error(
          `MatFormField: Invalid appearance "${newAppearance}", valid values are "fill" or "outline".`,
        );
      }
    }
    this._appearance = newAppearance;
    if (this._appearance === 'outline' && this._appearance !== oldValue) {
      // If the appearance has been switched to `outline`, the label offset needs to be updated.
      // The update can happen once the view has been re-checked, but not immediately because
      // the view has not been updated and the notched-outline floating label is not present.
      this._needsOutlineLabelOffsetUpdate = true;
    }
  }
  private _appearance: MatFormFieldAppearance = DEFAULT_APPEARANCE;

  /**
   * Whether the form field should reserve space for one line of hint/error text (default)
   * or to have the spacing grow from 0px as needed based on the size of the hint/error content.
   * Note that when using dynamic sizing, layout shifts will occur when hint/error text changes.
   */
  @Input()
  get subscriptSizing(): SubscriptSizing {
    return this._subscriptSizing || this._defaults?.subscriptSizing || DEFAULT_SUBSCRIPT_SIZING;
  }
  set subscriptSizing(value: SubscriptSizing) {
    this._subscriptSizing = value || this._defaults?.subscriptSizing || DEFAULT_SUBSCRIPT_SIZING;
  }
  private _subscriptSizing: SubscriptSizing | null = null;

  /** Text for the form field hint. */
  @Input()
  get hintLabel(): string {
    return this._hintLabel;
  }
  set hintLabel(value: string) {
    this._hintLabel = value;
    this._processHints();
  }
  private _hintLabel = '';

  _hasIconPrefix = false;
  _hasTextPrefix = false;
  _hasIconSuffix = false;
  _hasTextSuffix = false;

  // Unique id for the internal form field label.
  readonly _labelId = `mat-mdc-form-field-label-${nextUniqueId++}`;

  // Unique id for the hint label.
  readonly _hintLabelId = `mat-mdc-hint-${nextUniqueId++}`;

  /** State of the mat-hint and mat-error animations. */
  _subscriptAnimationState = '';

  /** Gets the current form field control */
  get _control(): MatFormFieldControl<any> {
    return this._explicitFormFieldControl || this._formFieldControl;
  }
  set _control(value) {
    this._explicitFormFieldControl = value;
  }

  private _destroyed = new Subject<void>();
  private _isFocused: boolean | null = null;
  private _explicitFormFieldControl: MatFormFieldControl<any>;
  private _needsOutlineLabelOffsetUpdate = false;

  /**
   * Cached shadow root that the element is placed in. `null` means that the element isn't in
   * the shadow DOM and `undefined` means that it hasn't been resolved yet. Should be read via
   * `_getShadowRoot`, not directly.
   */
  private _cachedShadowRoot: ShadowRoot | null | undefined;

  private _injector = inject(Injector);

  constructor(
    public _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    /**
     * @deprecated not needed, to be removed.
     * @breaking-change 19.0.0 remove this param
     */
    _unusedNgZone: NgZone,
    private _dir: Directionality,
    private _platform: Platform,
    @Optional()
    @Inject(MAT_FORM_FIELD_DEFAULT_OPTIONS)
    private _defaults?: MatFormFieldDefaultOptions,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string,
    /**
     * @deprecated not needed, to be removed.
     * @breaking-change 17.0.0 remove this param
     */
    @Inject(DOCUMENT) _unusedDocument?: any,
  ) {
    if (_defaults) {
      if (_defaults.appearance) {
        this.appearance = _defaults.appearance;
      }
      this._hideRequiredMarker = Boolean(_defaults?.hideRequiredMarker);
      if (_defaults.color) {
        this.color = _defaults.color;
      }
    }
  }

  ngAfterViewInit() {
    // Initial focus state sync. This happens rarely, but we want to account for
    // it in case the form field control has "focused" set to true on init.
    this._updateFocusState();
    // Enable animations now. This ensures we don't animate on initial render.
    this._subscriptAnimationState = 'enter';
    // Because the above changes a value used in the template after it was checked, we need
    // to trigger CD or the change might not be reflected if there is no other CD scheduled.
    this._changeDetectorRef.detectChanges();
  }

  ngAfterContentInit() {
    this._assertFormFieldControl();
    this._initializeControl();
    this._initializeSubscript();
    this._initializePrefixAndSuffix();
    this._initializeOutlineLabelOffsetSubscriptions();
  }

  ngAfterContentChecked() {
    this._assertFormFieldControl();
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * Gets the id of the label element. If no label is present, returns `null`.
   */
  getLabelId(): string | null {
    return this._hasFloatingLabel() ? this._labelId : null;
  }

  /**
   * Gets an ElementRef for the element that a overlay attached to the form field
   * should be positioned relative to.
   */
  getConnectedOverlayOrigin(): ElementRef {
    return this._textField || this._elementRef;
  }

  /** Animates the placeholder up and locks it in position. */
  _animateAndLockLabel(): void {
    // This is for backwards compatibility only. Consumers of the form field might use
    // this method. e.g. the autocomplete trigger. This method has been added to the non-MDC
    // form field because setting "floatLabel" to "always" caused the label to float without
    // animation. This is different in MDC where the label always animates, so this method
    // is no longer necessary. There doesn't seem any benefit in adding logic to allow changing
    // the floating label state without animations. The non-MDC implementation was inconsistent
    // because it always animates if "floatLabel" is set away from "always".
    // TODO(devversion): consider removing this method when releasing the MDC form field.
    if (this._hasFloatingLabel()) {
      this.floatLabel = 'always';
    }
  }

  /** Initializes the registered form field control. */
  private _initializeControl() {
    const control = this._control;

    if (control.controlType) {
      this._elementRef.nativeElement.classList.add(
        `mat-mdc-form-field-type-${control.controlType}`,
      );
    }

    // Subscribe to changes in the child control state in order to update the form field UI.
    control.stateChanges.subscribe(() => {
      this._updateFocusState();
      this._syncDescribedByIds();
      this._changeDetectorRef.markForCheck();
    });

    // Run change detection if the value changes.
    if (control.ngControl && control.ngControl.valueChanges) {
      control.ngControl.valueChanges
        .pipe(takeUntil(this._destroyed))
        .subscribe(() => this._changeDetectorRef.markForCheck());
    }
  }

  private _checkPrefixAndSuffixTypes() {
    this._hasIconPrefix = !!this._prefixChildren.find(p => !p._isText);
    this._hasTextPrefix = !!this._prefixChildren.find(p => p._isText);
    this._hasIconSuffix = !!this._suffixChildren.find(s => !s._isText);
    this._hasTextSuffix = !!this._suffixChildren.find(s => s._isText);
  }

  /** Initializes the prefix and suffix containers. */
  private _initializePrefixAndSuffix() {
    this._checkPrefixAndSuffixTypes();
    // Mark the form field as dirty whenever the prefix or suffix children change. This
    // is necessary because we conditionally display the prefix/suffix containers based
    // on whether there is projected content.
    merge(this._prefixChildren.changes, this._suffixChildren.changes).subscribe(() => {
      this._checkPrefixAndSuffixTypes();
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Initializes the subscript by validating hints and synchronizing "aria-describedby" ids
   * with the custom form field control. Also subscribes to hint and error changes in order
   * to be able to validate and synchronize ids on change.
   */
  private _initializeSubscript() {
    // Re-validate when the number of hints changes.
    this._hintChildren.changes.subscribe(() => {
      this._processHints();
      this._changeDetectorRef.markForCheck();
    });

    // Update the aria-described by when the number of errors changes.
    this._errorChildren.changes.subscribe(() => {
      this._syncDescribedByIds();
      this._changeDetectorRef.markForCheck();
    });

    // Initial mat-hint validation and subscript describedByIds sync.
    this._validateHints();
    this._syncDescribedByIds();
  }

  /** Throws an error if the form field's control is missing. */
  private _assertFormFieldControl() {
    if (!this._control && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw getMatFormFieldMissingControlError();
    }
  }

  private _updateFocusState() {
    // Usually the MDC foundation would call "activateFocus" and "deactivateFocus" whenever
    // certain DOM events are emitted. This is not possible in our implementation of the
    // form field because we support abstract form field controls which are not necessarily
    // of type input, nor do we have a reference to a native form field control element. Instead
    // we handle the focus by checking if the abstract form field control focused state changes.
    if (this._control.focused && !this._isFocused) {
      this._isFocused = true;
      this._lineRipple?.activate();
    } else if (!this._control.focused && (this._isFocused || this._isFocused === null)) {
      this._isFocused = false;
      this._lineRipple?.deactivate();
    }

    this._textField?.nativeElement.classList.toggle(
      'mdc-text-field--focused',
      this._control.focused,
    );
  }

  /**
   * The floating label in the docked state needs to account for prefixes. The horizontal offset
   * is calculated whenever the appearance changes to `outline`, the prefixes change, or when the
   * form field is added to the DOM. This method sets up all subscriptions which are needed to
   * trigger the label offset update.
   */
  private _initializeOutlineLabelOffsetSubscriptions() {
    // Whenever the prefix changes, schedule an update of the label offset.
    // TODO(mmalerba): Use ResizeObserver to better support dynamically changing prefix content.
    this._prefixChildren.changes.subscribe(() => (this._needsOutlineLabelOffsetUpdate = true));

    // TODO(mmalerba): Split this into separate `afterRender` calls using the `EarlyRead` and
    //  `Write` phases.
    afterRender(
      () => {
        if (this._needsOutlineLabelOffsetUpdate) {
          this._needsOutlineLabelOffsetUpdate = false;
          this._updateOutlineLabelOffset();
        }
      },
      {
        injector: this._injector,
      },
    );

    this._dir.change
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => (this._needsOutlineLabelOffsetUpdate = true));
  }

  /** Whether the floating label should always float or not. */
  _shouldAlwaysFloat() {
    return this.floatLabel === 'always';
  }

  _hasOutline() {
    return this.appearance === 'outline';
  }

  /**
   * Whether the label should display in the infix. Labels in the outline appearance are
   * displayed as part of the notched-outline and are horizontally offset to account for
   * form field prefix content. This won't work in server side rendering since we cannot
   * measure the width of the prefix container. To make the docked label appear as if the
   * right offset has been calculated, we forcibly render the label inside the infix. Since
   * the label is part of the infix, the label cannot overflow the prefix content.
   */
  _forceDisplayInfixLabel() {
    return !this._platform.isBrowser && this._prefixChildren.length && !this._shouldLabelFloat();
  }

  _hasFloatingLabel() {
    return !!this._labelChildNonStatic || !!this._labelChildStatic;
  }

  _shouldLabelFloat() {
    return this._control.shouldLabelFloat || this._shouldAlwaysFloat();
  }

  /**
   * Determines whether a class from the AbstractControlDirective
   * should be forwarded to the host element.
   */
  _shouldForward(prop: keyof AbstractControlDirective): boolean {
    const control = this._control ? this._control.ngControl : null;
    return control && control[prop];
  }

  /** Determines whether to display hints or errors. */
  _getDisplayedMessages(): 'error' | 'hint' {
    return this._errorChildren && this._errorChildren.length > 0 && this._control.errorState
      ? 'error'
      : 'hint';
  }

  /** Handle label resize events. */
  _handleLabelResized() {
    this._refreshOutlineNotchWidth();
  }

  /** Refreshes the width of the outline-notch, if present. */
  _refreshOutlineNotchWidth() {
    if (!this._hasOutline() || !this._floatingLabel || !this._shouldLabelFloat()) {
      this._notchedOutline?._setNotchWidth(0);
    } else {
      this._notchedOutline?._setNotchWidth(this._floatingLabel.getWidth());
    }
  }

  /** Does any extra processing that is required when handling the hints. */
  private _processHints() {
    this._validateHints();
    this._syncDescribedByIds();
  }

  /**
   * Ensure that there is a maximum of one of each "mat-hint" alignment specified. The hint
   * label specified set through the input is being considered as "start" aligned.
   *
   * This method is a noop if Angular runs in production mode.
   */
  private _validateHints() {
    if (this._hintChildren && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      let startHint: MatHint;
      let endHint: MatHint;
      this._hintChildren.forEach((hint: MatHint) => {
        if (hint.align === 'start') {
          if (startHint || this.hintLabel) {
            throw getMatFormFieldDuplicatedHintError('start');
          }
          startHint = hint;
        } else if (hint.align === 'end') {
          if (endHint) {
            throw getMatFormFieldDuplicatedHintError('end');
          }
          endHint = hint;
        }
      });
    }
  }

  /**
   * Sets the list of element IDs that describe the child control. This allows the control to update
   * its `aria-describedby` attribute accordingly.
   */
  private _syncDescribedByIds() {
    if (this._control) {
      let ids: string[] = [];

      // TODO(wagnermaciel): Remove the type check when we find the root cause of this bug.
      if (
        this._control.userAriaDescribedBy &&
        typeof this._control.userAriaDescribedBy === 'string'
      ) {
        ids.push(...this._control.userAriaDescribedBy.split(' '));
      }

      if (this._getDisplayedMessages() === 'hint') {
        const startHint = this._hintChildren
          ? this._hintChildren.find(hint => hint.align === 'start')
          : null;
        const endHint = this._hintChildren
          ? this._hintChildren.find(hint => hint.align === 'end')
          : null;

        if (startHint) {
          ids.push(startHint.id);
        } else if (this._hintLabel) {
          ids.push(this._hintLabelId);
        }

        if (endHint) {
          ids.push(endHint.id);
        }
      } else if (this._errorChildren) {
        ids.push(...this._errorChildren.map(error => error.id));
      }

      this._control.setDescribedByIds(ids);
    }
  }

  /**
   * Updates the horizontal offset of the label in the outline appearance. In the outline
   * appearance, the notched-outline and label are not relative to the infix container because
   * the outline intends to surround prefixes, suffixes and the infix. This means that the
   * floating label by default overlaps prefixes in the docked state. To avoid this, we need to
   * horizontally offset the label by the width of the prefix container. The MDC text-field does
   * not need to do this because they use a fixed width for prefixes. Hence, they can simply
   * incorporate the horizontal offset into their default text-field styles.
   */
  private _updateOutlineLabelOffset() {
    if (!this._hasOutline() || !this._floatingLabel) {
      return;
    }
    const floatingLabel = this._floatingLabel.element;
    // If no prefix is displayed, reset the outline label offset from potential
    // previous label offset updates.
    if (!(this._iconPrefixContainer || this._textPrefixContainer)) {
      floatingLabel.style.transform = '';
      return;
    }
    // If the form field is not attached to the DOM yet (e.g. in a tab), we defer
    // the label offset update until the zone stabilizes.
    if (!this._isAttachedToDom()) {
      this._needsOutlineLabelOffsetUpdate = true;
      return;
    }
    const iconPrefixContainer = this._iconPrefixContainer?.nativeElement;
    const textPrefixContainer = this._textPrefixContainer?.nativeElement;
    const iconPrefixContainerWidth = iconPrefixContainer?.getBoundingClientRect().width ?? 0;
    const textPrefixContainerWidth = textPrefixContainer?.getBoundingClientRect().width ?? 0;
    // If the directionality is RTL, the x-axis transform needs to be inverted. This
    // is because `transformX` does not change based on the page directionality.
    const negate = this._dir.value === 'rtl' ? '-1' : '1';
    const prefixWidth = `${iconPrefixContainerWidth + textPrefixContainerWidth}px`;
    const labelOffset = `var(--mat-mdc-form-field-label-offset-x, 0px)`;
    const labelHorizontalOffset = `calc(${negate} * (${prefixWidth} + ${labelOffset}))`;

    // Update the translateX of the floating label to account for the prefix container,
    // but allow the CSS to override this setting via a CSS variable when the label is
    // floating.
    floatingLabel.style.transform = `var(
        --mat-mdc-form-field-label-transform,
        ${FLOATING_LABEL_DEFAULT_DOCKED_TRANSFORM} translateX(${labelHorizontalOffset})
    )`;
  }

  /** Checks whether the form field is attached to the DOM. */
  private _isAttachedToDom(): boolean {
    const element: HTMLElement = this._elementRef.nativeElement;
    const rootNode = element.getRootNode();
    // If the element is inside the DOM the root node will be either the document,
    // the closest shadow root or an element that is not yet rendered, otherwise it'll be the element itself.
    return (
      rootNode &&
      rootNode !== element &&
      // If the rootNode is the document we need to make sure that the element is visible
      ((rootNode === document && element.offsetParent !== null) ||
        rootNode === this._getShadowRoot())
    );
  }

  /**
   * Lazily resolves and returns the shadow root of the element. We do this in a function, rather
   * than saving it in property directly on init, because we want to resolve it as late as possible
   * in order to ensure that the element has been moved into the shadow DOM. Doing it inside the
   * constructor might be too early if the element is inside of something like `ngFor` or `ngIf`.
   */
  private _getShadowRoot(): ShadowRoot | null {
    if (this._cachedShadowRoot === undefined) {
      this._cachedShadowRoot = _getShadowRoot(this._elementRef.nativeElement);
    }

    return this._cachedShadowRoot;
  }
}
