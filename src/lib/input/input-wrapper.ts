import {
  Component,
  Input,
  Directive,
  AfterContentInit,
  ContentChild,
  SimpleChange,
  ContentChildren,
  ElementRef,
  QueryList,
  OnChanges,
  ViewEncapsulation
} from '@angular/core';
import {MdError, coerceBooleanProperty} from '../core';
import {NgModel} from '@angular/forms';


// Invalid input type. Using one of these will throw an MdInputWrapperUnsupportedTypeError.
const MD_INPUT_INVALID_INPUT_TYPE = [
  'file',
  'radio',
  'checkbox',
];


let nextUniqueId = 0;


export class MdInputWrapperInputElementCountError extends MdError {
  constructor(count: number) {
    super(`md-input-wrapper must contain exactly 1 input or textarea element. Found ${count}.`);
  }
}

export class MdInputWrapperPlaceholderConflictError extends MdError {
  constructor() {
    super('Placeholder attribute and child element were both specified.');
  }
}

export class MdInputWrapperUnsupportedTypeError extends MdError {
  constructor(type: string) {
    super(`Input type "${type}" isn't supported by md-input-wrapper.`);
  }
}

export class MdInputWrapperDuplicatedHintError extends MdError {
  constructor(align: string) {
    super(`A hint was already declared for 'align="${align}"'.`);
  }
}

/**
 * The placeholder directive. The content can declare this to implement more
 * complex placeholders.
 */
@Directive({
  selector: 'md-placeholder'
})
export class MdPlaceholder {}


/** The hint directive, used to tag content as hint labels (going under the input). */
@Directive({
  selector: 'md-hint',
  host: {
    '[class.md-right]': 'align == "end"',
    '[class.md-hint]': 'true'
  }
})
export class MdHint {
  // Whether to align the hint label at the start or end of the line.
  @Input() align: 'start' | 'end' = 'start';
}


/**
 * Component that represents a text input. It encapsulates the <input> HTMLElement and
 * improve on its behaviour, along with styling it according to the Material Design.
 */
@Component({
  moduleId: module.id,
  selector: 'md-input-wrapper',
  templateUrl: 'input-wrapper.html',
  styleUrls: ['input.css', 'input-wrapper.css'],
  host: {
    '(click)' : '_focusInput()',
    // remove align attribute to prevent it from interfering with layout.
    '[attr.align]': 'null',
  },
  encapsulation: ViewEncapsulation.None,
})
export class MdInputWrapper implements AfterContentInit, OnChanges {
  @Input() align: 'start' | 'end' = 'start';

  @Input() dividerColor: 'primary' | 'accent' | 'warn' = 'primary';

  @Input() hintLabel: string = '';

  @Input()
  get floatingPlaceholder(): boolean { return this._floatingPlaceholder; }
  set floatingPlaceholder(value) { this._floatingPlaceholder = coerceBooleanProperty(value); }
  private _floatingPlaceholder: boolean = true;

  @ContentChild(MdPlaceholder) _placeholderChild: MdPlaceholder;

  @ContentChildren(MdHint) _hintChildren: QueryList<MdHint>;

  @ContentChild(NgModel) _ngModelChild: NgModel;

  /** Whether the `input` or `textarea` is focused. */
  _focused = false;

  /** The disabled attribute of the `input` or `textarea`. */
  _inputDisabled = false;

  /** The id attribute of the `input` or `textarea`. */
  _inputId = '';

  /** The required attribute of the `input` or `textarea`. */
  _inputRequired = false;

  /** Whether the `input` or `textarea` is empty. */
  get _empty(): boolean { return (!this._inputValue) && this._inputType !== 'date'; }

  /** The placeholder attribute of the `input` or `textarea`. */
  get _inputPlaceholder(): string { return this.__inputPlaceholder; }
  set _inputPlaceholder(value: string) {
    this.__inputPlaceholder = value;
    this._validatePlaceholders();
  }
  private __inputPlaceholder = '';

  /** The type attribute of the `input` (or "text" if element is a `textarea`). */
  private get _inputType(): string { return this.__inputType; }
  private set _inputType(value: string) {
    this.__inputType = value || 'text';
    this._validateInputType();
  }
  private __inputType = 'text';

  /** The value of the `input` or `textarea`. */
  private _inputValue = '';

  /** The native `input` or `textarea` element. */
  private _inputElement: HTMLInputElement | HTMLTextAreaElement;

