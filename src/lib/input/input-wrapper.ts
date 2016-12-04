import {
  Component,
  Input,
  Directive,
  AfterContentInit,
  ContentChild,
  ContentChildren,
  ElementRef,
  QueryList,
  ViewEncapsulation,
  HostListener,
  HostBinding,
  Optional,
  Output,
  EventEmitter
} from "@angular/core";
import {MdError, coerceBooleanProperty} from "../core";
import {NgModel} from "@angular/forms";


// Invalid input type. Using one of these will throw an MdInputWrapperUnsupportedTypeError.
const MD_INPUT_INVALID_TYPES = [
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit'
];


const MD_INPUT_NEVER_EMPTY_TYPES = [
  'datetime',
  'datetime-local',
  'month',
  'time',
  'week'
];


let nextUniqueId = 0;


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
  selector: 'md-hint'
})
export class MdHint {
  // Whether to align the hint label at the start or end of the line.
  @Input() align: 'start' | 'end' = 'start';

  @HostBinding('class.mdHint') private _hintClass = true;

  @HostBinding('class.md-right') private _alignRightClass = this.align == 'end';
}


/** The input directive, used to mark the input that `MdInputWrapper` is wrapping. */
@Directive({
  selector: '[md-input]'
})
export class MdInputDirective {
  @Input() disabled = false;

  @Input() @HostBinding()
  get id() { return this._id; };
  set id(value: string) { this._id = value || this._uid; }
  private _id: string;

  @Input()
  get placeholder() { return this._placeholder; }
  set placeholder(value: string) {
    if (this._placeholder != value) {
      this._placeholder = value;
      this.placeholderChange.emit(this._placeholder);
    }
  }
  private _placeholder = '';

  @Input() required = false;

  @Input()
  get type() { return this._type; }
  set type(value: string) {
    this._type = value || 'text';
    this._validateType();
  }
  private _type = 'text';

  @Output() placeholderChange: EventEmitter<string>;

  @HostBinding('class.md-input-element') private _inputElementClass = true;

  @HostListener('focus') private _onFocus() { this.focused = true; }

  @HostListener('blur') private _onBlur() { this.focused = false; }

  @HostListener('input', ['$event']) private _onInput(event: Event) { this._value = (event.target as any).value; }

  get empty() { return (this._value == null || this._value == '') && !this._isNeverEmpty(); }

  focused = false;

  private get _uid() { return this._cachedUid = this._cachedUid || `md-input-${nextUniqueId++}`; }
  private _cachedUid: string;

  private _value: any;

  constructor(private _elementRef: ElementRef, @Optional() private _ngModel: NgModel) {
    // Force setter to be called in case id was not specified.
    this.id = this.id;

    if (this._ngModel) {
      this._ngModel.valueChanges.subscribe((value) => {
        this._value = value;
      });
    }
  }

  /** Focus the input element. */
  focus() { this._elementRef.nativeElement.focus(); }

  /** Make sure the input is a supported type. */
  private _validateType() {
    if (MD_INPUT_INVALID_TYPES.indexOf(this._type) != -1) {
      throw new MdInputWrapperUnsupportedTypeError(this._type);
    }
  }

  private _isNeverEmpty() {
    return MD_INPUT_NEVER_EMPTY_TYPES.indexOf(this._type) != -1;
  }
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
  encapsulation: ViewEncapsulation.None,
})
export class MdInputWrapper implements AfterContentInit {
  @Input() align: 'start' | 'end' = 'start';

  @Input() dividerColor: 'primary' | 'accent' | 'warn' = 'primary';

  @Input()
  get hintLabel() { return this._hintLabel; }
  set hintLabel(value: string) {
    this._hintLabel = value;
    this._validateHints();
  }
  private _hintLabel = '';

  @Input()
  get floatingPlaceholder(): boolean { return this._floatingPlaceholder; }
  set floatingPlaceholder(value) { this._floatingPlaceholder = coerceBooleanProperty(value); }
  private _floatingPlaceholder: boolean = true;

  // Remove align attribute to prevent it from interfering with layout.
  @HostBinding('attr.align') private _align: string = null;

  @HostListener('click') private _focusInput() { this._mdInput.focus(); }

  @ContentChild(MdInputDirective) _mdInput: MdInputDirective;

  @ContentChild(MdPlaceholder) _placeholderChild: MdPlaceholder;

  @ContentChildren(MdHint) _hintChildren: QueryList<MdHint>;

  ngAfterContentInit() {
    this._validateHints();
    this._validatePlaceholders();

    // Re-validate when things change.
    this._hintChildren.changes.subscribe(() => {
      this._validateHints();
    });
    this._mdInput.placeholderChange.subscribe(() => {
      this._validatePlaceholders();
    })
  }

  /** Whether the input has a placeholder. */
  _hasPlaceholder(): boolean { return !!this._mdInput.placeholder || !!this._placeholderChild; }

  /**
   * Ensure that there is only one placeholder (either `input` attribute or child element with the
   * `md-placeholder` attribute.
   */
  private _validatePlaceholders() {
    if (this._mdInput.placeholder && this._placeholderChild) {
      throw new MdInputWrapperPlaceholderConflictError();
    }
  }

  /**
   * Ensure that there is a maximum of one of each `<md-hint>` alignment specified, with the
   * attribute being considered as `align="start"`.
   */
  private _validateHints() {
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
