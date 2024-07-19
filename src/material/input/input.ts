/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {getSupportedInputTypes, Platform} from '@angular/cdk/platform';
import {AutofillMonitor} from '@angular/cdk/text-field';
import {
  AfterViewInit,
  Directive,
  DoCheck,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Optional,
  Self,
} from '@angular/core';
import {FormGroupDirective, NgControl, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher, _ErrorStateTracker} from '@angular/material/core';
import {MatFormFieldControl, MatFormField, MAT_FORM_FIELD} from '@angular/material/form-field';
import {Subject} from 'rxjs';
import {getMatInputUnsupportedTypeError} from './input-errors';
import {MAT_INPUT_VALUE_ACCESSOR} from './input-value-accessor';

// Invalid input type. Using one of these will throw an MatInputUnsupportedTypeError.
const MAT_INPUT_INVALID_TYPES = [
  'button',
  'checkbox',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
];

let nextUniqueId = 0;

@Directive({
  selector: `input[matInput], textarea[matInput], select[matNativeControl],
      input[matNativeControl], textarea[matNativeControl]`,
  exportAs: 'matInput',
  host: {
    'class': 'mat-mdc-input-element',
    // The BaseMatInput parent class adds `mat-input-element`, `mat-form-field-control` and
    // `mat-form-field-autofill-control` to the CSS class list, but this should not be added for
    // this MDC equivalent input.
    '[class.mat-input-server]': '_isServer',
    '[class.mat-mdc-form-field-textarea-control]': '_isInFormField && _isTextarea',
    '[class.mat-mdc-form-field-input-control]': '_isInFormField',
    '[class.mdc-text-field__input]': '_isInFormField',
    '[class.mat-mdc-native-select-inline]': '_isInlineSelect()',
    // Native input properties that are overwritten by Angular inputs need to be synced with
    // the native input element. Otherwise property bindings for those don't work.
    '[id]': 'id',
    '[disabled]': 'disabled',
    '[required]': 'required',
    '[attr.name]': 'name || null',
    '[attr.readonly]': 'readonly && !_isNativeSelect || null',
    // Only mark the input as invalid for assistive technology if it has a value since the
    // state usually overlaps with `aria-required` when the input is empty and can be redundant.
    '[attr.aria-invalid]': '(empty && required) ? null : errorState',
    '[attr.aria-required]': 'required',
    // Native input properties that are overwritten by Angular inputs need to be synced with
    // the native input element. Otherwise property bindings for those don't work.
    '[attr.id]': 'id',
    '(focus)': '_focusChanged(true)',
    '(blur)': '_focusChanged(false)',
    '(input)': '_onInput()',
  },
  providers: [{provide: MatFormFieldControl, useExisting: MatInput}],
  standalone: true,
})
export class MatInput
  implements MatFormFieldControl<any>, OnChanges, OnDestroy, AfterViewInit, DoCheck
{
  protected _uid = `mat-input-${nextUniqueId++}`;
  protected _previousNativeValue: any;
  private _inputValueAccessor: {value: any};
  private _previousPlaceholder: string | null;
  private _errorStateTracker: _ErrorStateTracker;
  private _webkitBlinkWheelListenerAttached = false;

  /** Whether the component is being rendered on the server. */
  readonly _isServer: boolean;

  /** Whether the component is a native html select. */
  readonly _isNativeSelect: boolean;

  /** Whether the component is a textarea. */
  readonly _isTextarea: boolean;

  /** Whether the input is inside of a form field. */
  readonly _isInFormField: boolean;

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  focused: boolean = false;

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  readonly stateChanges: Subject<void> = new Subject<void>();

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  controlType: string = 'mat-input';

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  autofilled = false;

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);

    // Browsers may not fire the blur event if the input is disabled too quickly.
    // Reset from here to ensure that the element doesn't become stuck.
    if (this.focused) {
      this.focused = false;
      this.stateChanges.next();
    }
  }
  protected _disabled = false;

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input()
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value || this._uid;
  }
  protected _id: string;

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input() placeholder: string;

  /**
   * Name of the input.
   * @docs-private
   */
  @Input() name: string;

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input()
  get required(): boolean {
    return this._required ?? this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }
  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
  }
  protected _required: boolean | undefined;

  /** Input type of the element. */
  @Input()
  get type(): string {
    return this._type;
  }
  set type(value: string) {
    this._type = value || 'text';
    this._validateType();

    // When using Angular inputs, developers are no longer able to set the properties on the native
    // input element. To ensure that bindings for `type` work, we need to sync the setter
    // with the native property. Textarea elements don't support the type property or attribute.
    if (!this._isTextarea && getSupportedInputTypes().has(this._type)) {
      (this._elementRef.nativeElement as HTMLInputElement).type = this._type;
    }

    this._ensureWheelDefaultBehavior();
  }
  protected _type = 'text';

  /** An object used to control when error messages are shown. */
  @Input()
  get errorStateMatcher() {
    return this._errorStateTracker.matcher;
  }
  set errorStateMatcher(value: ErrorStateMatcher) {
    this._errorStateTracker.matcher = value;
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input('aria-describedby') userAriaDescribedBy: string;

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input()
  get value(): string {
    return this._inputValueAccessor.value;
  }
  set value(value: any) {
    if (value !== this.value) {
      this._inputValueAccessor.value = value;
      this.stateChanges.next();
    }
  }

  /** Whether the element is readonly. */
  @Input()
  get readonly(): boolean {
    return this._readonly;
  }
  set readonly(value: BooleanInput) {
    this._readonly = coerceBooleanProperty(value);
  }
  private _readonly = false;

  /** Whether the input is in an error state. */
  get errorState() {
    return this._errorStateTracker.errorState;
  }
  set errorState(value: boolean) {
    this._errorStateTracker.errorState = value;
  }

  protected _neverEmptyInputTypes = [
    'date',
    'datetime',
    'datetime-local',
    'month',
    'time',
    'week',
  ].filter(t => getSupportedInputTypes().has(t));

  constructor(
    protected _elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    protected _platform: Platform,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() parentForm: NgForm,
    @Optional() parentFormGroup: FormGroupDirective,
    defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional() @Self() @Inject(MAT_INPUT_VALUE_ACCESSOR) inputValueAccessor: any,
    private _autofillMonitor: AutofillMonitor,
    private _ngZone: NgZone,
    // TODO: Remove this once the legacy appearance has been removed. We only need
    // to inject the form field for determining whether the placeholder has been promoted.
    @Optional() @Inject(MAT_FORM_FIELD) protected _formField?: MatFormField,
  ) {
    const element = this._elementRef.nativeElement;
    const nodeName = element.nodeName.toLowerCase();

    // If no input value accessor was explicitly specified, use the element as the input value
    // accessor.
    this._inputValueAccessor = inputValueAccessor || element;

    this._previousNativeValue = this.value;

    // Force setter to be called in case id was not specified.
    this.id = this.id;

    // On some versions of iOS the caret gets stuck in the wrong place when holding down the delete
    // key. In order to get around this we need to "jiggle" the caret loose. Since this bug only
    // exists on iOS, we only bother to install the listener on iOS.
    if (_platform.IOS) {
      _ngZone.runOutsideAngular(() => {
        _elementRef.nativeElement.addEventListener('keyup', this._iOSKeyupListener);
      });
    }

    this._errorStateTracker = new _ErrorStateTracker(
      defaultErrorStateMatcher,
      ngControl,
      parentFormGroup,
      parentForm,
      this.stateChanges,
    );
    this._isServer = !this._platform.isBrowser;
    this._isNativeSelect = nodeName === 'select';
    this._isTextarea = nodeName === 'textarea';
    this._isInFormField = !!_formField;

    if (this._isNativeSelect) {
      this.controlType = (element as HTMLSelectElement).multiple
        ? 'mat-native-select-multiple'
        : 'mat-native-select';
    }
  }

  ngAfterViewInit() {
    if (this._platform.isBrowser) {
      this._autofillMonitor.monitor(this._elementRef.nativeElement).subscribe(event => {
        this.autofilled = event.isAutofilled;
        this.stateChanges.next();
      });
    }
  }

  ngOnChanges() {
    this.stateChanges.next();
  }

  ngOnDestroy() {
    this.stateChanges.complete();

    if (this._platform.isBrowser) {
      this._autofillMonitor.stopMonitoring(this._elementRef.nativeElement);
    }

    if (this._platform.IOS) {
      this._elementRef.nativeElement.removeEventListener('keyup', this._iOSKeyupListener);
    }

    if (this._webkitBlinkWheelListenerAttached) {
      this._elementRef.nativeElement.removeEventListener('wheel', this._webkitBlinkWheelListener);
    }
  }

  ngDoCheck() {
    if (this.ngControl) {
      // We need to re-evaluate this on every change detection cycle, because there are some
      // error triggers that we can't subscribe to (e.g. parent form submissions). This means
      // that whatever logic is in here has to be super lean or we risk destroying the performance.
      this.updateErrorState();

      // Since the input isn't a `ControlValueAccessor`, we don't have a good way of knowing when
      // the disabled state has changed. We can't use the `ngControl.statusChanges`, because it
      // won't fire if the input is disabled with `emitEvents = false`, despite the input becoming
      // disabled.
      if (this.ngControl.disabled !== null && this.ngControl.disabled !== this.disabled) {
        this.disabled = this.ngControl.disabled;
        this.stateChanges.next();
      }
    }

    // We need to dirty-check the native element's value, because there are some cases where
    // we won't be notified when it changes (e.g. the consumer isn't using forms or they're
    // updating the value using `emitEvent: false`).
    this._dirtyCheckNativeValue();

    // We need to dirty-check and set the placeholder attribute ourselves, because whether it's
    // present or not depends on a query which is prone to "changed after checked" errors.
    this._dirtyCheckPlaceholder();
  }

  /** Focuses the input. */
  focus(options?: FocusOptions): void {
    this._elementRef.nativeElement.focus(options);
  }

  /** Refreshes the error state of the input. */
  updateErrorState() {
    this._errorStateTracker.updateErrorState();
  }

  /** Callback for the cases where the focused state of the input changes. */
  _focusChanged(isFocused: boolean) {
    if (isFocused !== this.focused) {
      this.focused = isFocused;
      this.stateChanges.next();
    }
  }

  _onInput() {
    // This is a noop function and is used to let Angular know whenever the value changes.
    // Angular will run a new change detection each time the `input` event has been dispatched.
    // It's necessary that Angular recognizes the value change, because when floatingLabel
    // is set to false and Angular forms aren't used, the placeholder won't recognize the
    // value changes and will not disappear.
    // Listening to the input event wouldn't be necessary when the input is using the
    // FormsModule or ReactiveFormsModule, because Angular forms also listens to input events.
  }

  /** Does some manual dirty checking on the native input `value` property. */
  protected _dirtyCheckNativeValue() {
    const newValue = this._elementRef.nativeElement.value;

    if (this._previousNativeValue !== newValue) {
      this._previousNativeValue = newValue;
      this.stateChanges.next();
    }
  }

  /** Does some manual dirty checking on the native input `placeholder` attribute. */
  private _dirtyCheckPlaceholder() {
    const placeholder = this._getPlaceholder();
    if (placeholder !== this._previousPlaceholder) {
      const element = this._elementRef.nativeElement;
      this._previousPlaceholder = placeholder;
      placeholder
        ? element.setAttribute('placeholder', placeholder)
        : element.removeAttribute('placeholder');
    }
  }

  /** Gets the current placeholder of the form field. */
  protected _getPlaceholder(): string | null {
    return this.placeholder || null;
  }

  /** Make sure the input is a supported type. */
  protected _validateType() {
    if (
      MAT_INPUT_INVALID_TYPES.indexOf(this._type) > -1 &&
      (typeof ngDevMode === 'undefined' || ngDevMode)
    ) {
      throw getMatInputUnsupportedTypeError(this._type);
    }
  }

  /** Checks whether the input type is one of the types that are never empty. */
  protected _isNeverEmpty() {
    return this._neverEmptyInputTypes.indexOf(this._type) > -1;
  }

  /** Checks whether the input is invalid based on the native validation. */
  protected _isBadInput() {
    // The `validity` property won't be present on platform-server.
    let validity = (this._elementRef.nativeElement as HTMLInputElement).validity;
    return validity && validity.badInput;
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  get empty(): boolean {
    return (
      !this._isNeverEmpty() &&
      !this._elementRef.nativeElement.value &&
      !this._isBadInput() &&
      !this.autofilled
    );
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  get shouldLabelFloat(): boolean {
    if (this._isNativeSelect) {
      // For a single-selection `<select>`, the label should float when the selected option has
      // a non-empty display value. For a `<select multiple>`, the label *always* floats to avoid
      // overlapping the label with the options.
      const selectElement = this._elementRef.nativeElement as HTMLSelectElement;
      const firstOption: HTMLOptionElement | undefined = selectElement.options[0];

      // On most browsers the `selectedIndex` will always be 0, however on IE and Edge it'll be
      // -1 if the `value` is set to something, that isn't in the list of options, at a later point.
      return (
        this.focused ||
        selectElement.multiple ||
        !this.empty ||
        !!(selectElement.selectedIndex > -1 && firstOption && firstOption.label)
      );
    } else {
      return this.focused || !this.empty;
    }
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
    // Do not re-focus the input element if the element is already focused. Otherwise it can happen
    // that someone clicks on a time input and the cursor resets to the "hours" field while the
    // "minutes" field was actually clicked. See: https://github.com/angular/components/issues/12849
    if (!this.focused) {
      this.focus();
    }
  }

  /** Whether the form control is a native select that is displayed inline. */
  _isInlineSelect(): boolean {
    const element = this._elementRef.nativeElement as HTMLSelectElement;
    return this._isNativeSelect && (element.multiple || element.size > 1);
  }

  private _iOSKeyupListener = (event: Event): void => {
    const el = event.target as HTMLInputElement;

    // Note: We specifically check for 0, rather than `!el.selectionStart`, because the two
    // indicate different things. If the value is 0, it means that the caret is at the start
    // of the input, whereas a value of `null` means that the input doesn't support
    // manipulating the selection range. Inputs that don't support setting the selection range
    // will throw an error so we want to avoid calling `setSelectionRange` on them. See:
    // https://html.spec.whatwg.org/multipage/input.html#do-not-apply
    if (!el.value && el.selectionStart === 0 && el.selectionEnd === 0) {
      // Note: Just setting `0, 0` doesn't fix the issue. Setting
      // `1, 1` fixes it for the first time that you type text and
      // then hold delete. Toggling to `1, 1` and then back to
      // `0, 0` seems to completely fix it.
      el.setSelectionRange(1, 1);
      el.setSelectionRange(0, 0);
    }
  };

  private _webkitBlinkWheelListener = (): void => {
    // This is a noop function and is used to enable mouse wheel input
    // on number inputs
    // on blink and webkit browsers.
  };

  /**
   * In blink and webkit browsers a focused number input does not increment or decrement its value
   * on mouse wheel interaction unless a wheel event listener is attached to it or one of its ancestors or a passive wheel listener is attached somewhere in the DOM.
   * For example: Hitting a tooltip once enables the mouse wheel input for all number inputs as long as it exists.
   * In order to get reliable and intuitive behavior we apply a wheel event on our own
   * thus making sure increment and decrement by mouse wheel works every time.
   * @docs-private
   */
  private _ensureWheelDefaultBehavior(): void {
    if (
      !this._webkitBlinkWheelListenerAttached &&
      this._type === 'number' &&
      (this._platform.BLINK || this._platform.WEBKIT)
    ) {
      this._ngZone.runOutsideAngular(() => {
        this._elementRef.nativeElement.addEventListener('wheel', this._webkitBlinkWheelListener);
      });
      this._webkitBlinkWheelListenerAttached = true;
    }

    if (this._webkitBlinkWheelListenerAttached && this._type !== 'number') {
      this._elementRef.nativeElement.removeEventListener('wheel', this._webkitBlinkWheelListener);
      this._webkitBlinkWheelListenerAttached = true;
    }
  }
}
