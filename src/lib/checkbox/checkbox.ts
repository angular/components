import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  Output,
  Renderer,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {coerceBooleanProperty} from '../core/coercion/boolean-property';
import {Subscription} from 'rxjs/Subscription';
import {FocusOriginMonitor, MdRipple, RippleRef} from '../core';


/** Monotonically increasing integer used to auto-generate unique ids for checkbox components. */
let nextId = 0;

/**
 * Provider Expression that allows md-checkbox to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MD_CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdCheckbox),
  multi: true
};

/**
 * Represents the different states that require custom transitions between them.
 * @docs-private
 */
export enum TransitionCheckState {
  /** The initial state of the component before any user interaction. */
  Init,
  /** The state representing the component when it's becoming checked. */
  Checked,
  /** The state representing the component when it's becoming unchecked. */
  Unchecked,
  /** The state representing the component when it's becoming indeterminate. */
  Indeterminate
}

/** Change event object emitted by MdCheckbox. */
export class MdCheckboxChange {
  /** The source MdCheckbox of the event. */
  source: MdCheckbox;
  /** The new `checked` value of the checkbox. */
  checked: boolean;
}

/**
 * A material design checkbox component. Supports all of the functionality of an HTML5 checkbox,
 * and exposes a similar API. A MdCheckbox can be either checked, unchecked, indeterminate, or
 * disabled. Note that all additional accessibility attributes are taken care of by the component,
 * so there is no need to provide them yourself. However, if you want to omit a label and still
 * have the checkbox be accessible, you may supply an [aria-label] input.
 * See: https://www.google.com/design/spec/components/selection-controls.html
 */
