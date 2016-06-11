import {
  Component,
  Directive,
  EventEmitter,
  HostBinding,
  Input,
  Optional,
  Output,
  Provider,
  ViewEncapsulation,
  forwardRef
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor
} from '@angular/common';
import {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';


// Re-exports.
export {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';


/**
 * Provider Expression that allows md-radio-group to register as a ControlValueAccessor. This
 * allows it to support [(ngModel)] and ngControl.
 */
const MD_RADIO_GROUP_CONTROL_VALUE_ACCESSOR = new Provider(
    NG_VALUE_ACCESSOR, {
      useExisting: forwardRef(() => MdRadioGroup),
      multi: true
    });

// TODO(mtlin):
// Ink ripple is currently placeholder.
// Determine motion spec for button transitions.
// Design review.
// RTL
// Support forms API.
// Use ChangeDetectionStrategy.OnPush
var _uniqueIdCounter = 0;

@Directive({
  selector: 'md-radio-group',
  providers: [MD_RADIO_GROUP_CONTROL_VALUE_ACCESSOR],
  host: {
    'role': 'radiogroup',
  },
})
export class MdRadioGroup implements ControlValueAccessor {
  /**
   * Selected value for group. Should equal the value of the selected radio button if there *is*
   * a corresponding radio button with a matching value. If there is *not* such a corresponding
   * radio button, this value persists to be applied in case a new radio button is added with a
   * matching value.
   */
  private _value: any = null;

  /** The HTML name attribute applied to radio buttons in this group. */
  private _name: string = `md-radio-group-${_uniqueIdCounter++}`;

  /** Disables all individual radio buttons assigned to this group. */
  private _disabled: boolean = false;

  /** The currently selected radio button. Should match value. */
  private _selected: MdRadioButton = null;

  /** Whether the `value` has been set to its initial value. */
  private _isInitialized: boolean = false;

  /** The method to be called in order to update ngModel */
  private _controlValueAccessorChangeFn: (value: any) => void = (value) => {};

  /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
  onTouched: () => any = () => {};

  /** The unique ID for the radio group. */
  get id() {
    return this._name;
  }

  /** Event emitted when the group value changes. */
  @Output()
  valueChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() align: 'start' | 'end';

  @Input()
  get name(): string {
    return this._name;
  }

  set name(val: string) {
    this._name = val;
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value) {
    // The presence of *any* disabled value makes the component disabled, *except* for false.
    this._disabled = (value != null && value !== false) ? true : null;
  }

  @Input()
  get value(): any {
    return this._value;
  }

  set value(newValue: any) {
    if (this._value != newValue) {
      // Set this before proceeding to ensure no circular loop occurs with selection.
      this._value = newValue;
      this.radioDispatcher.notify(this.id, this.name, this._value);
      this._emitChangeEvent();
    }
  }

  constructor(public radioDispatcher: MdUniqueSelectionDispatcher) {}

  /**
   * Mark this group as being "touched" (for ngModel). Meant to be called by the contained
   * radio buttons upon their blur.
   * @internal
   */
  touch() {
    if (this.onTouched) {
      this.onTouched();
    }
  }

  /** Dispatch change event with current selection and group value. */
  private _emitChangeEvent(): void {
    this._controlValueAccessorChangeFn(this.value);
    this.valueChange.emit(this.value);
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  writeValue(value: any) {
    this.value = value;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }
}


@Component({
  moduleId: module.id,
  selector: 'md-radio-button',
  templateUrl: 'radio.html',
  styleUrls: ['radio.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '(click)': 'onClick($event)'
  }
})
export class MdRadioButton {
  @HostBinding('class.md-radio-focused')
  private _isFocused: boolean;

  /** Whether this radio is checked. */
  private _checked: boolean = false;

 /** The HTML name attribute applied to the radio button. */
  private _name: string;

  /** The unique ID for the radio button. */
  @HostBinding('id')
  @Input()
  id: string = `md-radio-${_uniqueIdCounter++}`;

  /** Analog to HTML 'name' attribute used to group radios for unique selection. */
  @Input()
  get name() {
    return (this._radioGroup && this._radioGroup.name) || this._name;
  }

  set name(name) {
    this._name = name;
  }

  /** Used to set the 'aria-label' attribute on the underlying input element. */
  @Input('aria-label') ariaLabel: string;

  /** The 'aria-labelledby' attribute takes precedence as the element's text alternative. */
  @Input('aria-labelledby') ariaLabelledby: string;

  /** Whether this radio is disabled. */
  private _disabled: boolean;

  /** Value assigned to this radio.*/
  private _value: any = null;

  /** The parent radio group. May or may not be present. */
  private _radioGroup: MdRadioGroup;

  /** Event emitted when the group value changes. */
  @Output()
  valueChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(@Optional() radioGroup: MdRadioGroup,
              public radioDispatcher: MdUniqueSelectionDispatcher) {
    // Assertions. Ideally these should be stripped out by the compiler.
    this._radioGroup = radioGroup;

    radioDispatcher.listen((id: string, name: string, value: any) => {
      if (id != this.id && name == this.name) {
        this._checked = false;
      }
      if (this._radioGroup && id == this._radioGroup.id) {
        this._checked = (this.value == value);
      }
    });
  }

  @HostBinding('class.md-radio-checked')
  @Input()
  get checked(): boolean {
    return this._checked;
  }

  set checked(newCheckedState: boolean) {
    this.radioDispatcher.notify(this.id, this.name);

    if (newCheckedState != this._checked) {
      this._emitChangeEvent();
      if (this._radioGroup) {
        this._radioGroup.value = (newCheckedState || null) && this.value;
      }
    }

    this._checked = newCheckedState;
  }

  @Input()
  get value(): any {
    return this._value;
  }

  set value(value: any) {
    if (this._value != value) {
      this._value = value;
      if (this._radioGroup) {
        if (this.checked) {
          this._radioGroup.value = value;
        }
        if (this._radioGroup.value == value) {
          this.checked = true;
        }
      }
    }
  }

  private _align: 'start' | 'end';

  @Input()
  get align(): 'start' | 'end' {
    return this._align || (this._radioGroup && this._radioGroup.align) || 'start';
  }

  set align(value: 'start' | 'end') {
    this._align = value;
  }

  @HostBinding('class.md-radio-disabled')
  @Input()
  get disabled(): boolean {
    return this._disabled || (this._radioGroup && this._radioGroup.disabled);
  }

  set disabled(value: boolean) {
    // The presence of *any* disabled value makes the component disabled, *except* for false.
    this._disabled = (value != null && value !== false) ? true : null;
  }

  /** Dispatch change event with current value. */
  private _emitChangeEvent(): void {
    this.valueChange.emit(this.value);
  }

  /** @internal */
  onClick(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (this._radioGroup) {
      this._radioGroup.touch();
    }

    this.checked = true;
  }

  /**
   * We use a hidden native input field to handle changes to focus state via keyboard navigation,
   * with visual rendering done separately. The native element is kept in sync with the overall
   * state of the component.
   * @internal
   */
  onInputFocus() {
    this._isFocused = true;
  }

  /** @internal */
  onInputBlur() {
    this._isFocused = false;
    if (this._radioGroup) {
      this._radioGroup.touch();
    }
  }

  /**
   * Checks the radio due to an interaction with the underlying native <input type="radio">
   * @internal
   */
  onInputChange(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    event.stopPropagation();

    this.checked = true;
    if (this._radioGroup) {
      this._radioGroup.touch();
    }
  }
}

export const MD_RADIO_DIRECTIVES = [MdRadioGroup, MdRadioButton];