  /** A `MutationObserver` to observe the `input` or `textarea`. */
  private _inputObserver = new MutationObserver(mutations => {
    for (let mutation of mutations) {
      switch (mutation.attributeName) {
        case 'disabled':
          this._inputDisabled = this._inputElement.disabled;
          break;
        case 'id':
          this._inputId = this._inputElement.id;
          break;
        case 'type':
          this._inputType = this._inputElement.type;
          break;
        case 'placeholder':
          this._inputPlaceholder = this._inputElement.placeholder;
          break;
        case 'required':
          this._inputRequired = this._inputElement.required;
          break;
      }
    }
  });

  /** A map of event listeners to install on the `input` or `textarea`. */
  private _inputListeners: { [key: string]: () => void } = {
    'blur': () => { this._focused = false; },
    'focus': () => { this._focused = true; },
    'input': () => { this._inputValue = this._inputElement.value; }
  };

  constructor(private _elementRef: ElementRef) {}

  ngAfterContentInit() {
    this._initInputEl();
    this._validateHints();

    // Trigger validation when the hint children change.
    this._hintChildren.changes.subscribe(() => {
      this._validateHints();
    });
  }

  ngOnChanges(changes: {[key: string]: SimpleChange}) {
    if (changes['hintLabel']) {
      this._validateHints();
    }
  }

  /** Set focus on the input element. */
  _focusInput() {
    this._inputElement && this._inputElement.focus();
  }

  /** Whether the input has a placeholder. */
  _hasPlaceholder(): boolean {
    return !!this._inputPlaceholder || !!this._placeholderChild;
  }

  /** Initialize the `input` or `textarea` element. */
  private _initInputEl() {
    // Find input or textarea element.
    let inputEls = this._elementRef.nativeElement.querySelectorAll('input, textarea');
    if (inputEls.length != 1) {
      new MdInputWrapperInputElementCountError(inputEls.length);
    }
    this._inputElement = inputEls[0];

    // Install mutation observer and event listeners and subscribe to ngModel changes.
    this._inputObserver.observe(this._inputElement, {
      attributes: true,
      attributeFilter: ['disabled', 'id', 'type', 'placeholder', 'required']
    });
    for (let eventType in this._inputListeners) {
      this._inputElement.addEventListener(eventType, this._inputListeners[eventType]);
    }
    if (this._ngModelChild) {
      this._ngModelChild.valueChanges.subscribe(() => {
        this._inputValue = this._inputElement.value;
      });
    }

    // Add additional classes and attributes.
    this._inputElement.classList.add('md-input-element');
    this._inputElement.id = this._inputElement.id || `md-input-${nextUniqueId++}`;

    // Record initial values for attributes we observe.
    this._inputDisabled = this._inputElement.disabled;
    this._inputId = this._inputElement.id;
    this._inputType = this._inputElement.type;
    this._inputRequired = this._inputElement.required;
    this._inputPlaceholder = this._inputElement.placeholder;
    this._inputValue = this._inputElement.value;
  }

  /** Ensure that the type of the input is a supported type. */
  private _validateInputType() {
    if (MD_INPUT_INVALID_INPUT_TYPE.indexOf(this._inputType) != -1) {
      throw new MdInputWrapperUnsupportedTypeError(this._inputType);
    }
  }

  /**
   * Ensure that there is only one placeholder (either `input` attribute or child element with the
   * `md-placeholder` attribute.
   */
  private _validatePlaceholders() {
    if (this._inputPlaceholder && this._placeholderChild) {
      throw new MdInputWrapperPlaceholderConflictError();
    }
  }

  /**
   * Ensure that there is a maximum of one of each `<md-hint>` alignment specified, with the
   * attribute being considered as `align="start"`.
   */
  private _validateHints() {
    if (this._hintChildren) {
      // Validate the hint labels.
      let startHint: MdHint = null;
      let endHint: MdHint = null;
      this._hintChildren.forEach((hint: MdHint) => {
        if (hint.align == 'start') {
          if (startHint || this.hintLabel) {
            throw new MdInputWrapperDuplicatedHintError('start');
          }
          startHint = hint;
        } else if (hint.align == 'end') {
          if (endHint) {
            throw new MdInputWrapperDuplicatedHintError('end');
          }
          endHint = hint;
        }
      });
    }
  }
}