@Component({
  moduleId: module.id,
  selector: 'md-checkbox, mat-checkbox',
  templateUrl: 'checkbox.html',
  styleUrls: ['checkbox.css'],
  host: {
    '[class.mat-checkbox]': 'true',
    '[class.mat-checkbox-indeterminate]': 'indeterminate',
    '[class.mat-checkbox-checked]': 'checked',
    '[class.mat-checkbox-disabled]': 'disabled',
    '[class.mat-checkbox-label-before]': 'labelPosition == "before"',
  },
  providers: [MD_CHECKBOX_CONTROL_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdCheckbox implements ControlValueAccessor, AfterViewInit, OnDestroy {
  /**
   * Whether or not the checkbox should appear before or after the label.
   * @deprecated
   */
  @Input()
  get align(): 'start' | 'end' {
    // align refers to the checkbox relative to the label, while labelPosition refers to the
    // label relative to the checkbox. As such, they are inverted.
    return this.labelPosition == 'after' ? 'start' : 'end';
  }

  set align(v) {
    this.labelPosition = (v == 'start') ? 'after' : 'before';
  }

  /**
   * Attached to the aria-label attribute of the host element. In most cases, arial-labelledby will
   * take precedence so this may be omitted.
   */
  @Input('aria-label') ariaLabel: string = '';

  /**
   * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
   */
  @Input('aria-labelledby') ariaLabelledby: string = null;

  /**
   * Whether the checkbox is checked. Note that setting `checked` will immediately set
   * `indeterminate` to false.
   */
  @Input() get checked() {
    return this._checked;
  }

  set checked(checked: boolean) {
    if (checked != this.checked) {
      if (this._indeterminate) {
        Promise.resolve().then(() => {
          this._indeterminate = false;
          this.indeterminateChange.emit(this._indeterminate);
        });
      }
      this._checked = checked;
      this._changeDetectorRef.markForCheck();
    }
  }

  /** The color of the button. Can be `primary`, `accent`, or `warn`. */
  @Input()
  get color(): string {
    return this._color;
  }

  set color(value: string) {
    this._updateColor(value);
  }

  /** Whether the checkbox is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value) {
    this._disabled = coerceBooleanProperty(value);
  }

  /** Whether the ripple effect for this checkbox is disabled. */
  @Input()
  get disableRipple(): boolean {
    return this._disableRipple;
  }

  set disableRipple(value) {
    this._disableRipple = coerceBooleanProperty(value);
  }

  /** A unique id for the checkbox. If one is not supplied, it is auto-generated. */
  @Input() id: string = `md-checkbox-${++nextId}`;

  /** ID of the native input element inside `<md-checkbox>` */
  get inputId(): string {
    return `input-${this.id}`;
  }

  /**
   * Whether the checkbox is indeterminate. This is also known as "mixed" mode and can be used to
   * represent a checkbox with three states, e.g. a checkbox that represents a nested list of
   * checkable items. Note that whenever `checked` is set, indeterminate is immediately set to
   * false. This differs from the web platform in that indeterminate state on native
   * checkboxes is only remove when the user manually checks the checkbox (rather than setting the
   * `checked` property programmatically). However, we feel that this behavior is more accommodating
   * to the way consumers would envision using this component.
   */
  @Input() get indeterminate() {
    return this._indeterminate;
  }

  set indeterminate(indeterminate: boolean) {
    let changed =  indeterminate != this._indeterminate;
    this._indeterminate = indeterminate;

    if (changed) {
      if (this._indeterminate) {
        this._transitionCheckState(TransitionCheckState.Indeterminate);
      } else {
        this._transitionCheckState(
          this.checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);
      }
      this.indeterminateChange.emit(this._indeterminate);
    }
  }

  /** Whether the label should appear after or before the checkbox. Defaults to 'after' */
  @Input() labelPosition: 'before' | 'after' = 'after';

  /** Name value will be applied to the input element if present */
  @Input() name: string = null;

  /** Whether the checkbox is required. */
  @Input()
  get required(): boolean {
    return this._required;
  }

  set required(value) {
    this._required = coerceBooleanProperty(value);
  }

  /** Tabindex value that is passed to the underlying input element. */
  @Input() tabIndex: number = 0;

  /** The value attribute of the native input element */
  @Input() value: string ;

  /** Event emitted when the checkbox's `checked` value changes. */
  @Output() change: EventEmitter<MdCheckboxChange> = new EventEmitter<MdCheckboxChange>();

  /** Event emitted when the checkbox's `indeterminate` value changes. */
  @Output() indeterminateChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** The native `<input type="checkbox"> element */
  @ViewChild('input') _inputElement: ElementRef;

  @ViewChild(MdRipple) _ripple: MdRipple;

  /**
   * Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor.
   * @docs-private
   */
  onTouched: () => any = () => {};

  private _checked: boolean = false;
  private _color: string;
  private _controlValueAccessorChangeFn: (value: any) => void = (value) => {};
  private _currentAnimationClass: string = '';
  private _currentCheckState: TransitionCheckState = TransitionCheckState.Init;
  private _disabled: boolean = false;
  /** Whether the ripple effect on click should be disabled. */
  private _disableRipple: boolean;
  /** Reference to the focused state ripple. */
  private _focusedRipple: RippleRef;
  /** Reference to the focus origin monitor subscription. */
  private _focusedSubscription: Subscription;
  private _indeterminate: boolean = false;
  private _required: boolean;

  constructor(private _changeDetectorRef: ChangeDetectorRef,
              private _elementRef: ElementRef,
              private _focusOriginMonitor: FocusOriginMonitor,
              private _renderer: Renderer) {
    this.color = 'accent';
  }

  ngAfterViewInit() {
    this._focusedSubscription = this._focusOriginMonitor
      .monitor(this._inputElement.nativeElement, this._renderer, false)
      .subscribe(focusOrigin => {
        if (!this._focusedRipple && (focusOrigin === 'keyboard' || focusOrigin === 'program')) {
          this._focusedRipple = this._ripple.launch(0, 0, { persistent: true, centered: true });
        }
      });
  }

  ngOnDestroy() {
    this._focusOriginMonitor.stopMonitoring(this._inputElement.nativeElement);
  }

  /** Focuses the checkbox. */
  focus(): void {
    this._focusOriginMonitor.focusVia(this._inputElement.nativeElement, this._renderer, 'program');
  }

  /**
   * Registers a callback to be triggered when the value has changed.
   * Implemented as part of ControlValueAccessor.
   * @param fn Function to be called on change.
   */
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  /**
   * Registers a callback to be triggered when the control has been touched.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be triggered when the checkbox is touched.
   */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  /**
   * Sets the checkbox's disabled state. Implemented as a part of ControlValueAccessor.
   * @param isDisabled Whether the checkbox should be disabled.
   */
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  /** Toggles the `checked` state of the checkbox. */
  toggle(): void {
    this.checked = !this.checked;
  }

  /**
   * Sets the model value. Implemented as part of ControlValueAccessor.
   * @param value Value to be set to the model.
   */
  writeValue(value: any) {
    this.checked = !!value;
  }

  _isRippleDisabled() {
    return this.disableRipple || this.disabled;
  }

  /** Informs the component when we lose focus in order to style accordingly */
  _onInputBlur() {
    this._removeFocusedRipple();
    this.onTouched();
  }

  /**
   * Event handler for checkbox input element.
   * Toggles checked state if element is not disabled.
   * Do not toggle on (change) event since IE doesn't fire change event when
   *   indeterminate checkbox is clicked.
   * @param event
   */
  _onInputClick(event: Event) {
    // We have to stop propagation for click events on the visual hidden input element.
    // By default, when a user clicks on a label element, a generated click event will be
    // dispatched on the associated input element. Since we are using a label element as our
    // root container, the click event on the `checkbox` will be executed twice.
    // The real click event will bubble up, and the generated click event also tries to bubble up.
    // This will lead to multiple click events.
    // Preventing bubbling for the second event will solve that issue.
    event.stopPropagation();

    this._removeFocusedRipple();

    if (!this.disabled) {
      this.toggle();
      this._transitionCheckState(
        this._checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);

      // Emit our custom change event if the native input emitted one.
      // It is important to only emit it, if the native input triggered one, because
      // we don't want to trigger a change event, when the `checked` variable changes for example.
      this._emitChangeEvent();
    }
  }

  _onInteractionEvent(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    event.stopPropagation();
  }

  _setElementColor(color: string, isAdd: boolean) {
    if (color != null && color != '') {
      this._renderer.setElementClass(this._elementRef.nativeElement, `mat-${color}`, isAdd);
    }
  }

  _updateColor(newColor: string) {
    this._setElementColor(this._color, false);
    this._setElementColor(newColor, true);
    this._color = newColor;
  }

  private _emitChangeEvent() {
    let event = new MdCheckboxChange();
    event.source = this;
    event.checked = this.checked;

    this._controlValueAccessorChangeFn(this.checked);
    this.change.emit(event);
  }

  private _getAnimationClassForCheckStateTransition(
    oldState: TransitionCheckState, newState: TransitionCheckState): string {
    let animSuffix: string;

    switch (oldState) {
      case TransitionCheckState.Init:
        // Handle edge case where user interacts with checkbox that does not have [(ngModel)] or
        // [checked] bound to it.
        if (newState === TransitionCheckState.Checked) {
          animSuffix = 'unchecked-checked';
        } else if (newState == TransitionCheckState.Indeterminate) {
          animSuffix = 'unchecked-indeterminate';
        } else {
          return '';
        }
        break;
      case TransitionCheckState.Unchecked:
        animSuffix = newState === TransitionCheckState.Checked ?
          'unchecked-checked' : 'unchecked-indeterminate';
        break;
      case TransitionCheckState.Checked:
        animSuffix = newState === TransitionCheckState.Unchecked ?
          'checked-unchecked' : 'checked-indeterminate';
        break;
      case TransitionCheckState.Indeterminate:
        animSuffix = newState === TransitionCheckState.Checked ?
          'indeterminate-checked' : 'indeterminate-unchecked';
    }

    return `mat-checkbox-anim-${animSuffix}`;
  }

  /** Fades out the focused state ripple. */
  private _removeFocusedRipple(): void {
    if (this._focusedRipple) {
      this._focusedRipple.fadeOut();
      this._focusedRipple = null;
    }
  }

  private _transitionCheckState(newState: TransitionCheckState) {
    let oldState = this._currentCheckState;
    let renderer = this._renderer;
    let elementRef = this._elementRef;

    if (oldState === newState) {
      return;
    }
    if (this._currentAnimationClass.length > 0) {
      renderer.setElementClass(elementRef.nativeElement, this._currentAnimationClass, false);
    }

    this._currentAnimationClass = this._getAnimationClassForCheckStateTransition(
        oldState, newState);
    this._currentCheckState = newState;

    if (this._currentAnimationClass.length > 0) {
      renderer.setElementClass(elementRef.nativeElement, this._currentAnimationClass, true);
    }
  }
}
